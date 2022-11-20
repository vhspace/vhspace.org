import cdk = require("aws-cdk-lib");
import ec2 = require("aws-cdk-lib/aws-ec2");
import es = require("aws-cdk-lib/aws-elasticsearch");
import ecs = require("aws-cdk-lib/aws-ecs");
import s3 = require("aws-cdk-lib/aws-s3");
import elbv2 = require("aws-cdk-lib/aws-elasticloadbalancingv2");
import route53 = require("aws-cdk-lib/aws-route53");
import certificateManager = require("aws-cdk-lib/aws-certificatemanager");
import { Port } from "aws-cdk-lib/aws-ec2";
import { Protocol } from "aws-cdk-lib/aws-ecs";
import { ApplicationProtocol } from "aws-cdk-lib/aws-elasticloadbalancingv2";
import { StorageType } from "aws-cdk-lib/aws-rds";
import * as route53_targets from "aws-cdk-lib/aws-route53-targets";
import { Construct } from "constructs";
import { StackContext, use } from "@serverless-stack/resources";
import { Postgres } from "./Postgres";
import { Network } from "./Network";
import { Route53 } from "./Route53";
import { Redis } from "./Redis";
import { Secrets } from "./Secrets";
import { RecordTarget } from "aws-cdk-lib/aws-route53";

// export class ElasticSearch extends cdk.Stack {
//   securityGroup: ec2.SecurityGroup;
//   connections: ec2.Connections;
//   domain: es.CfnDomain;

//   constructor(scope: Construct, id: string, props: mastodonprops) {
//     super(scope, id, props);

//     const targetVpc = props.vpc;

//     // The security group that defines network level access to the cluster
//     this.securityGroup = new ec2.SecurityGroup(this, `${id}-security-group`, {
//       vpc: targetVpc,
//     });

//     this.connections = new ec2.Connections({
//       securityGroups: [this.securityGroup],
//       defaultPort: Port.tcp(9200),
//     });

//     this.domain = new es.CfnDomain(this, id, {
//       vpcOptions: {
//         subnetIds: [targetVpc.privateSubnets[0].subnetId],
//         securityGroupIds: [this.securityGroup.securityGroupId],
//       },
//       elasticsearchClusterConfig: {
//         instanceType: "t2.small.elasticsearch",
//       },
//       ebsOptions: {
//         ebsEnabled: true,
//         volumeSize: 10,
//         volumeType: "gp2",
//       },
//     });
//   }
// }

export interface MastodonProps {
  localDomain: string; // unique indentifer for the instance
  zone: route53.HostedZone;
}

export function Mastodon(
  { stack, app }: StackContext,
  { zone, localDomain }: MastodonProps
) {
  const { vpc } = use(Network);
  const postgres = use(Postgres);
  const redis = use(Redis);
  const { secret, vapidKey } = use(Secrets);

  const mastodonBucket = new s3.Bucket(stack, "Bucket", {
    publicReadAccess: true,
  });

  const mastodonCluster = new ecs.Cluster(stack, "Cluster", {
    vpc,
  });

  // const zone = route53.HostedZone.fromLookup(this, "MastodonZone", {
  //   domainName: "mastodon.example.com",
  // });

  const environment = {
    DB_HOST: postgres.db.dbInstanceEndpointAddress,
    DB_PORT: postgres.db.dbInstanceEndpointPort,
    LOCAL_DOMAIN: localDomain,
    STREAMING_API_BASE_URL: "mastodon-stream.example.com",
    DB_PASS: postgres.db.secret?.secretValueFromJson("password").toString()!,
    DB_USER: postgres.db.secret?.secretValueFromJson("username").toString()!,
    DB_NAME: postgres.db.secret?.secretValueFromJson("db").toString()!,
    REDIS_HOST: redis.cluster.attrRedisEndpointAddress,
    REDIS_PORT: redis.cluster.attrRedisEndpointPort,
    SECRET_KEY_BASE: "<REDACTED>",
    OTP_SECRET: "<REDACTED>",
    S3_ENABLED: "true",
    S3_BUCKET: mastodonBucket.bucketName,
    // ES_ENABLED: "true",
    // ES_HOST: search.domain.attrDomainEndpoint,
    SMTP_SERVER: "smtp.mailgun.org",
    SMTP_PORT: "587",
    SMTP_LOGIN: "<REDACTED>",
    SMTP_PASSWORD: "<REDACTED>",
    VAPID_PRIVATE_KEY: "<REDACTED>",
    VAPID_PUBLIC_KEY: "<REDACTED>",
  };

  const image = ecs.ContainerImage.fromRegistry("tootsuite/mastodon");

  const webTaskDefinition = new ecs.FargateTaskDefinition(stack, "WebTask");

  const web = new ecs.ContainerDefinition(stack, "web", {
    taskDefinition: webTaskDefinition,
    image,
    environment,
    command: [
      "bash",
      "-c",
      "bundle exec rake db:migrate; bundle exec rails s -p 3000 -b '0.0.0.0'",
    ],
    logging: new ecs.AwsLogDriver({ streamPrefix: "mastodon/web" }),
  });

  web.addPortMappings({
    containerPort: 3000,
    protocol: Protocol.TCP,
  });

  const webService = new ecs.FargateService(stack, "MastodonWebService", {
    taskDefinition: webTaskDefinition,
    cluster: mastodonCluster,
  });

  const webLB = new elbv2.ApplicationLoadBalancer(stack, "WebLB", {
    vpc,
    internetFacing: true,
  });
  const WebListener = webLB.addListener("WebListener", { port: 443 });
  WebListener.addTargets("webService", {
    port: 3000,
    protocol: ApplicationProtocol.HTTP,
    targets: [webService],
  });

  const webCert = new certificateManager.DnsValidatedCertificate(
    stack,
    "MastodonWebCert",
    {
      hostedZone: zone,
      domainName: "mastodon.example.com",
    }
  );

  new route53.ARecord(stack, "WebRecord", {
    zone,
    recordName: "mastodon",
    target: RecordTarget.fromAlias(
      new route53_targets.LoadBalancerTarget(webLB)
    ),
  });

  WebListener.addCertificates("WebCert", [webCert]);

  const StreamTaskDefinition = new ecs.FargateTaskDefinition(
    stack,
    "StreamingTask"
  );

  const streaming = new ecs.ContainerDefinition(stack, "streaming", {
    taskDefinition: StreamTaskDefinition,
    image,
    environment,
    command: ["yarn", "start"],
    logging: new ecs.AwsLogDriver({
      streamPrefix: "mastodon/streaming",
    }),
  });

  streaming.addPortMappings({
    containerPort: 4000,
    protocol: Protocol.TCP,
  });

  const StreamingService = new ecs.FargateService(
    stack,
    "MastodonStreamingService",
    {
      taskDefinition: StreamTaskDefinition,
      cluster: mastodonCluster,
    }
  );

  const StreamLB = new elbv2.ApplicationLoadBalancer(stack, "StreambLB", {
    vpc,
    internetFacing: true,
  });

  const StreamListener = StreamLB.addListener("StreamListener", {
    port: 443,
  });
  StreamListener.addTargets("StreamService", {
    port: 4000,
    protocol: ApplicationProtocol.HTTP,
    targets: [StreamingService],
  });

  const streamCert = new certificateManager.DnsValidatedCertificate(
    stack,
    "MastodonSteamCert",
    {
      hostedZone: zone,
      domainName: "mastodon-stream.example.com",
    }
  );

  new route53.ARecord(stack, "StreamRecord", {
    zone,
    recordName: "mastodon-stream",
    target: route53.RecordTarget.fromAlias(
      new route53_targets.LoadBalancerTarget(StreamLB)
    ),
  });

  StreamListener.addCertificates("StreamCert", [streamCert]);

  const sideKickTaskDefinition = new ecs.FargateTaskDefinition(
    stack,
    "SidekickTask"
  );

  new ecs.ContainerDefinition(stack, "SideKick", {
    taskDefinition: sideKickTaskDefinition,
    image,
    environment,
    command: ["bundle", "exec", "sidekiq"],
    logging: new ecs.AwsLogDriver({
      streamPrefix: "mastodon/worker",
    }),
  });

  const sideKickService = new ecs.FargateService(stack, "Worker", {
    taskDefinition: sideKickTaskDefinition,
    cluster: mastodonCluster,
  });

  [webService, StreamingService, sideKickService].map((service) => {
    service.connections.allowToDefaultPort(redis.securityGroup);
    // service.connections.allowToDefaultPort(search.);
    service.connections.allowToDefaultPort(postgres.db);
    mastodonBucket.grantReadWrite(service.taskDefinition.obtainExecutionRole());
  });
}
