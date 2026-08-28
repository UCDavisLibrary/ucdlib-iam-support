import { Command, Option } from 'commander';

import separation from '../lib/separation.js';

const program = new Command();

const statusOpenChoices = ['open', 'resolved', 'all'];

program
  .command('list')
  .alias('ls')
  .description('List separation records')
  .addOption(new Option('--statustype <statustype>', 'Id type').choices(statusOpenChoices).default('open'))
  .action((options) => {
    separation.list(options);
  }
);

program
  .command('inspect')
  .description('Inspect a separation record')
  .argument('<id>', 'Separation record id')
  .action((id) => {
    separation.inspect(id);
  }
);

program
  .command('remove')
  .alias('rm')
  .description('Remove a separation record and any associated permission requests from database')
  .argument('<id>', 'Separation record id')
  .action((id, options) => {
    separation.remove(id, options);
  }
);

program
  .command('replace-department-head')
  .description('Replace a department head for a separation record')
  .argument('<separation-id>', 'Separation record id')
  .argument('<new-department-head>', 'New department head IAM ID')
  .action((id, newHeadId) => {
    separation.replaceDepartmentHead(id, newHeadId);
  }
);

  program.parse(process.argv);
