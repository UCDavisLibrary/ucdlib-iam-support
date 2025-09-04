FROM node:22

RUN apt-get update && apt-get install -y vim

RUN mkdir /iam-support-lib
WORKDIR /iam-support-lib

COPY package.json .
COPY package-lock.json .
RUN npm install

RUN npm link
ENV NODE_PATH /usr/local/lib/node_modules/

COPY index.js .
COPY src src
