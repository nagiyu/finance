#!/bin/bash

docker build \
  --build-arg PROCESS_ENV=local \
  --build-arg PROJECT_SECRET=DevFinance \
  --build-arg PROJECT_AWS_ACCESS_KEY= \
  --build-arg PROJECT_AWS_SECRET_ACCESS_KEY= \
  --build-arg PROJECT_AWS_REGION= \
  --build-arg NEXTAUTH_URL=http://localhost:3000 \
  -f client/finance/Dockerfile \
  -t dev-finance .
