#! /bin/bash

###
# Only needs to be run once, before running local deployment
###

set -e
CMDS_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd $CMDS_DIR

./get-reader-key.sh
./get-env-file.sh local-dev
./generate-dev-bundle.sh
