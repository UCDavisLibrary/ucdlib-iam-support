#! /bin/bash

###
# download the reader key from the secret manager
###

set -e
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd $SCRIPT_DIR/../..

gcloud secrets versions access latest --secret=itis-iam-support-reader-key > gc-itis-iam-reader-key.json
