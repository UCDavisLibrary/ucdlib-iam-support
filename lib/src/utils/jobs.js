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

  /**
   * @description Get a job by id
   * @param {Number} jobId - The run id of the job
   * @returns {Object} {res, err}
   */
  async getById(jobId){
    const text = `
      SELECT *
      FROM ${this.tableName}
      WHERE id = $1
    `;
    const params = [jobId];
    const r = await pg.query(text, params);
    return r;
  }

  /**
   * @description Get number of log entries for a job
   * @param {Number} jobId - The run id of the job
   * @returns {Object} {res, err}
   */
  async getJobLogCount(jobId){
    const text = `
      SELECT COUNT(*) AS count
      FROM ${this.logTableName}
      WHERE job_id = $1
    `;
    const params = [jobId];
    const r = await pg.query(text, params);
    return r;
  }

  /**
   * @description Get the most recent log entries for a job run
   * @param {Number} jobId - The run id of the job
   * @param {Object} options - Options object with the following properties:
   * @param {Number} [options.limit=1000] - Number of logs to return
   * @param {Number} [options.offset=0] - Number of logs to skip
   * @returns
   */
  async getLogs(jobId, options={}){
    let { limit, offset } = options;
    if ( !limit ) limit = 1000;
    if ( !offset ) offset = 0;

    const text = `
      SELECT *
      FROM ${this.logTableName}
      WHERE job_id = $1
      ORDER BY id DESC
      LIMIT $2
      OFFSET $3
    `;
    const params = [jobId, limit, offset];
    const r = await pg.query(text, params);
    return r;
  }

  /**
   * @description Get the most recent job runs
   * @param {Object} options - Options object with the following properties:
   * @param {Number} [options.limit=10] - Number of jobs to return
   * @param {String|Array} [options.name] - Filter by job name
   * @param {Boolean} [options.success] - Show only successful jobs
   * @param {Boolean} [options.failure] - Show only failed jobs
   * @returns {Object} {res, err}
   */
  async getRecent(options={}){
    let { limit, name, success, failure } = options;
    if ( !limit ) limit = 10;
    if ( !name ) name = [];
    if ( !Array.isArray(name) ) name = [name];
    let status = '';
    if ( success ) status = 'success = true';
    if ( failure ) status = 'success = false';

    const where = [];
    const params = [];
    if ( name.length ) {
      where.push(`name IN ${pg.valuesArray(name)}`);
      params.push(...name);
    }
    if ( status ) where.push(status);
    params.push(limit);

    const text = `
      SELECT *
      FROM ${this.tableName}
      ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
      ORDER BY start_time DESC
      LIMIT $${params.length}
    `;
    const r = await pg.query(text, params);
    return r;
  }

  /**
   * @description Get cron job names that have been run
   * @returns {Object} {res, err}
   */
  async getUniqueJobNames(){
    const text = `
      SELECT DISTINCT name
      FROM ${this.tableName}
    `;
    const r = await pg.query(text);
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
