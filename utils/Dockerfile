ARG NODEJS_BASE
FROM ${NODEJS_BASE}

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
