ARG BASE_IMAGE
FROM ${BASE_IMAGE}

# Install base tools
RUN apt-get update \
 && apt-get install -y --no-install-recommends \
      apt-transport-https \
      ca-certificates \
      curl \
      gnupg \
      lsb-release \
      curl \
      procps \
      cron \
 && rm -rf /var/lib/apt/lists/*

# Prep work for gsutil
RUN install -d -m 0755 /etc/apt/keyrings \
 && curl -fsSL https://packages.cloud.google.com/apt/doc/apt-key.gpg \
  | gpg --dearmor -o /etc/apt/keyrings/cloud.google.gpg \
 && chmod 0644 /etc/apt/keyrings/cloud.google.gpg
RUN echo "deb [signed-by=/etc/apt/keyrings/cloud.google.gpg] https://packages.cloud.google.com/apt cloud-sdk main" \
  > /etc/apt/sources.list.d/google-cloud-sdk.list

# prep for postgres
RUN install -d -m 0755 /etc/apt/keyrings \
 && curl -fsSL https://www.postgresql.org/media/keys/ACCC4CF8.asc \
    | gpg --dearmor -o /etc/apt/keyrings/postgresql.gpg \
 && chmod 0644 /etc/apt/keyrings/postgresql.gpg
RUN echo "deb [signed-by=/etc/apt/keyrings/postgresql.gpg] \
  http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" \
  > /etc/apt/sources.list.d/pgdg.list

# Install ubuntu packages
RUN apt-get update && apt-get install -y --no-install-recommends \
  postgresql-client \
  wait-for-it \
  google-cloud-sdk \
  && rm -rf /var/lib/apt/lists/*

# Backup
RUN mkdir /utils-data && mkdir /utils-data/backup
COPY backup /backup
COPY backup/cron /etc/cron.d/backup
RUN chmod 0644 /etc/cron.d/backup

# Init
RUN mkdir /utils-data/init
COPY init /init

# Maintenance scripts
RUN mkdir /maintenance
WORKDIR /maintenance
COPY maintenance/entrypoint.sh entrypoint.sh
COPY maintenance/package.json package.json
COPY maintenance/package-lock.json package-lock.json
RUN npm install
RUN npm link @ucd-lib/iam-support-lib
COPY maintenance/src src

# CLI
RUN mkdir /cli
WORKDIR /cli

# cli dependencies
COPY cli/package.json package.json
COPY cli/package-lock.json package-lock.json
RUN npm install
RUN npm link @ucd-lib/iam-support-lib

COPY cli/bin bin
COPY cli/lib lib
COPY cli/cli.sh cli.sh

# make cli available as global command
RUN npm link

# API server - for external apps to use
RUN mkdir /api
WORKDIR /api

COPY api/package.json package.json
COPY api/package-lock.json package-lock.json
RUN npm install
RUN npm link @ucd-lib/iam-support-lib

COPY api/lib lib
COPY api/routes routes
COPY api/index.js index.js
COPY api/api.sh api.sh

ENTRYPOINT [ "bash", "-c" ]
CMD ["echo 'Use command arg to specify a script to run.'"]
