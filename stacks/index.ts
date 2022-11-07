import { CloudFront } from "./CloudFront";
import { App } from "@serverless-stack/resources";
import { Route53 } from "./Route53";
import { Web } from "./Web";

export default function (app: App) {
  app.setDefaultFunctionProps({
    runtime: "nodejs16.x",
    srcPath: "services",
    bundle: {
      format: "esm",
    },
    timeout: "10 seconds",
    memorySize: 1024,
  });
  app.stack(Route53).stack(Web);
}
