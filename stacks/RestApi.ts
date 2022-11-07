import { Api, StackContext, use } from "@serverless-stack/resources";
import { Route53 } from "./Route53";

export function RestApi({ stack, app }: StackContext) {
  const { domainName } = use(Route53);

  // CORS allowed origins
  const allowedOrigins = app.local ? ["http://localhost:3300"] : [];
  if (domainName)
    allowedOrigins.push(`https://${domainName}`, `https://www.${domainName}`);

  // REST API
  const api = new Api(stack, "Api", {
    routes: {
      // map route to lambda function here
      "GET /": "functions/lambda.handler",
    },

    cors: { allowOrigins: allowedOrigins },
    customDomain: domainName ? { domainName: `api.${domainName}` } : undefined,
  });

  return {
    api,
  };
}
