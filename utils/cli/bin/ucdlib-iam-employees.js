import { Command, Option } from 'commander';
import employees from '../lib/employees.js';
import utils from '../lib/utils.js';
const program = new Command();

const outputChoices = ['table', 'json'];

program
  .command('remove')
  .alias('rm')
  .description('Remove an employee from the local database. Does not remove from keycloak.')
  .argument('<id>', 'Employee unique indentifier')
  .addOption(new Option('-t, --idtype <idtype>', 'Id type').choices(utils.employeeIds).default('iamId'))
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
  .addOption(new Option('-t, --idtype <idtype>', 'Id type').choices(utils.employeeIds).default('iamId'))
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
  .addOption(new Option('-t, --idtype <idtype>', 'Id type').choices(utils.employeeIds).default('iamId'))
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
  .command('separate')
  .description('Delete local employee record and remove from keycloak')
  .argument('<separationId>', 'Employee unique indentifier')
  .option('--no-deprovision', 'do not remove the user account from keycloak')
  .option('--no-rm', 'do not remove the employee record from the local database')
  .option('--no-rt', 'do not comment on the RT ticket')
  .action((separationId, options) => {
    employees.separate(separationId, options);
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
  .addOption(new Option('-t, --idtype <idtype>', 'Id type').choices(utils.employeeIds).default('iamId'))
  .action((id, options) => {
    employees.updateCreationDate(id, options.idtype);
  }
);

program
  .command('update-primary-association')
  .description('Update the primary association of an employee record. If custom_supervisor is set to false, the supervisor will be updated.')
  .argument('<id>', 'an Employee unique indentifier')
  .argument('<deptCode>', 'Department code of the new primary association')
  .argument('<titleCode>', 'Title code of the new primary association')
  .addOption(new Option('-t, --idtype <idtype>', 'Id type').choices(utils.employeeIds).default('iamId'))
  .action((id, deptCode, titleCode, options) => {
    employees.updatePrimaryAssociation(id, deptCode, titleCode, options);
    }
);

program
  .command('reset-primary-association')
  .description('Reset the primary association of an employee to their only association.')
  .argument('<id>', 'an Employee unique indentifier')
  .addOption(new Option('-t, --idtype <idtype>', 'Id type').choices(utils.employeeIds).default('iamId'))
  .action((id, options) => {
    employees.resetPrimaryAssociation(id, options);
  }
);

program
  .command('create-template')
  .description('Make a json template for an employee record. Should be used in conjunction with the add command')
  .argument('<name>', 'File name')
  .action((name) => {
    employees.createTemplate(name);
  }
);

program
  .command('add')
  .description('Add a UC Davis employee to the local database. Skips the onboarding process.')
  .argument('<file>', 'Employee record json file. Use the create-template command to make one.')
  .option('-f, --force', 'force adoption even if employee is missing crucial data')
  .action((file, options) => {
    employees.addToDb(file, options);
  }
);

  program.parse(process.argv);
