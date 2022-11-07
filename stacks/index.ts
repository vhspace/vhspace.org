import { CloudFront } from "./CloudFront";
import { App } from "@serverless-stack/resources";
import { Route53 } from "./Route53";

export default function (app: App) {
  app.setDefaultFunctionProps({
    runtime: "nodejs16.x",
    srcPath: "services",
    bundle: {
      format: "esm",
    },
  });
  app.stack(Route53).stack(CloudFront);
}
