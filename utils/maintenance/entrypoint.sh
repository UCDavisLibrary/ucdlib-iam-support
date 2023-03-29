#! /bin/bash

# start the monitoring agent
if [[ $ENABLE_MAINTENANCE == 'true' ]]; then
  node /maintenance/src/index.js
fi

echo "Exiting. ENABLE_MAINTENANCE env not set to true"