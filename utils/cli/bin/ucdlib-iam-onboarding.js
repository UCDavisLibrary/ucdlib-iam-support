import { Command, Option } from 'commander';
import onboarding from '../lib/onboarding.js';
const program = new Command();

const statusOpenChoices = ['open', 'resolved', 'all'];

program
  .command('list')
  .alias('ls')
  .description('List onboarding records')
  .addOption(new Option('--statustype <statustype>', 'Id type').choices(statusOpenChoices).default('open'))
  .action((options) => {
    onboarding.list(options);
  }
);

program
  .command('inspect')
  .description('Inspect an onboarding record')
  .argument('<id>', 'Onboarding record id')
  .action((id) => {
    onboarding.inspect(id);
  }
);

program
  .command('remove')
  .alias('rm')
  .description('Remove an onboarding record and any associated permission requests from database')
  .argument('<id>', 'Onboarding record id')
  .action((id, options) => {
    onboarding.remove(id, options);
  }
);

program
  .command('set-ucd-iam-record')
  .description("Retrieves and sets the employee's UCD IAM record in the additional_data section of the onboarding record")
  .argument('<id>', 'Onboarding record id')
  .option('-u --update', 'Update the record if it already exists')
  .action((id, options) => {
    onboarding.setUcdIamRecord(id, options);
  }
);

  program.parse(process.argv);
