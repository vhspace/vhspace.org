import {
  ReactStaticSite,
  StackContext,
  use,
} from "@serverless-stack/resources";
import { CloudFront } from "./CloudFront";
import { Route53 } from "./Route53";

export function Web({ stack, app }: StackContext) {
  const { distribution } = use(CloudFront);
  const { zone, certificateGlobal } = use(Route53);
  const homeSite = new ReactStaticSite(stack, "HomeSite", {
    path: "web",
    environment: {
      REACT_APP_HOSTED_ZONE: process.env.HOSTED_ZONE,
    },
    customDomain: zone
      ? {
          domainName: zone?.zoneName,
          cdk: {
            hostedZone: zone,
            certificate: certificateGlobal,
          },
        }
      : undefined,
  });
}
