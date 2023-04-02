#! /bin/bash

DATA_DIR=/utils-data/init

# wait for db to start up
echo "Waiting for db to start up"
wait-for-it $PGHOST:$PGPORT -t 0

if [[ -z "$RUN_INIT" || -z "$DATA_ENV" ]]; then
  echo "Skipping db hydration.";
  if [[ -z "$RUN_INIT" ]]; then
    echo "No RUN_INIT flag found."
  else 
    echo "DATA_ENV environmental variable is not set."
  fi
else
  # check that postgres has tables
  echo "Checking if db has tables"
  DB_HAS_DATA=$(echo "SELECT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename  = 'employees');" | psql -t | xargs)
  if [[ $DB_HAS_DATA == 'f' ]]; then
    echo "No data found in db, attempting to pull content for google cloud bucket"
    gcloud auth login --quiet --cred-file=${GOOGLE_APPLICATION_CREDENTIALS}
    echo "Downloading: gs://${GOOGLE_CLOUD_BUCKET}/${DATA_ENV}/${SQL_FILE_NAME}"
    gsutil cp "gs://${GOOGLE_CLOUD_BUCKET}/${DATA_ENV}/${SQL_FILE_NAME}" $DATA_DIR/$SQL_FILE_NAME
    echo "hydrating db from sqldump"
    gunzip -c $DATA_DIR/$SQL_FILE_NAME | psql
    rm $DATA_DIR/$SQL_FILE_NAME
    echo "db hydration complete"
  else
    echo "Tables found in db. Skipping hydration."
  fi

fi
echo "Init container is finished and exiting (this is supposed to happen)"
