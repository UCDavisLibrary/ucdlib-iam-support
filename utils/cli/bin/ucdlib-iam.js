#! /usr/bin/env node
const {Command} = require('commander');
const config = require('../lib/cli-config');

const program = new Command();
program
  .name('ucdlib-iam')
  .version(config.version)
  .command('person', 'commands for querying ucd people records')
  .command('groups', 'queries and updates the pg database and displays all groups')
  .command('employees', 'commands for interacting with library employees records, including onboarding and separation')

program.parse(process.argv);