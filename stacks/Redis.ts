import { StackContext, use } from "@serverless-stack/resources";
import { Peer, Port, SecurityGroup } from "aws-cdk-lib/aws-ec2";
import { CfnCacheCluster, CfnSubnetGroup } from "aws-cdk-lib/aws-elasticache";
import { Network } from "./Network";

export function Redis({ stack, app }: StackContext) {
  const { vpc, defaultLambdaSecurityGroup } = use(Network);

  const subnetGroup = new CfnSubnetGroup(stack, "SubnetGroup", {
    cacheSubnetGroupName: app.logicalPrefixedName("redis"),
    description: `Subnet group for ${app.name} ${app.stage}`,
    subnetIds: vpc.privateSubnets.map((s) => s.subnetId),
  });

  const securityGroup = new SecurityGroup(stack, "SG", {
    vpc,
    securityGroupName: "Cache",
  });

  const cluster = new CfnCacheCluster(stack, "CacheCluster", {
    engine: "redis",
    autoMinorVersionUpgrade: true,
    cacheSubnetGroupName: subnetGroup.ref,
    vpcSecurityGroupIds: [securityGroup.securityGroupId],

    // https://docs.aws.amazon.com/AmazonElastiCache/latest/red-ug/CacheNodes.SupportedTypes.html#CacheNodes.SupportedTypesByRegion
    cacheNodeType: "cache.t2.micro",

    numCacheNodes: 1,
  });
  cluster.addDependsOn(subnetGroup);

  const redisUrl = getRedisAddress(cluster); // local redis is in docker-compose.yml
  app.addDefaultFunctionEnv({ REDIS_URL: redisUrl });

  // allow access to the cache from the default lambda security group
  securityGroup.addIngressRule(
    Peer.securityGroupId(defaultLambdaSecurityGroup.securityGroupId),
    Port.tcp(6379),
    "Allow all access to redis (TCP)"
  );

  return { cluster, securityGroup };
}

function getRedisAddress(cluster: CfnCacheCluster): string {
  return "redis://" + cluster.attrRedisEndpointAddress;
}
