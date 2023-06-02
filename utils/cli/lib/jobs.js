const config = require('./cli-config');
const { printTable } = require('console-table-printer');

class jobsCli {

  async list(options){
    const { default: ucdlibJobs } = await import('@ucd-lib/iam-support-lib/src/utils/jobs.js');
    const { default: pg } = await import('@ucd-lib/iam-support-lib/src/utils/pg.js');

    const r = await ucdlibJobs.getRecent(options);
    await pg.client.end();
    if ( r.err ) {
      console.error(`Error getting recent jobs\n${r.err.message}`);
      return;
    }
    if ( r.res.rowCount === 0 ){
      console.log('No jobs found');
      return;
    }
    const table = r.res.rows.map(row => {
      const { id, name, success, start_time, end_time } = row;
      const start = start_time ? start_time.toISOString() : '';
      const end = end_time ? end_time.toISOString(): '';
      return { id, name, success, start, end };
    });
    printTable(table);
  }

  async names(){
    const { default: ucdlibJobs } = await import('@ucd-lib/iam-support-lib/src/utils/jobs.js');
    const { default: pg } = await import('@ucd-lib/iam-support-lib/src/utils/pg.js');

    const r = await ucdlibJobs.getUniqueJobNames();
    await pg.client.end();
    if ( r.err ) {
      console.error(`Error getting job names\n${r.err.message}`);
      return;
    }
    if ( r.res.rowCount === 0 ){
      console.log('No jobs found');
      return;
    }
    printTable(r.res.rows);
  }

  async inspect(id){
    const { default: ucdlibJobs } = await import('@ucd-lib/iam-support-lib/src/utils/jobs.js');
    const { default: pg } = await import('@ucd-lib/iam-support-lib/src/utils/pg.js');

    const jobResult = await ucdlibJobs.getById(id);
    const logCtResult = await ucdlibJobs.getJobLogCount(id);
    await pg.client.end();
    const error = jobResult.err || logCtResult.err;
    if ( error ) {
      console.error(`Error getting job details\n${error.message}`);
      return;
    }
    if ( jobResult.res.rowCount === 0 ){
      console.log('Job not found');
      return;
    }
    let logCount = 0;
    if ( logCtResult.res && logCtResult.res.rowCount ) {
      logCount = logCtResult.res.rows[0].count;
    }
    const table = jobResult.res.rows.map(row => {
      const { id, name, success, start_time, end_time } = row;
      const start = start_time ? start_time.toISOString() : '';
      const end = end_time ? end_time.toISOString(): '';
      return { id, name, success, start, end, logCount };
    });
    printTable(table);
    console.log();
    console.log(`Data:`);
    console.log(jobResult.res.rows[0].data);
    console.log();
  }

  async getLogs(id, options){
    const { default: ucdlibJobs } = await import('@ucd-lib/iam-support-lib/src/utils/jobs.js');
    const { default: pg } = await import('@ucd-lib/iam-support-lib/src/utils/pg.js');

    const r = await ucdlibJobs.getLogs(id, options);
    await pg.client.end();
    if ( r.err ) {
      console.error(`Error getting job logs\n${r.err.message}`);
      return;
    }
    if ( r.res.rowCount === 0 ){
      console.log('No logs found');
      return;
    }
    for( let row of r.res.rows ) {
      const data = {...row.data, time: row.created.toISOString()};
      console.log(data);
      console.log();
    }
  }

}

module.exports = new jobsCli();
