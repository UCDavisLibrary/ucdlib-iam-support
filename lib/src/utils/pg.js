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
   * @description Constructs Values array for INSERT statement given a list of values for hydration
   * @param {Array} values - List of values to sub into insert statement
   * @returns {String} ($1, $2, $3), etc
   */
  valuesArray(values){
    return `(${values.map((v, i) => `$${i + 1}`).join(', ')})`;
  }
}

export default new Pg();