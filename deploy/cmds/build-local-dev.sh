#! /bin/bash

# VERSION=$1
# if [ -z "$VERSION" ]; then
#   echo "Please provide a version number"
#   exit 1
# fi

# DEPTH=$2
# if [ -z "$DEPTH" ]; then
#   DEPTH=ALL
# fi

# cork-kube build exec \
#   --project ucdlib-iam-support \
#   --version $VERSION \
#   --override-tag local-dev \
#   --depth $DEPTH \
#   --no-cache-from

set -e

CMDS_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
source "$CMDS_DIR/config.sh"

docker build \
  -t localhost/local-dev/ucdlib-iam-support:local-dev \
  -f "${SERVICES_DIR}/Dockerfile" \
  ${ROOT_DIR}
