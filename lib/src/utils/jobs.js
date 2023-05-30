import pg from "./pg.js";
import TextUtils from "./text.js";

/**
 * @classdesc A class to handle all database interactions for the jobs & job_logs table
 * which track the status of cron jobs run for this application.
 */
class UcdlibJobs {

  constructor(){
    this.tableName = 'jobs';
    this.logTableName = 'job_logs';

    this.startedJobs = [];
  }

  /**
   * @description Create an entry for a new job run
   * @param {String} name - Name of the job. Required.
   * @param {Object} data - Data to store with the job. Optional.
   * @returns {Object} {job, res, err} - job is a UcdlibJob object
   */
  async start(name, data={}){
    const text  = `
      INSERT INTO ${this.tableName} (name, data)
      VALUES ($1, $2)
      RETURNING *
    `;
    const params = [name, data];
    const r = await pg.query(text, params);
    if ( !r.err ) {
      r.job = new UcdlibJob(r.res.rows[0], this);
      this.startedJobs.push(r.job);
    }
    return r;
  }

  /**
   * @description End an existing job run
   * @param {Number} jobId - ID of the job to end. Required.
   * @param {Object} data - Data to store with the job. Optional.
   * @param {Boolean} success - Whether the job was successful.
   * @returns
   */
  async end(jobId, data={}, success=true){
    const text  = `
      UPDATE ${this.tableName}
      SET data = $1, end_time = NOW() ${success ? ', success = true' : ''}
      WHERE id = $2
      RETURNING *
    `;
    const params = [data, jobId];
    const r = await pg.query(text, params);
    return r;
  }
}

/**
 * @classdesc A class to handle all database interactions for a specific job
 * Run UcdlibJobs.start() to create a new job, then use the returned job object
 */
class UcdlibJob {
  constructor(job, client){
    this.job = job;
    this.client = client;
  }

  /**
   * @description End the job
   * @param {Object} data - Data to store with the job. Optional.
   * @param {Boolean} [success=true] - Whether the job was successful.
   * @param {Boolean} [mergeData=true] - Whether to merge the data passed in with the existing job data
   * @returns
   */
  async end(data={}, success=true, mergeData=true){
    if ( mergeData ) data = Object.assign(this.job.data, data);
    const job = await this.client.end(this.job.id, data, success);
    if ( !job.err ) {
      this.job = job.res.rows[0];
    } else if ( job.res.rowCount === 0 ) {
      return pg.returnError(`Job ${this.job.id} not found`);
    }
    return job;
  }

  /**
   * @description Log a message to the job_logs table
   * @param {Object|String} data - Data to store. If a string is passed, it will be stored as {message: data}
   * @returns {Object} {res, err}
   */
  async log(data={}) {
    if ( typeof data === 'string' ) data = {message: data};
    const text = `
      INSERT INTO ${this.client.logTableName} (job_id, data)
      VALUES ($1, $2)
      RETURNING *
    `;
    const params = [this.job.id, data];
    const r = await pg.query(text, params);
    return r;
  }
}

export default new UcdlibJobs();
