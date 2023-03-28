#! /bin/bash

source /etc/profile
DATA_DIR=/utils-data/backup
DATA_FILE_NAME=itis-iam.sql.gz
GOOGLE_CLOUD_BUCKET=itis-iam

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
pg_dump | gzip > $DATA_DIR/$DATA_FILE_NAME

echo "uploading files to cloud bucket ${BACKUP_ENV}"
gcloud auth login --quiet --cred-file=${GOOGLE_APPLICATION_CREDENTIALS}
gsutil cp $DATA_DIR/$DATA_FILE_NAME "gs://${GOOGLE_CLOUD_BUCKET}/${BACKUP_ENV}/${DATA_FILE_NAME}"

rm $DATA_DIR/$DATA_FILE_NAME

echo "backup complete"
