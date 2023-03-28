#! /bin/bash

BACKUP_PROFILE=/etc/profile.d/backup.sh

if [[ $NIGHTLY_BACKUPS != "true" ]]; then
  echo "NIGHTLY_BACKUPS flag not set to 'true', backup container will not run."
  exit 0;
fi

# Apply cron job
if [[ ! -f /var/log/cron.log ]]; then
  crontab /etc/cron.d/backup
  touch /var/log/cron.log
fi

if [[ -f $BACKUP_PROFILE ]]; then
  rm $BACKUP_PROFILE
fi

# cron tab runs in a blank enviornment, create a backup profile cron can load
echo "export NIGHTLY_BACKUPS=$NIGHTLY_BACKUPS" >> $BACKUP_PROFILE
echo "export GOOGLE_CLOUD_BUCKET=$GOOGLE_CLOUD_BUCKET" >> $BACKUP_PROFILE
echo "export BACKUP_ENV=$BACKUP_ENV" >> $BACKUP_PROFILE
echo "export GOOGLE_APPLICATION_CREDENTIALS=$GOOGLE_APPLICATION_CREDENTIALS" >> $BACKUP_PROFILE
echo "export PGUSER=$PGUSER" >> $BACKUP_PROFILE
echo "export PGPASSWORD=$PGPASSWORD" >> $BACKUP_PROFILE
echo "export PGHOST=$PGHOST" >> $BACKUP_PROFILE
echo "export PGPORT=$PGPORT" >> $BACKUP_PROFILE
echo "export PGDATABASE=$PGDATABASE" >> $BACKUP_PROFILE

cron && tail -f /var/log/cron.log