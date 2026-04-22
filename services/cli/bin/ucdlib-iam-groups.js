import { Command, Option } from 'commander';

import groups from '../lib/groups.js';
import utils from '../lib/utils.js';

const program = new Command();

program
  .command('list')
  .alias('ls')
  .alias('query')
  .description('List or query library departments/groups')
  .option('-a, --active', 'Only active groups (use --no-active for archived only)')
  .option('-i, --id <ids...>', 'Filter by group id(s)')
  .option('-g, --group_type <type>', 'Filter by group type id')
  .option('-n, --name <char>', 'Case-insensitive substring filter against group name or short name')
  .option('-o, --org', 'Only groups that are part of the org', false)
  .option('-p, --parent', 'Include parent group in results', false)
  .option('-c, --child', 'Include child groups in results', false)
  .option('--head', 'Include head of group in results', false)
  .option('-m, --member', 'Include members of group in results. Cannot be used with --head', false)
  .action((options) => {
    groups.list(options);
  });

program
  .command('remove-head')
  .description('Remove head of group')
  .argument('<group_id>', 'group id')
  .action((group_id) => {
    groups.removeHead(group_id);
  });

program
  .command('add-head')
  .description('Add head of group')
  .argument('<group_id>', 'group id')
  .argument('<employee_id>', 'Employee unique indentifier. See idtype option for possible values')
  .addOption(new Option('-t, --idtype <idtype>', 'Id type').choices(utils.employeeIds).default('iamId'))
  .option('-m, --member', 'Overrides error employee is not already a group member.', false)
  .action((group_id, employee_id, options) => {
    groups.addHead(group_id, employee_id, options);
  });

program
  .command('remove-member')
  .description('Remove member from group')
  .argument('<group_id>', 'group id')
  .argument('<employee_id>', 'Employee unique indentifier. See idtype option for possible values')
  .addOption(new Option('-t, --idtype <idtype>', 'Id type').choices(utils.employeeIds).default('iamId'))
  .option('-f, --force', 'Force removal of employee', false)
  .action((group_id, employee_id, options) => {
    groups.removeMember(group_id, employee_id, options);
  });

program
  .command('add-member')
  .description('Add member to group')
  .argument('<group_id>', 'group id')
  .argument('<employee_id>', 'Employee unique indentifier. See idtype option for possible values')
  .addOption(new Option('-t, --idtype <idtype>', 'Id type').choices(utils.employeeIds).default('iamId'))
  .option('-f, --force', 'Force addition of employee', false)
  .action((group_id, employee_id, options) => {
    groups.addMember(group_id, employee_id, options);
  });

program
  .command('move-all-members')
  .description('Move all members from one group to another')
  .argument('<from_group_id>', 'From group id')
  .argument('<to_group_id>', 'To group id')
  .action((from_group_id, to_group_id) => {
    groups.moveAllMembers(from_group_id, to_group_id);
  });

program
  .command('create-template')
  .description('Make a json template for a group record. Should be used in conjunction with the create command')
  .argument('<name>', 'File name')
  .action((name) => {
    groups.createTemplate(name);
  });

program
  .command('create')
  .description('Create a new group')
  .argument('<file>', 'File with group data')
  .action((file) => {
    groups.create(file);
  });


program
  .command('inspect')
  .description('Retrieve all group information')
  .argument('<group_id...>', 'A group id or ids')
  .action((group_id) => {
    groups.inspect(group_id);
  });

  program
  .command('update-property')
  .description('Update a group property')
  .argument('<id>', 'Group id')
  .argument('<property>', 'Property to update')
  .argument('<value>', 'New value')
  .action((id, property, value) => {
    groups.updateProperty(id, property, value);
  }
);

  program.parse(process.argv);
