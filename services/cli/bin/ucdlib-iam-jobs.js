import { Command } from 'commander';
import jobs from '../lib/jobs.js';
const program = new Command();

program
  .command('list')
  .alias('ls')
  .description('List most recent job runs')
  .option('-l, --limit <limit>', 'Number of jobs to list', 10)
  .option('-n, --name <names...>', 'Filter by job name')
  .option('-s, --success', 'Show only successful jobs')
  .option('-f, --failure', 'Show only failed jobs')
  .action((options) => {
    jobs.list(options);
  }
);

program
  .command('names')
  .description('List unique job names')
  .action(() => {
    jobs.names();
  }
);

program
  .command('inspect <id>')
  .description('Inspect a job run')
  .action((id) => {
    jobs.inspect(id);
  }
);

program
  .command('logs <id>')
  .description('Get logs for a job run')
  .option('-l, --limit <limit>', 'Number of logs to return', 1000)
  .option('-o, --offset <offset>', 'Number of logs to skip', 0)
  .action((id, options) => {
    jobs.getLogs(id, options);
  }
);

program.parse(process.argv);
