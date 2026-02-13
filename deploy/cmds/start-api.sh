#! /bin/bash
# Starts the public API server in the local development environment. 
set -e
CMDS_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
source "$CMDS_DIR/config.sh"

cd "$LOCAL_DEV_DIR" && docker compose exec api bash -c "npm run start-api"