#! /bin/bash

###
# Main build process to cutting production images
###

set -e
DEPLOY_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd $DEPLOY_DIR/..
source config.sh

# Use buildkit to speedup local builds
# Not supported in google cloud build yet
if [[ -z $CLOUD_BUILD ]]; then
  export DOCKER_BUILDKIT=1
fi

# shared js code
NODEJS_BASE=$LIB_IMAGE_NAME_TAG
docker build \
  -t $NODEJS_BASE \
  --build-arg BUILDKIT_INLINE_CACHE=1 \
  --cache-from=$LIB_IMAGE_NAME:$CONTAINER_CACHE_TAG \
  $LIB_DIR

# Application
docker build \
  -t $APP_IMAGE_NAME_TAG \
  --build-arg NODEJS_BASE=${NODEJS_BASE} \
  --build-arg BUILDKIT_INLINE_CACHE=1 \
  --cache-from=$APP_IMAGE_NAME:$CONTAINER_CACHE_TAG \
  --build-arg BUILD_NUM=${BUILD_NUM} \
  --build-arg BUILD_TIME=${BUILD_TIME} \
  --build-arg APP_VERSION=${APP_VERSION} \
  $APP_DIR

# Utils
docker build \
  -t $UTILS_IMAGE_NAME_TAG \
  --build-arg NODEJS_BASE=${NODEJS_BASE} \
  --build-arg BUILDKIT_INLINE_CACHE=1 \
  --cache-from=$UTILS_IMAGE_NAME:$CONTAINER_CACHE_TAG \
  --build-arg BUILD_NUM=${BUILD_NUM} \
  --build-arg BUILD_TIME=${BUILD_TIME} \
  --build-arg APP_VERSION=${APP_VERSION} \
  $UTILS_DIR