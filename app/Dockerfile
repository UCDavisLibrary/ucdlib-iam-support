ARG NODEJS_BASE
FROM ${NODEJS_BASE}

RUN mkdir /app
WORKDIR /app

# server dependencies
COPY package.json package.json
COPY package-lock.json package-lock.json
RUN npm install
RUN npm link @ucd-lib/iam-support-lib

# client dependencies
COPY client/package.json client/package.json
COPY client/package-lock.json client/package-lock.json
RUN cd client && npm install
RUN cd client && npm link @ucd-lib/iam-support-lib

# client code
COPY client/src client/src
COPY client/scss client/scss
COPY client/public/index.html client/public/index.html
COPY client/public/logged-out.html client/public/logged-out.html
COPY client/public/unauthorized.html client/public/unauthorized.html
COPY client/public/silent-check-sso.html client/public/silent-check-sso.html
COPY client/public/fonts client/public/fonts
COPY client/public/img client/public/img
COPY client/build-config.js client/build-config.js
COPY client/webpack-dist.config.js client/webpack-dist.config.js

# server code
COPY index.js .
COPY api api
COPY lib lib

# client build
RUN cd client && npm run dist

# build tags
ARG APP_VERSION
ENV APP_VERSION ${APP_VERSION}
ARG BUILD_NUM
ENV BUILD_NUM ${BUILD_NUM}
ARG BUILD_TIME
ENV BUILD_TIME ${BUILD_TIME}

CMD node index.js
