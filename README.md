[![Seed Status](https://api.seed.run/vhs/vhspace-org/stages/prod/build_badge)](https://console.seed.run/vhs/vhspace-org)

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
pnpm dev  # deploy AWS resources and run sst backend local dev server

# frontend
pnpm dev:web  # start react local dev server (not connected to local backend)

# if running sst
pnpm dev:web:sst  # start react local dev server talking to sst backend
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

### Deployments

Pushes to `main` are deployed by <https://seed.run>
