FROM public.ecr.aws/lambda/nodejs:22

RUN dnf install -y git shadow-utils && \
    /usr/sbin/useradd --uid 1000 user
USER user
