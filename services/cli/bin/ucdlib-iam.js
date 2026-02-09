#! /usr/bin/env node
import { Command } from 'commander';
import config from '../lib/cli-config.js';

const program = new Command();
program
  .name('ucdlib-iam')
  .version(config.version)
  .command('person', 'Query the UC Davis IAM API for an affiliated person')
  .command('groups', 'Query and update library departments and groups')
  .command('employees', 'Query and update employees records, including onboarding and separation')
  .command('jobs', 'Query and inspect recent cron job runs')
  .command('onboarding', 'Query and inspect onboarding records. To actually convert an onboarding record to an employee record, use the employees command.')
  .command('separation', 'Query and inspect separation records. To actually separate an employee, use the employees command.')

program.parse(process.argv);
