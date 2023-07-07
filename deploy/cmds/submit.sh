#! /bin/bash

###
# Submit a new build to google cloud.
###

set -e
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd $SCRIPT_DIR/../..

gcloud config set project digital-ucdavis-edu
USER=$(gcloud auth list --filter="status:ACTIVE"  --format="value(account)")

echo "Submitting build to Google Cloud..."
gcloud builds submit \
  --config ./deploy/gcloud/cloudbuild.yaml \
  --substitutions=_UCD_LIB_INITIATOR=$USER,REPO_NAME=$(basename $(git remote get-url origin)),BRANCH_NAME=$(git rev-parse --abbrev-ref HEAD) \
  .
