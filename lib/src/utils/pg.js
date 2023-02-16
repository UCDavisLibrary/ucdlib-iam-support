import pg from 'pg';
const client = new pg.Pool();

/**
 * @description Wrapper around pg library for uniform error handling
 */
class Pg {
  constructor() {
  }
  
  /**
   * @description https://node-postgres.com/features/queries
   * @param {String} text - SQL
   * @param {Array} values - Hydration values
   * @returns {Object} {res, err}
   */
  async query(text, values){
    const out = {res: false, err: false};
    try {
      out.res = await client.query(text, values);
    } catch (error) {
      out.err = error;
    }
    return out;
  }

  /**
   * @description Converts camelCase to underscores (snakecase) for column names
   * 
   */
  underscore(s){
    return s.split(/\.?(?=[A-Z])/).join('_').toLowerCase();
  }
}

export default new Pg();