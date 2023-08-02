import { Command } from 'commander';
import groups from '../lib/groups.js';
import utils from '../lib/utils.js';
const program = new Command();

program
  .command('list')
  .description('list of library departments/groups')
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
    groups.groupsUcd(options);
  });

program
  .command('remove-head')
  .description('Remove head of group')
  .argument('<group_id>', 'group id')
  .action((group_id) => {
    groups.removeHead(group_id);
  });

program
  .command('inspect')
  .description('Inspect a single group')
  .argument('<group_id>', 'group id')
  .action((group_id) => {
    groups.inspect(group_id);
  });

  program.parse(process.argv);
