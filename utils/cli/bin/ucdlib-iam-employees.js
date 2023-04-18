const {Command} = require('commander');
const employees = require('../lib/employees');
const program = new Command();

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

  program.parse(process.argv);