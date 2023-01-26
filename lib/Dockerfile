FROM node:18

RUN mkdir /iam-support-lib
WORKDIR /iam-support-lib

COPY package.json .
COPY package-lock.json .
RUN npm install

RUN npm link
ENV NODE_PATH /usr/local/lib/node_modules/

COPY index.js .
COPY src src