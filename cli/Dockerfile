ARG NODEJS_BASE
FROM ${NODEJS_BASE}

RUN mkdir /cli
WORKDIR /cli

# dependencies
COPY package.json package.json
COPY package-lock.json package-lock.json
RUN npm install
RUN npm link @ucd-lib/iam-support-lib

COPY bin bin

# build tags
ARG APP_VERSION
ENV APP_VERSION ${APP_VERSION}
ARG BUILD_NUM
ENV BUILD_NUM ${BUILD_NUM}
ARG BUILD_TIME
ENV BUILD_TIME ${BUILD_TIME}

CMD bash -c "tail -f /dev/null"
