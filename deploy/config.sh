#! /bin/bash

######### DEPLOYMENT CONFIG ############
# Setup your application deployment here
########################################

# Grab build number is mounted in CI system
if [[ -f /config/.buildenv ]]; then
  source /config/.buildenv
else
  BUILD_NUM=-1
fi

# Main version number we are tagging the app with. Always update
# this when you cut a new version of the app!
APP_VERSION=v1.8.0.${BUILD_NUM}

# Repository tags/branchs
# Tags should always be used for production deployments
# Branches can be used for development deployments
REPO_TAG=v1.8.0
POSTGRES_TAG=15.3

DEPLOY_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
ROOT_DIR="$( cd $DEPLOY_DIR/.. && pwd )"
APP_DIR=$ROOT_DIR/app
LIB_DIR=$ROOT_DIR/lib
UTILS_DIR=$ROOT_DIR/utils
CLI_DIR=$ROOT_DIR/utils/cli

##
# Container
##

# Container Registery
CONTAINER_REG_ORG=gcr.io/ucdlib-pubreg

if [[ -z $BRANCH_NAME ]]; then
 CONTAINER_CACHE_TAG=$(git rev-parse --abbrev-ref HEAD)
else
 CONTAINER_CACHE_TAG=$BRANCH_NAME
fi
#CONTAINER_CACHE_TAG='sandbox'

# set localhost/local-dev used by
# local development docker-compose file
if [[ ! -z $LOCAL_BUILD ]]; then
  CONTAINER_REG_ORG='localhost/local-dev'
fi


# Container Images
APP_IMAGE_NAME=$CONTAINER_REG_ORG/itis-iam-support-app
UTILS_IMAGE_NAME=$CONTAINER_REG_ORG/itis-iam-support-utils
LIB_IMAGE_NAME=$CONTAINER_REG_ORG/itis-iam-support-lib

APP_IMAGE_NAME_TAG=$APP_IMAGE_NAME:$REPO_TAG
UTILS_IMAGE_NAME_TAG=$UTILS_IMAGE_NAME:$REPO_TAG
LIB_IMAGE_NAME_TAG=$LIB_IMAGE_NAME:$REPO_TAG

ALL_DOCKER_BUILD_IMAGES=( $APP_IMAGE_NAME $UTILS_IMAGE_NAME $LIB_IMAGE_NAME )

ALL_DOCKER_BUILD_IMAGE_TAGS=(
  $APP_IMAGE_NAME_TAG
  $UTILS_IMAGE_NAME_TAG
  $LIB_IMAGE_NAME_TAG
)

# NPM
NPM=npm
NPM_PRIVATE_PACKAGES=(
  $ROOT_DIR/app/
  $ROOT_DIR/app/client
  $ROOT_DIR/lib
)
