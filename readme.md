# Identity and Access Management (IAM) Support
This is a monorepo that contains applications and utilities for managing the [IAM system](https://github.com/UCDavisLibrary/keycloak-deployment) at the UC Davis Library.

- [App Components](#app-components)
- [Deployment](#deployment)
- [Using the Application](#using-the-application)

## App Components

### Application Client
The application (in `/app`) is designed to be used by 
1. HR for initiating onboarding and separation processes
2. Supervisors to request access to systems for their employees when onboarded.

The application does not assign permissions, but creates, routes, and tracks system provisioning tickets via the [Request Tracker (RT)](https://rt.lib.ucdavis.edu/) API. 

### CLI
The command line interface (in `/utils/cli`) is designed to be used by ITIS to perform adminstrative actions, such as loading a user into Keycloak and assigning permissions.

To use the CLI:
1. bash into container: `docker compose exec cli bash`
2. run commands: `ucdlib-iam --help`

### Backup Utility

Located in `utils/backup`, this container will automatically back up the database to the `itis-iam` Google Cloud Storage bucket if `NIGHTLY_BACKUPS` and `BACKUP_ENV` env variables are set.

In order to backup, you need a GC key, which can be obtained by running `deploy/cmds/get-writer-key.sh`.

### Init Utility

Located in `utils/init`, this container will automatically hydrate the database upon `docker compose up` if local db is empty. Requires `RUN_INIT` and `DATA_ENV` env variables to be set.

### Maintenance Utility
Located in `utils/maintenance`, this container runs a node cron service for performing needed maintenance tasks, such as keeping employee records in sync with campus data stores. `ENABLE_MAINTENANCE` must be set to true.

### External API
Located in `utils/api`, this is an express service that runs a JSON API designed to return personnel data to other applications.

You can view some example queries and responses in `utils/api/examples`.

Before you can use the service (either locally or in prod), you will need to mint an API key by:
1. Go to keycloak. Make sure you are in the `internal` realm
2. Create a user, and try to be descriptive in the name e.g. `sa-intranet` would be a service account used by the intranet.
3. Create a passord in the credentials section. Make sure it is very long.
4. In the Role Mapping section,
   1. Click Assign Role
   2. Select Filter by Clients
   3. Search `iam-api`
   4. Select either `read` or `write` access depending on access level needed.

### Shared Code
Any code shared by the application and cli should be placed in the `/lib` directory. Both the app and cli docker images use the same base image that npm links this shared code as the `@ucd-lib/iam-support-lib` package.

Technical documentation created at the start of the project can be found in this [Google Doc](https://docs.google.com/document/d/129KuqatZVwj7Fl_am4E3eTJgq6Fj1MNjo66MbI5mMok/edit?usp=sharing).

## Deployment

### Local Development
To get this application up and running for the first time:
1. Clone this repository
2. Checkout the branch you want to work on.
3. Run `./deploy/cmds/init-local-dev.sh` to download gc key, env, and build js
4. Review the env file downloaded to `./deploy/compose/ucdlib-iam-support-local-dev`
5. Run `./deploy/cmds/build-local-dev.sh` to build images
6. Enter `./deploy/compose/ucdlib-iam-support-local-dev`, and run `docker compose up -d`

### Production Deployment

On your machine:
1. Merge your changes into main, tag, and push
2. Update production compose.yaml file with new tag
3. Update the cork-build-registry with your new tag
4. Build images with with `deploy/cmds/build.sh <tag>`

On the production server (currently veers.library)
1. cd `/opt/ucdlib-iam-support/deploy/ucdlib-iam-support-prod` and git pull
3. `docker compose pull` to download images from Google Cloud
4. `docker compose down` then `docker compose up -d`

There will be a brief service outage as the containers start up, so try to schedule deployents accordingly. If something goes wrong, you can always revert to the previously tagged images.

## Using the Application

### Onboarding
The steps for onboarding an employee are as follows:
- HR uses the onboarding endpoint to submit a request, which generates an onboarding record and an associated RT ticket.
- The supervisor is CCed on the RT ticket, and a comment is created asking them to fill out a permissions request form.
- When they fill out the permissions request form, the response is written to the RT ticket.
- Provisioning proceeds as normal with the RT ticket being passed around ITIS personnel.
- An ITIS programmer has to manually add the employee to the local database and Keycloak by doing the following:
  - `ssh veers.library.ucdavis.edu`
  - `cd /opt/ucdlib-iam-support/deploy && docker compose exec cli bash`
  - `ucdlib-iam onboarding ls` to get the onboarding-record-id.
  - `ucdlib-iam employees adopt <onboarding-record-id>`
- Depending on the permissions requested, you might have to log into Keycloak and assign special permissions to clients.
- The onboarding record will be marked as resolved three days after the RT ticket is resolved.

#### Reconciling Records
Occasionally, HR will submit an onboarding request before a UCD IAM/UC Path record has been created for the employee. In this case, somebody (us, HR, or the supervisor) will have to go the onboarding record page, and select the employee's UCD IAM record when it becomes available.

### Separation
The steps for separating an employee are as follows:
- HR uses the separation endpoint to submit a request, which generates a separation record and an associated RT ticket.
- When the separation date has passed, an ITIS programmer will need to manually remove the employee from the local database and Keycloak by doing the following:
  - `ssh veers.library.ucdavis.edu`
  - `cd /opt/ucdlib-iam-support/deploy && docker compose exec cli bash`
  - `ucdlib-iam separation ls` to get the separation record id
  - `ucdlib-iam employees separate <separation-record-id>`
- The system will send a reminder to the RT ticket when the separation date has passed.

### Discrepancy Notifications
When possible, the system will update local employee records when the UCD IAM record is updated - for example, when an employee changes their preferred name in the UC Davis directory. However, there are some cases where an automatic update isn't possible or is ill-advised, in which case a discrepancy notification is created. These notifications are bundled and sent to the ITIS error notification slack channel once a week. It is contingent on an ITIS programmer to resolve them:
- `ssh veers.library.ucdavis.edu`
- `cd /opt/ucdlib-iam-support/deploy && docker compose exec cli bash`
- `ucdlib-iam employees list-active-notifications` gets a list of active discrepancy notifications
- Then you would fix the records it points out. The exact command varies depending on the notification, but they can all be found in `ucdlib-iam employees`. The `--help` flag will list available commands.
- When complete run `ucdlib-iam employees dismiss-notifications <iamId of employee notification is regarding>`. Otherwise, you will get the same notification sent to slack next week.

