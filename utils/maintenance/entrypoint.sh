#! /bin/bash

# start the maintenance scripts
if [[ $ENABLE_MAINTENANCE == 'true' ]]; then
  node /maintenance/src/sync-iam.js &
  node /maintenance/src/discrepancy-notification.js
fi

echo "Exiting. ENABLE_MAINTENANCE env not set to true"