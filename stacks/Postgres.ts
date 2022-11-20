import ec2 = require("aws-cdk-lib/aws-ec2");
import rds = require("aws-cdk-lib/aws-rds");
import { StackContext, use } from "@serverless-stack/resources";
import { Port } from "aws-cdk-lib/aws-ec2";
import { StorageType } from "aws-cdk-lib/aws-rds";
import { Network } from "./Network";

export function Postgres({ stack }: StackContext) {
  const { vpc } = use(Network);

  const id = "Pg";

  // The security group that defines network level access to the cluster
  const securityGroup = new ec2.SecurityGroup(stack, `${id}-security-group`, {
    vpc: vpc,
  });

  const subnetGroup = new rds.SubnetGroup(stack, `${id}-subnet-group`, {
    vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_ISOLATED },
    description: "Subnet for PostgresDB",
    vpc: vpc,
  });

  const connections = new ec2.Connections({
    securityGroups: [securityGroup],
    defaultPort: Port.tcp(5432),
  });

  const db = new rds.DatabaseInstance(stack, id, {
    vpc: vpc,
    engine: rds.DatabaseInstanceEngine.postgres({
      version: rds.PostgresEngineVersion.VER_14_4,
    }),
    autoMinorVersionUpgrade: true,
    allowMajorVersionUpgrade: false,
    multiAz: true,
    instanceType: ec2.InstanceType.of(
      ec2.InstanceClass.T3,
      ec2.InstanceSize.MICRO
    ),
    storageType: StorageType.STANDARD,
    securityGroups: [securityGroup],
    subnetGroup: subnetGroup,
  });

  return { db };
}
