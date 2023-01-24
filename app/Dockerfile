FROM node:18

RUN mkdir /app
WORKDIR /app

# server dependencies
COPY package.json package.json
COPY package-lock.json package-lock.json
RUN npm install

# client code
COPY client/src client/src
COPY client/public/index.html client/public/index.html

# server code
COPY index.js js
COPY api api
COPY lib lib

# build tags
ARG APP_VERSION
ENV APP_VERSION ${APP_VERSION}
ARG BUILD_NUM
ENV BUILD_NUM ${BUILD_NUM}
ARG BUILD_TIME
ENV BUILD_TIME ${BUILD_TIME}

CMD node index.js
