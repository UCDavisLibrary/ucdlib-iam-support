#! /bin/bash

###
# npm i and generates dev js bundles for site - aka watch process without the watch
###

set -e
CMDS_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
ROOT_DIR="$( cd $CMDS_DIR/../.. && pwd )"
cd $ROOT_DIR

# shared lib
echo "Installing shared lib"
cd lib && npm i

# client
echo "Installing client"
cd $ROOT_DIR/app/client/
npm i
npm run create-dev-bundle
