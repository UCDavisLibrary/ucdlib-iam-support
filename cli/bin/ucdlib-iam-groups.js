const {Command} = require('commander');
const groups = require('../lib/groups');
const program = new Command();

program
  .command('list')
  .description('list of library departments/groups')
  .option('-act, --active', 'Active Groups', false)
  .option('-arc, --archived', 'Only Archived Directories', false)
  .option('-g, --group_type <type>',  'group type by id')
  .option('-n, --type_name <char>',  'group by character name')
  .option('-o, --org', 'Part of Organization', false)
  .option('-pg, --parent_group <type>', 'parent group by id')
  .option('-p, --parent', 'A parent table', false)
  .option('-c, --child', 'A child table', false)
  .option('-f, --file <char>|@<file>','file name', 'default.json')

  .action((options) => {
    groups.groupsUcd(options);
  });

  program.parse(process.argv);