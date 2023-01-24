#! /bin/bash

###
# Only needs to be run once, before running local deployment
###

set -e
DEPLOY_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd $DEPLOY_DIR/..

./cmds/install-npm-dependencies.sh
./cmds/generate-dev-bundle.sh