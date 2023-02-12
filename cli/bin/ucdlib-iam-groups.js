const {Command} = require('commander');
const groups = require('../lib/groups');
const program = new Command();

program
  .command('list')
  .description('produce list of pg database')
  .option('-act, --active', 'Only Active Directories', false)
  .option('-arc, --archived', 'Only Archived Directories', false)
  .option('-g, --group_name <char>|@<file>')
  .option('-o, --org', 'Part of Organization', false)
  .option('-pg, --parent_group <char>|@<file>')
  .option('-p, --parent', 'A parent table', false)
  .option('-c, --child', 'A child table', false)
  .option('-f, --file <char>|@<file>','file name', 'default.json')

  .action((options) => {
    groups.groupsUcd(options);
  });

  program.parse(process.argv);