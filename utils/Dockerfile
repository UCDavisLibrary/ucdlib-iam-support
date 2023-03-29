ARG NODEJS_BASE
FROM ${NODEJS_BASE}

RUN apt-get update && apt-get install -y apt-transport-https ca-certificates gnupg curl cron procps

# prep work for gsutils
RUN curl -O https://packages.cloud.google.com/apt/doc/apt-key.gpg \
    && apt-key add apt-key.gpg
RUN echo "deb [signed-by=/usr/share/keyrings/cloud.google.gpg] https://packages.cloud.google.com/apt cloud-sdk main" | tee -a /etc/apt/sources.list.d/google-cloud-sdk.list
RUN curl https://packages.cloud.google.com/apt/doc/apt-key.gpg | apt-key --keyring /usr/share/keyrings/cloud.google.gpg add -

# prep for postgres
RUN apt-get update && apt-get install -y lsb-release
RUN echo "deb http://apt.postgresql.org/pub/repos/apt/ $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list
RUN curl https://www.postgresql.org/media/keys/ACCC4CF8.asc | apt-key add -

# Install ubuntu packages
RUN apt-get update && apt-get install -y postgresql-client \
  wait-for-it google-cloud-sdk

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

# build tags
ARG APP_VERSION
ENV APP_VERSION ${APP_VERSION}
ARG BUILD_NUM
ENV BUILD_NUM ${BUILD_NUM}
ARG BUILD_TIME
ENV BUILD_TIME ${BUILD_TIME}

ENTRYPOINT [ "sh", "-c" ]
CMD ["echo 'Use command arg to specify a script to run.'"]
