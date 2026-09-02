# Identity and Access Management (IAM) Support
This is a monorepo that contains services for managing personnel records and access control lists to be used by other internal UC Davis Library applications.

## Table of Contents
- [Services Overview](#services-overview)
  - [Web Application](#web-application)
  - [CLI](#cli)
  - [Maintenance Utility](#maintenance-utility)
  - [External API](#external-api)
- [Additional Features](#additional-features)
  - [Onboarding Checklist Reminders](#onboarding-checklist-reminders)
  - [Org Chart Upload Tool](#org-chart-upload-tool)
  - [Patron Lookup Tool](#patron-lookup-tool)
  - [Employee Update Tool](#employee-update-tool)
- [Devops](#devops)
  - [Local Development](#local-development)
  - [Production Deployment](#production-deployment)
  - [Testing with Keycloak](#testing-with-keycloak)
- [Using the Application](#using-the-application)
  - [Onboarding](#onboarding)
    - [Reconciling Records](#reconciling-records)
  - [Separation](#separation)
  - [Discrepancy Notifications](#discrepancy-notifications)

## Services Overview

### Web Application
The primary function of the web application (`/services/app`) is to allow
1. HR submit personnel onboarding and separation forms, which create RT tickets (via API) for ITIS and facilities.
2. Supervisors request access to systems for their employees when onboarded (via form), which is then written to the onboarding RT ticket.
3. ITIS add/remove employees entered by HR into a postgres DB and our internal Keycloak realm, which is used for OIDC by other applications.

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

## Additional Features

### Onboarding Checklist Reminders
The system sends automated email reminders to a new employee's supervisor at set milestones after their start date, prompting them to complete an onboarding checklist appropriate to that stage:
- First Day/First Week (sent on the hire date)
- First Month (sent 2 weeks after the hire date)
- First Six Months (sent 3 months after the hire date)
- First Year (sent 6 months after the hire date)

Configuration (admin/HR only) is done under `Support Tools > Onboarding Reminders`, where each interval can be disabled, and given a checklist name and link. A "from" email address for these reminders is also configured there.

Individual employees can be excluded via a "Don't send onboarding checklist reminder emails" checkbox on the new onboarding request form. Reminders are also automatically disabled for a request if the employee is later removed from the local database (e.g. after separation), except for the First Day/Week reminder, which may fire before the employee has been added to the local database yet.

This runs as a weekday-only cron job in the `maintenance` service (`services/maintenance/src/send-onboarding-reminders.js`), and is tracked like other maintenance jobs via the `jobs`/`job_logs` tables. It relies on basic SMTP, configured via env vars:
- `SMTP_ENABLED` - must be explicitly set to `true` for emails to actually send. Defaults to `false`.
- `SMTP_HOST` / `SMTP_PORT` - defaults to `smtp.lib.ucdavis.edu` / `25`.
- `SMTP_RECIPIENT_OVERRIDE` - intended for local development. When set, all reminder emails are redirected to this address instead of the actual supervisor, regardless of the recipient computed by the job.

### Org Chart Upload Tool
Located under `Support Tools > Organizational Chart`, this lets an admin, HR, or `orgchart`-role user publish updated org chart data. The user uploads a CSV export with a specific set of required columns (name, external ID, email, department, title, appointment type, and reports-to ID).

Before submitting, the client:
- Validates the CSV headers and required fields.
- Anonymizes the data by replacing the real HR/employee IDs with sequential anonymized IDs, so the original external IDs never leave the browser.
- Requires exactly one root record (someone with no "reports to" value) - typically the University Librarian - and blocks submission otherwise.

On submit, the server backs up the previously published file, then uploads the new anonymized JSON via SFTP to a remote files server (configured via the `ORGCHART_SFTP_*` env vars). This application does not render the chart itself - it only publishes the data for a separate org chart display tool to consume, which can be found on the [main library website](https://library.ucdavis.edu/directory/library-organizational-chart/). It's a manual, one-off action with no automation or cron involved.

### Patron Lookup Tool
Located under `Support Tools > Patron Lookup`, this lets staff (admin, HR, or `search-patrons`-role users) look up a UC Davis person by name, student ID, employee ID, Kerberos/user ID, or email, to confirm their identity and affiliation status.

A lookup queries:
- The **UC Davis IAM API** for identity details and affiliation flags (student, employee, faculty, staff, external), plus department/appointment and student association history.
- **Alma** (the library system) for an existing patron record, if one exists.
- **LDAP** (the campus directory) for UCD affiliation and sponsor expiration date.

The result is a consolidated view useful for confirming whether someone is a current, sponsored, or otherwise eligible UC Davis Library patron.

### Employee Update Tool
Located under `Support Tools > Employee Update Tool`, this lets an admin or HR user search for an existing local employee record and:
- Update their title.
- Move them to a different department, or change department-head status (including resolving conflicts if a department already has a head).
- Review and dismiss any active discrepancy notifications for that employee (see [Discrepancy Notifications](#discrepancy-notifications)).

## Devops

### Local Development
To get this application up and running for the first time:
1. Clone this repository
2. Checkout the branch you want to work on.
3. Run `./deploy/cmds/init-local-dev.sh`
4. Review the env file downloaded to `./deploy/compose/ucdlib-iam-support-local-dev`
5. Run `./deploy/cmds/build-local-dev.sh sandbox` to build image
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
- While in the cli container, run the keycloak sync script: `cd maintenance/src` and `node run-keycloak-sync.js`

To verify that the authentication/authorization still works on the API service for other applications:

- Set `UCDLIB_KEYCLOAK_URL=https://sandbox.auth.library.ucdavis.edu` in your env
- Ensure that the API service is running (`cmds/start-api.sh`)
- Run a test query from `/services/api/examples`

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
- When the Last Day of System Access has passed, an ITIS programmer will need to manually remove the employee from the local database and Keycloak by doing the following:
  - Clicking the `Deprovision From Library IAM Database` on the GUI
  - Or using the cli:
    - `separation ls` to get the separation record id
    - `employees separate <separation-record-id>`
- The system will send a reminder to the RT ticket when the Last Day of System Access has passed.

### Discrepancy Notifications
When possible, the system will update local employee records when the UCD IAM record is updated - for example, when an employee changes their preferred name in the UC Davis directory. However, there are some cases where an automatic update isn't possible or is ill-advised, in which case a discrepancy notification is created. These notifications are bundled and sent to the ITIS error notification slack channel once a week. It is contingent on an ITIS programmer to resolve them:
- Going to the employee update page, and dismissing them with the widget
- Or using the cli:
  - `employees list-active-notifications` gets a list of active discrepancy notifications
  - Then you would fix the records it points out. The exact command varies depending on the notification, but they can all be found in `employees`. The `--help` flag will list available commands.
  - When complete run `dismiss-notifications <iamId of employee notification is regarding>`. Otherwise, you will get the same notification sent to slack next week.

