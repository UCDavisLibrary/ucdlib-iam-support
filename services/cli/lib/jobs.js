import config from './cli-config.js';
import { printTable } from 'console-table-printer';
import ucdlibJobs from '@ucd-lib/iam-support-lib/src/utils/jobs.js';
import pg from '@ucd-lib/iam-support-lib/src/utils/pg.js';

class jobsCli {

  async list(options){
    const r = await ucdlibJobs.getRecent(options);
    await pg.pool.end();
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
    const r = await ucdlibJobs.getUniqueJobNames();
    await pg.pool.end();
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
    const jobResult = await ucdlibJobs.getById(id);
    const logCtResult = await ucdlibJobs.getJobLogCount(id);
    await pg.pool.end();
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
    const r = await ucdlibJobs.getLogs(id, options);
    await pg.pool.end();
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

export default new jobsCli();
