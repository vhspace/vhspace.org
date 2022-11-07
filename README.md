# Virtual HackerSpace

- React web app ([vhspace.org](https://vhspace.org))
- Node lambda backend
- Infrastructure-as-code using the AWS CDK.

Contributions are welcome! Open a PR.

## Quickstart

Assumes you have Node >=16 and AWS credentials configured.

```shell
npm i -g pnpm
pnpm i

# backend
pnpm start  # deploy AWS resources and run sst backend local dev server

# frontend
pnpm start:web  # start react local dev server (not connected to local backend)

# if running sst
pnpm start:web:sst  # start react local dev server talking to sst backend
```

## Contents

### Web

The static react app frontend lives in `web/`

### Services

Backend lambda services are in `services/`

### Stacks

CDK infrastructure as code.

- Route53 - creates hostedzone for vhspace.org and requests ACM certificate
- Web - builds our react app and creates a CloudFront distribution to host it
