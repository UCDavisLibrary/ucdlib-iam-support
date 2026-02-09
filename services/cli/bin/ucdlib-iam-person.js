import { Command } from 'commander';
import people from '../lib/people.js';
const program = new Command();

program
  .command('search-ucd')
  .description('Search the UC Davis IAM system')
  .option('-eid, --employeeID <char>|@<file>')
  .option('-sid, --studentID <char>|@<file>')
  .option('-n, --name <char>|@<file>')
  .option('-k, --kerberos <char>|@<file>')
  .option('-e, --email <char>|@<file>')
  .option('-f, --first <char>|@<file>','first name', '')
  .option('-m, --middle <char>|@<file>','middle name', '')
  .option('-l, --last <char>|@<file>','last name', '')
  .option('-f, --file <char>|@<file>','file name', 'default.json')
  .option('-o, --online', 'Query Online Directory', false)
  .action((options) => {
    people.searchUcd(options);
  });

  program.parse(process.argv);
