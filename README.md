# Virtual HackerSpace

- React web app ([vhspace.org](https://vhspace.org))
- Node lambda backend
- Infrastructure-as-code using the AWS CDK.

Contributions are welcome! Open a PR.

## Quickstart

```shell
npm i -g pnpm
pnpm i
pnpm start  # deploy AWS resources and run backend local dev server
pnpm start:web  # start react local dev server
```

## Contents

### Web

The static react app frontend lives in `web/`

### Services

Backend lambda services are in `services/`

### Stacks

CDK infrastructure as code.

- Route53 - creates hostedzone for vhspace.org and requests ACM certificate
- Web - builds our react app and creates a CloudFront distribution
-
