#! /bin/bash

# start the maintenance scripts
if [[ $ENABLE_MAINTENANCE == 'true' ]]; then
  node /services/maintenance/src/sync-iam.js &
  node /services/maintenance/src/discrepancy-notification.js
fi

echo "Exiting. ENABLE_MAINTENANCE env not set to true"