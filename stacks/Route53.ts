import { StackContext } from "@serverless-stack/resources";
import { DnsValidatedCertificate } from "aws-cdk-lib/aws-certificatemanager";
import { HostedZone, ARecord, RecordTarget } from "aws-cdk-lib/aws-route53";

/**
 * Our DNS zones.
 */
export function Route53({ stack }: StackContext) {
  const zoneName = process.env.HOSTED_ZONE;
  if (!zoneName) return {};
  const zone = new HostedZone(stack, "HomeSiteZone", { zoneName });

  // request a certificate with ACM
  const certificateGlobal = new DnsValidatedCertificate(
    stack,
    "HomeSiteCertificateGlobal",
    {
      domainName: zoneName,
      subjectAlternativeNames: [`*.${zoneName}`],
      hostedZone: zone,
      region: "us-east-1",
    }
  );

  return { zone, certificateGlobal, domainName: zoneName };
}
