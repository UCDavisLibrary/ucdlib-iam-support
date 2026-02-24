#! /bin/bash
set -e

CMDS_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
ROOT_DIR="$(cd "$CMDS_DIR/../.." && pwd)"
SERVICES_DIR="$(cd "$ROOT_DIR/services" && pwd)"
COMPOSE_DIR="$(cd "$ROOT_DIR/deploy/compose" && pwd)"
LOCAL_DEV_DIR="$(cd "$ROOT_DIR/deploy/compose/ucdlib-iam-support-local-dev" && pwd)"
PROJECT_NAME="ucdlib-iam-support"

# DEPLOY_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
# ROOT_DIR="$( cd $DEPLOY_DIR/.. && pwd )"
# APP_DIR=$ROOT_DIR/app
# LIB_DIR=$ROOT_DIR/lib
# UTILS_DIR=$ROOT_DIR/utils
# CLI_DIR=$ROOT_DIR/utils/cli
