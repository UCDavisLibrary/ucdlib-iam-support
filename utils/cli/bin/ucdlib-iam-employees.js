import { Command, Option } from 'commander';
import employees from '../lib/employees.js';
const program = new Command();

const idChoices = ['iamId', 'employeeId', 'userId', 'email', 'id'];
const outputChoices = ['table', 'json'];

program
  .command('remove')
  .alias('rm')
  .description('Remove an employee from the local database. Does not remove from keycloak.')
  .argument('<id>', 'Employee unique indentifier')
  .addOption(new Option('-t, --idtype <idtype>', 'Id type').choices(idChoices).default('iamId'))
  .addOption(new Option('-f, --force', 'Force removal of employee'))
  .action((id, options) => {
    employees.removeEmployee(id, options);
  }
);

program
  .command('search')
  .description('Search for employees by name')
  .argument('<name>', 'Employee name')
  //.addOption(new Option('--format <format>', 'Output format').choices(outputChoices).default('table'))
  .action((name, options) => {
    employees.search(name, options);
  }
);

program
  .command('get')
  .description('Get an employee by id')
  .argument('<id>', 'Employee unique indentifier')
  .addOption(new Option('-t, --idtype <idtype>', 'Id type').choices(idChoices).default('iamId'))
  .action((id, options) => {
    employees.get(id, options);
  }
);

program
  .command('update-property')
  .description('Update an employee property')
  .argument('<id>', 'Employee unique indentifier')
  .argument('<property>', 'Property to update')
  .argument('<value>', 'New value')
  .addOption(new Option('-t, --idtype <idtype>', 'Id type').choices(idChoices).default('iamId'))
  .action((id, property, value, options) => {
    employees.updateProperty(id, property, value, options);
  }
);

program
  .command('list-active-notifications')
  .description('List all active record discrepancy notifications. Optionally filter by creation date.')
  .argument('[intervalLength]', 'Interval length to filter by creation date. e.g. 7')
  .argument('[intervalUnit]', 'Interval unit to filter by creation date. e.g. days')
  .action((intervalLength, intervalUnit) => {
    employees.listActiveRecordDiscrepancyNotifications(intervalLength, intervalUnit);
  }
);

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
