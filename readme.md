# Identity and Access Management (IAM) Support
This is a monorepo that contains services for managing personnel records and access control lists to be used by other internal UC Davis Library applications.

## Services Overview

### Web Application
The web application (`/services/app`) lets
1. HR submit personnel onboarding and separation forms, which create RT tickets (via API) for ITIS and facilities.
2. Supervisors request access to systems for their employees when onboarded (via form), which is then written to the onboarding RT ticket.
3. ITIS add/remove employees entered by HR into a postgres DB and our internal Keycloak realm, which is used for OIDC by other applications.

Additionally, some supplemental functionality is tacked on:
- A patron lookup tool to determine UCD affiliation
- Org chart update tool

### CLI
There is also a cli (`/services/cli`), which is designed to be used in conjunction with the web application in cases where a graphical user interface isn't necessary.

To use the CLI:
1. bash into container: `docker compose exec cli bash`
2. `node ./services/cli/bin/ucdlib-iam.js`

### Maintenance Utility
Located in `services/maintenance`, this container runs a node cron service for performing needed maintenance tasks, such as keeping employee records in sync with campus data stores. `ENABLE_MAINTENANCE` must be set to true.

### External API
Located in `services/api`, this is an express service that runs a JSON API designed to return personnel data to other applications.

You can view some example queries and responses in `services/api/examples`.

Before you can use the service (either locally or in prod), you will need to mint an API key by:
1. Go to keycloak. Make sure you are in the `internal` realm
2. Create a user, and try to be descriptive in the name e.g. `sa-intranet` would be a service account used by the intranet.
3. Create a passord in the credentials section. Make sure it is very long.
4. In the Role Mapping section,
   1. Click Assign Role
   2. Select Filter by Clients
   3. Search `iam-api`
   4. Select either `read` or `write` access depending on access level needed.

## Devops

### Local Development
To get this application up and running for the first time:
1. Clone this repository
2. Checkout the branch you want to work on.
3. Run `./deploy/cmds/init-local-dev.sh`
4. Review the env file downloaded to `./deploy/compose/ucdlib-iam-support-local-dev`
5. Run `./deploy/cmds/build-local-dev.sh main` to build image
6. Enter `./deploy/compose/ucdlib-iam-support-local-dev`, and run `docker compose up -d`
7. `./deploy/cmds/start-app.sh` to start the web application
8. `./deploy/cmds/watch-client.sh` to start the web application client watch process


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

### Testing with Keycloak
A primary function of this application is the maintenance of the `internal` realm in our keycloak instance, which handles auth for most of our internal-facing applications. When updating keycloak it is important to test out this functionality.

- Add `KEYCLOAK_ADMIN_BASE_URL=https://sandbox.auth.library.ucdavis.edu` to your local-dev env, to use the sandbox keycloak environment, which should be running the new version of keycloak. You must restart your docker compose cluster for this change to take effect.
- Separate an employee in the GUI, and then remove them from keycloak by entering the cli container and running `ucdlib-iam employees separate <separation-record-id>`
- Onboard an employee in the GUI, and then adopt them into keycloak by entering the cli container and running `ucdlib-iam employees adopt <onboarding-record-id>`
- While in the cli container, run the keycloak sync script: `cd /maintenance/src` and `node run-keycloak-sync.js`

## Using the Application

### Onboarding
The steps for onboarding an employee are as follows:
- HR uses the onboarding endpoint to submit a request, which generates an onboarding record and an associated RT ticket.
- The supervisor is CCed on the RT ticket, and a comment is created asking them to fill out a permissions request form.
- When they fill out the permissions request form, the response is written to the RT ticket.
- Provisioning proceeds as normal with the RT ticket being passed around ITIS personnel.
- An ITIS programmer has to manually add the employee to the local database and Keycloak by doing the following:
  - Clicking the `Add To Library IAM Database` on the GUI
  - Use cli commands:
    - `onboarding ls` to get the onboarding-record-id.
    - `employees adopt <onboarding-record-id>`
- Depending on the permissions requested, you might have to log into Keycloak and assign special permissions to clients.
- The onboarding record will be marked as resolved three days after the RT ticket is resolved.

#### Reconciling Records
Occasionally, HR will submit an onboarding request before a UCD IAM/UC Path record has been created for the employee. In this case, somebody (us, HR, or the supervisor) will have to go the onboarding record page, and select the employee's UCD IAM record when it becomes available.

### Separation
The steps for separating an employee are as follows:
- HR uses the separation endpoint to submit a request, which generates a separation record and an associated RT ticket.
- When the separation date has passed, an ITIS programmer will need to manually remove the employee from the local database and Keycloak by doing the following:
  - Clicking the `Deprovision From Library IAM Database` on the GUI
  - Or using the cli:
    - `separation ls` to get the separation record id
    - `employees separate <separation-record-id>`
- The system will send a reminder to the RT ticket when the separation date has passed.

### Discrepancy Notifications
When possible, the system will update local employee records when the UCD IAM record is updated - for example, when an employee changes their preferred name in the UC Davis directory. However, there are some cases where an automatic update isn't possible or is ill-advised, in which case a discrepancy notification is created. These notifications are bundled and sent to the ITIS error notification slack channel once a week. It is contingent on an ITIS programmer to resolve them:
- Going to the employee update page, and dismissing them with the widget
- Or using the cli:
  - `employees list-active-notifications` gets a list of active discrepancy notifications
  - Then you would fix the records it points out. The exact command varies depending on the notification, but they can all be found in `employees`. The `--help` flag will list available commands.
  - When complete run `dismiss-notifications <iamId of employee notification is regarding>`. Otherwise, you will get the same notification sent to slack next week.

