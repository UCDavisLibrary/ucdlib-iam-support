const {Command} = require('commander');
const people = require('../lib/people');
const program = new Command();

program
  .command('search-ucd')
  .description('Search the UC Davis IAM system')
  .action((options) => {
    people.searchUcd();
  });

  program.parse(process.argv);