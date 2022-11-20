import { Config, StackContext } from "@serverless-stack/resources";
import { Secret, SecretProps } from "aws-cdk-lib/aws-secretsmanager";
import { Key, KeySpec, KeyUsage } from "aws-cdk-lib/aws-kms";
import { RemovalPolicy } from "aws-cdk-lib";

export function Secrets({ stack, app }: StackContext) {
  // ignored if importing secret
  const secretProps: SecretProps = {
    removalPolicy: RemovalPolicy.RETAIN,
    description: app.logicalPrefixedName("app"),
    generateSecretString: {
      secretStringTemplate: JSON.stringify({
        OTP_SECRET: "changeme",
        SMTP_LOGIN: "changeme",
        SMTP_PASSWORD: "changeme",
        LINKEDIN_CLIENT_SECRET: "changeme",
      }),
      excludePunctuation: true,
      generateStringKey: "SECRET_KEY_BASE",
    },
  };

  // import?
  const secret = process.env.APP_SECRET_NAME
    ? Secret.fromSecretNameV2(
        stack,
        "SecretsImported",
        process.env.APP_SECRET_NAME
      )
    : new Secret(stack, "Secret", secretProps);

  const secretConfig = new Config.Parameter(stack, "SecretArn", {
    value: secret.secretArn,
  });
  app.addDefaultFunctionBinding([secretConfig]);

  const vapidKey = new Key(stack, "VapidKey", {
    alias: app.logicalPrefixedName("vapidkey"),
    description: "Key for streaming",
    keyUsage: KeyUsage.SIGN_VERIFY,
    keySpec: KeySpec.RSA_4096,
    removalPolicy: RemovalPolicy.DESTROY,
  });

  return { secret, vapidKey };
}
