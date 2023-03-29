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

## Backup Utility

Located in `utils/backup`, this container will automatically back up the database to the `itis-iam` Google Cloud Storage bucket if `NIGHTLY_BACKUPS` and `BACKUP_ENV` env variables are set.

TODO: write script for retrieving writer/reader SA keys.

## Init Utility

Located in `utils/init`, this container will automatically hydrate the database upon `docker compose up` if local db is empty. Requires `RUN_INIT` and `DATA_ENV` env variables to be set.

## Node Cron Utility

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


For a complete list, see `config.js`.

### Local Development

To get this application up and running for the first time:
1. Clone this repository
2. Checkout the branch you want to work on.
3. Run `./deploy/cmds/init-local-dev.sh` to install npm dependencies and generate dev bundles
4. Run `./deploy/cmds/build-local-dev.sh` to build custom docker images used by this project
5. Run `./deploy/cmds/generate-deployment-files.sh` to create the docker-compose file for local development
6. Create and fill out an env file in `./deploy/iam-support-local-dev` and then cd into the directory
7. Run `docker compose up`