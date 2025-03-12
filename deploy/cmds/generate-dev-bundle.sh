#! /bin/bash

###
# Generates dev js bundles for site - aka watch process without the watch
###

set -e
ROOT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd $ROOT_DIR/../..

source ./deploy/config.sh

cd lib && npm link
cd ../app/client/
$NPM link @ucd-lib/iam-support-lib
$NPM run create-dev-bundle
