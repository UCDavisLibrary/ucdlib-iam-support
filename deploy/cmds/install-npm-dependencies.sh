#! /bin/bash

###
# Installs dependencies for all package files in project
###

set -e
DEPLOY_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd $DEPLOY_DIR/..

source ./config.sh

for package in "${NPM_PRIVATE_PACKAGES[@]}"; do
  (cd $package && $NPM i)
done