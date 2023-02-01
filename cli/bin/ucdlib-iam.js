#! /usr/bin/env node
const {Command} = require('commander');
const program = new Command();
program
  .name('ucdlib-iam')
  .version(process.env.APP_VERSION)

program.parse(process.argv);