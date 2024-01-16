import { Command, Option } from 'commander';
import groups from '../lib/groups.js';
import utils from '../lib/utils.js';
const program = new Command();

program
  .command('list')
  .alias('ls')
  .description('List of library departments/groups')
  .option('-act, --active', 'Active Groups', false)
  .option('-arc, --archived', 'Only Archived Groups', false)
  .option('-g, --group_type <type>',  'group type by id')
  .option('-n, --name <char>',  'group by character name')
  .option('-ns, --name_short <char>',  'group by character name')
  .option('-tn, --type_name <char>',  'group by character name')
  .option('-o, --org', 'Part of Organization', false)
  .option('-pg, --parent_group <type>', 'parent group by id')
  .option('-p, --parent', 'A parent table', false)
  .option('-c, --child', 'A child table', false)
  .option('--return_head', 'Return head of group', false)
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
  .option('-f, --force', 'Force removal of employee', false)
  .action((group_id, employee_id, options) => {
    groups.addMember(group_id, employee_id, options);
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
