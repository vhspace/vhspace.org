import { App, Stack, StackContext, use } from "@serverless-stack/resources";
import { RestApi } from "./RestApi";
import { Route53 } from "./Route53";
import {
  BaseSiteEnvironmentOutputsInfo,
  Nextjs,
  NextjsProps,
} from "cdk-nextjs-standalone";
import { Construct } from "constructs";
import path from "path";
import { CfnOutput } from "aws-cdk-lib";

export function Web({ stack, app }: StackContext) {
  const { hostedZone, certificateGlobal } = use(Route53);
  const { api } = use(RestApi);
  const homeSite = new NextjsSst(stack, "HomeSite", {
    app,
    nextjsPath: "web",
    environment: {
      REACT_APP_HOSTED_ZONE: process.env.HOSTED_ZONE!,
      REACT_APP_API_URL: api.url,
    },
    customDomain: hostedZone
      ? {
          domainName: hostedZone?.zoneName,
          hostedZone,
          certificate: certificateGlobal,
        }
      : undefined,
  });
}

export interface NextjsSstProps extends NextjsProps {
  app: App;
}

class NextjsSst extends Nextjs {
  constructor(scope: Construct, id: string, props: NextjsSstProps) {
    const app = props.app;

    super(scope as any, id, {
      ...props,
      isPlaceholder: app.local,
      tempBuildDir: app.buildDir,

      // make path relative to the app root
      nextjsPath: path.isAbsolute(props.nextjsPath)
        ? path.relative(app.appPath, props.nextjsPath)
        : props.nextjsPath,
    });

    if (props.environment) this.registerSiteEnvironment(props.environment);
  }

  protected registerSiteEnvironment(environment: Record<string, string>) {
    const environmentOutputs: Record<string, string> = {};
    for (const [key, value] of Object.entries(environment)) {
      const outputId = `SstSiteEnv_${key}`;
      const output = new CfnOutput(this, outputId, { value });
      environmentOutputs[key] = Stack.of(this).getLogicalId(output);
    }

    const app = this.node.root as App;
    app.registerSiteEnvironment({
      id: this.node.id,
      path: this.props.nextjsPath,
      stack: Stack.of(this).node.id,
      environmentOutputs,
    } as BaseSiteEnvironmentOutputsInfo);
  }
}
