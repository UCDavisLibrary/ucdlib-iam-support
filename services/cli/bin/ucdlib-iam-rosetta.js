import { Command, Option } from 'commander';

import utils from '../lib/utils.js';
import rosetta from '#lib/utils/rosetta.js';
import rosettaCli from '../lib/rosetta.js';


const program = new Command();

const nameFields = ['last', 'first', 'full'];

program
  .command('get')
  .description('Get a UCD affiliate by a unique identifier')
  .argument('<id>', 'Affiliate unique indentifier')
  .addOption(new Option('-t, --idtype <idtype>', 'Id type').choices(rosetta.personIdTypes).default(rosetta.personIdTypes[0]))
  .action((id, options) => {
    rosettaCli.get(id, options);
  }
);

program
  .command('search')
  .description('Search for UCD affiliates by name')
  .argument('<name>', 'Affiliate name')
  .addOption(new Option('-f, --field <field>', 'Name field to search. If using "full" field, list the last name first, and then separate with a comma').choices(nameFields).default(nameFields[0]))
  .option('-p, --partial', 'Perform a partial (LIKE) match instead of an exact match')
  .option('-l, --limit <number>', 'Limit the number of results returned', parseInt)
  .action((name, options) => {
    rosettaCli.search(name, options);
  });

program.parse(process.argv);