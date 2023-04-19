const {Command, Option} = require('commander');
const employees = require('../lib/employees');
const program = new Command();

const idChoices = ['iamId', 'employeeId', 'userId', 'email', 'id'];

program
  .command('adopt')
  .description('Adopt an employee into the Library IAM database')
  .argument('<onboardingId>', 'Onboarding record id')
  .option('--no-provision', 'do not provision a user account in keycloak')
  .option('-f, --force', 'force adoption even if employee is missing crucial data')
  .option('--no-rt', 'do not send a request tracker ticket for the adoption')
  .action((onboardingId, options) => {
    employees.adopt(onboardingId, options);
  }
);

program
  .command('dismiss-notifications')
  .description('Dismiss all record discrepancy notifications for an employee')
  .argument('<iamId>', 'Employee IAM id')
  .action((iamId) => {
    employees.dismissRecordDiscrepancyNotifications(iamId);
  }
);

program
  .command('update-creation-date')
  .description('Update the creation date of an employee record to now. This is useful for fixing appt-date-anomaly errors')
  .argument('<id>', 'an Employee unique indentifier')
  .addOption(new Option('-t, --idtype <idtype>', 'Id type').choices(idChoices).default('iamId'))
  .action((id, options) => {
    employees.updateCreationDate(id, options.idtype);
  }
);

  program.parse(process.argv);