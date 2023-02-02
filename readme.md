# Identity and Access Management (IAM) Support
This is a monorepo that contains applications and utilities for managing the [IAM system](https://github.com/UCDavisLibrary/keycloak-deployment) at the UC Davis Library.

Technical documentation can be found in this [Google Doc](https://docs.google.com/document/d/129KuqatZVwj7Fl_am4E3eTJgq6Fj1MNjo66MbI5mMok/edit?usp=sharing).

## Application
The application (in `/app`) is designed to be used by 
1. HR for initiating onboarding and separation processes
2. Supervisors to request access to systems for their employees when onboarded.

The application does not assign permissions, but creates, routes, and tracks system provisioning tickets via the [Request Tracker (RT)](https://rt.lib.ucdavis.edu/) API. 

## CLI
The command line interface (in `/cli`) is designed to be used by ITIS to perform adminstrative actions, such as loading a user into Keycloak and assigning permissions.

## Deployment

### Environmental Variables

Most relevant env variables:

| Name | Notes |
| ---- | ----- |
| `UCDLIB_APP_HOST_PORT` | |
| `UCDLIB_APP_ENV` | 'prod' or 'dev'. By default, local development starts with 'dev' |
| `UCD_IAM_API_KEY` | required for much functionality |

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