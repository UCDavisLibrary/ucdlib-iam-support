#! /usr/bin/env node
const {Command} = require('commander');
const config = require('../lib/cli-config');

const program = new Command();
program
  .name('ucdlib-iam')
  .version(config.version)
  .command('person', 'commands for interacting with people records')

program.parse(process.argv);