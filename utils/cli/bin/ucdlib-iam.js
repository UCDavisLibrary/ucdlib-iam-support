#! /usr/bin/env node
import { Command } from 'commander';
import config from '../lib/cli-config.js';

const program = new Command();
program
  .name('ucdlib-iam')
  .version(config.version)
  .command('person', 'commands for querying ucd people records')
  .command('groups', 'queries and updates the pg database and displays all groups')
  .command('employees', 'commands for interacting with library employees records, including onboarding and separation')
  .command('jobs', 'query and inspect recent cron job runs')
  .command('onboarding', 'commands for interacting with onboarding records')

program.parse(process.argv);
