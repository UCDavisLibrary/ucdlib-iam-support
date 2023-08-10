# Identity and Access Management (IAM) Support
This is a monorepo that contains applications and utilities for managing the [IAM system](https://github.com/UCDavisLibrary/keycloak-deployment) at the UC Davis Library.

Technical documentation can be found in this [Google Doc](https://docs.google.com/document/d/129KuqatZVwj7Fl_am4E3eTJgq6Fj1MNjo66MbI5mMok/edit?usp=sharing).

## Application
The application (in `/app`) is designed to be used by 
1. HR for initiating onboarding and separation processes
2. Supervisors to request access to systems for their employees when onboarded.

The application does not assign permissions, but creates, routes, and tracks system provisioning tickets via the [Request Tracker (RT)](https://rt.lib.ucdavis.edu/) API. 

## CLI
The command line interface (in `/utils/cli`) is designed to be used by ITIS to perform adminstrative actions, such as loading a user into Keycloak and assigning permissions.

To use the CLI:
1. bash into container: `docker compose exec cli bash`
2. run commands: `ucdlib-iam --help`

## Backup Utility

Located in `utils/backup`, this container will automatically back up the database to the `itis-iam` Google Cloud Storage bucket if `NIGHTLY_BACKUPS` and `BACKUP_ENV` env variables are set.

In order to backup, you need a GC key, which can be obtained by running `deploy/cmds/get-writer-key.sh`.

## Init Utility

Located in `utils/init`, this container will automatically hydrate the database upon `docker compose up` if local db is empty. Requires `RUN_INIT` and `DATA_ENV` env variables to be set.

## Maintenance Utility
Located in `utils/maintenance`, this container runs a node cron service for performing needed maintenance tasks, such as keeping employee records in sync with campus data stores. `ENABLE_MAINTENANCE` must be set to true.

## Shared Code
Any code shared by the application and cli should be placed in the `/lib` directory. Both the app and cli docker images use the same base image that npm links this shared code as the `@ucd-lib/iam-support-lib` package.

## Deployment

### Environmental Variables

Most relevant env variables:

| Name | Notes |
| ---- | ----- |
| `UCDLIB_APP_HOST_PORT` | |
| `UCDLIB_APP_ENV` | 'prod' or 'dev'. By default, local development starts with 'dev' |
| `UCD_IAM_API_KEY` | API key for `https://iet-ws.ucdavis.edu/api/iam`. Required for much functionality |
| `UCDLIB_RT_KEY` | Access token required for interacting with RT. By default, associated RT user is set to `pmanager`. |
| `UCDLIB_RT_FORBID_WRITE` | Will not create or edit RT tickets |
| `NIGHTLY_BACKUPS` | If set to `true`, database will be backed up nightly to `BACKUP_ENV` GC bucket |
| `RUN_INIT` | If set, init container will run its process |
| `DATA_ENV` | Data init container will pull if local db is empty |
| `ENABLE_MAINTENANCE` | Maintenance container will do its regularly scheduled work |
| `SLACK_WEBHOOK_URL_FOR_ERRORS` | If you want to write to the `itis-error-notifications` slack channel | 
| `KEYCLOAK_ADMIN_PASSWORD` | Required to manipulate keycloak data - user lists, groups, etc |

For a complete list, see `config.js`.

## Production Deployment

On your machine:
1. Merge your changes into main.
2. Update `APP_VERSION` and `REPO_TAG` in deploy/config.sh
3. Run `generate-deployment-files.sh`
4. Check in your changes and tag your release.
5. Build images in Google Cloud with `submit.sh`

On the production server (currently veers.library)
1. cd `/opt/ucdlib-iam-support/deploy`
2. git pull && git checkout <tag>
3. `docker compose pull` to download images from Google Cloud
4. `docker compose down` then `docker compose up -d`

There will be a brief service outage as the containers start up, so try to schedule deployents accordingly. If something goes wrong, you can always revert to the previously tagged images.

### Local Development

To get this application up and running for the first time:
1. Clone this repository
2. Checkout the branch you want to work on.
3. Run `./deploy/cmds/init-local-dev.sh` to install npm dependencies and generate dev bundles
4. Run `./deploy/cmds/build-local-dev.sh` to build custom docker images used by this project
5. Run `./deploy/cmds/generate-deployment-files.sh` to create the docker-compose file for local development
6. Download an env file in `./deploy/iam-support-local-dev` by running `./deploy/cmds/get-env-file-dev.sh`and then cd into the directory
7. Run `docker compose up`
