#! /bin/bash

source /etc/profile
DATA_DIR=/utils-data/backup

if [[ -z $BACKUP_ENV ]]; then
  echo "BACKUP_ENV variable is required."
  exit 1
fi


if [[ ! -f "$GOOGLE_APPLICATION_CREDENTIALS" ]]; then
  echo "Google cloud credential key file doesn't exist"
  exit 1
fi

# dump pg data
echo "Generating sqldump file"
pg_dump | gzip > $DATA_DIR/$SQL_FILE_NAME

echo "uploading files to cloud bucket ${BACKUP_ENV}"
gcloud auth login --quiet --cred-file=${GOOGLE_APPLICATION_CREDENTIALS}
gsutil cp $DATA_DIR/$SQL_FILE_NAME "gs://${GOOGLE_CLOUD_BUCKET}/${BACKUP_ENV}/${SQL_FILE_NAME}"

rm $DATA_DIR/$SQL_FILE_NAME

if [[ -n $BACKUP_LOG_TABLE ]]; then
  echo "BACKUP_LOG_TABLE is set to $BACKUP_LOG_TABLE"
  psql -c "CREATE TABLE IF NOT EXISTS $BACKUP_LOG_TABLE (
    id SERIAL PRIMARY KEY,
    backup_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    backup_bucket TEXT,
    backup_env TEXT
  );"
  psql -c "INSERT INTO $BACKUP_LOG_TABLE (backup_bucket, backup_env) VALUES ('${GOOGLE_CLOUD_BUCKET}', '${BACKUP_ENV}');"

  echo "Backup log entry created in table $BACKUP_LOG_TABLE"
else
  echo "BACKUP_LOG_TABLE is not set, skipping log entry creation."
fi

echo "backup complete"
