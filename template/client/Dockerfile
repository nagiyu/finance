FROM node:20 AS base

FROM base AS builder

ARG PROCESS_ENV
ARG PROJECT_SECRET
ARG PROJECT_AWS_ACCESS_KEY
ARG PROJECT_AWS_SECRET_ACCESS_KEY
ARG PROJECT_AWS_REGION
ARG NEXTAUTH_URL

WORKDIR /app

COPY common ./common
COPY sample ./sample
COPY client/common ./client/common
COPY client/sample ./client/sample

WORKDIR /app/common
RUN npm install

WORKDIR /app/sample
RUN npm install

WORKDIR /app/client/common
RUN npm install

WORKDIR /app/client/tools
RUN npm install && \
    npm run build

FROM base AS runner

ARG PROCESS_ENV
ARG PROJECT_SECRET
ARG PROJECT_AWS_ACCESS_KEY
ARG PROJECT_AWS_SECRET_ACCESS_KEY
ARG PROJECT_AWS_REGION
ARG NEXTAUTH_URL

ENV PROCESS_ENV=${PROCESS_ENV}
ENV PROJECT_SECRET=${PROJECT_SECRET}
ENV PROJECT_AWS_ACCESS_KEY=${PROJECT_AWS_ACCESS_KEY}
ENV PROJECT_AWS_SECRET_ACCESS_KEY=${PROJECT_AWS_SECRET_ACCESS_KEY}
ENV PROJECT_AWS_REGION=${PROJECT_AWS_REGION}
ENV NEXTAUTH_URL=${NEXTAUTH_URL}

COPY --from=public.ecr.aws/awsguru/aws-lambda-adapter:0.9.1 /lambda-adapter /opt/extensions/lambda-adapter

ENV AWS_LWA_PORT=3000

WORKDIR /app/common
COPY --from=builder /app/common .

WORKDIR /app/sample
COPY --from=builder /app/sample .

WORKDIR /app/client/common
COPY --from=builder /app/client/common .

WORKDIR /app/client/sample
COPY --from=builder /app/client/sample/.next/standalone ./

COPY --from=builder /app/client/sample/public ./public
COPY --from=builder /app/client/sample/.next/static ./.next/static

USER node

CMD ["node", "server.js"]
