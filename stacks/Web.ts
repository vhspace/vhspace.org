import {
  ReactStaticSite,
  StackContext,
  use,
} from "@serverless-stack/resources";
import { RestApi } from "./RestApi";
import { Route53 } from "./Route53";

export function Web({ stack, app }: StackContext) {
  const { hostedZone, certificateGlobal } = use(Route53);
  const { api } = use(RestApi);
  const homeSite = new ReactStaticSite(stack, "HomeSite", {
    path: "web",
    environment: {
      REACT_APP_HOSTED_ZONE: process.env.HOSTED_ZONE,
      REACT_APP_API_URL: api.url,
    },
    customDomain: hostedZone
      ? {
          domainName: hostedZone?.zoneName,
          cdk: {
            hostedZone,
            certificate: certificateGlobal,
          },
        }
      : undefined,
  });
}
