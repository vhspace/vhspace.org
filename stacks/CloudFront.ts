import { StackContext, use } from "@serverless-stack/resources";
import { Distribution } from "aws-cdk-lib/aws-cloudfront";
import { HttpOrigin } from "aws-cdk-lib/aws-cloudfront-origins";
import { AaaaRecord, ARecord, RecordTarget } from "aws-cdk-lib/aws-route53";
import { CloudFrontTarget } from "aws-cdk-lib/aws-route53-targets";
import { Route53 } from "./Route53";

export function CloudFront({ stack }: StackContext) {
  const { certificateGlobal, domainName, zone } = use(Route53);

  const distribution = new Distribution(stack, "HomeSiteDistribution", {
    defaultBehavior: {
      origin: new HttpOrigin("xn--yu8h.notion.site", {
        originPath:
          "/What-is-a-Virtual-HackerSpace-2f6b96d139e144ef8b3677c2852db910",
      }),
    },

    ...(certificateGlobal ? { certificate: certificateGlobal } : {}),
    ...(domainName ? { domainNames: [domainName, `www.${domainName}`] } : {}),
    comment: `Home site for ${domainName || stack.stage}`,
    enableIpv6: true,
  });

  // create DNS records for homepage
  if (zone) {
    new ARecord(stack, "HomeSiteARecord", {
      zone,
      target: RecordTarget.fromAlias(new CloudFrontTarget(distribution)),
    });
    new AaaaRecord(stack, "HomeSiteAaaaRecord", {
      zone,
      target: RecordTarget.fromAlias(new CloudFrontTarget(distribution)),
    });
  }

  return {
    distribution,
  };
}
