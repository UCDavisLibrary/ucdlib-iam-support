import pg from "#lib/utils/pg.js";

/**
 * @description Generic key/value store backed by the config table
 */
class UcdlibConfig {

  /**
   * @description Get a config row by key
   * @param {String} metaKey
   * @returns {Object} {res, err}
   */
  async get(metaKey){
    return await pg.query(`SELECT * FROM config WHERE meta_key = $1`, [metaKey]);
  }

  /**
   * @description Set (insert or update) a config value
   * @param {String} metaKey
   * @param {String} metaValue
   * @returns {Object} {res, err}
   */
  async set(metaKey, metaValue){
    const text = `
      INSERT INTO config (meta_key, meta_value)
      VALUES ($1, $2)
      ON CONFLICT (meta_key) DO UPDATE SET meta_value = $2, modified = NOW()
    `;
    return await pg.query(text, [metaKey, metaValue]);
  }

  /**
   * @description Get a config value and parse it as JSON
   * @param {String} metaKey
   * @param {*} defaultValue - Returned if the key doesn't exist or fails to parse
   * @returns {*}
   */
  async getJson(metaKey, defaultValue){
    const r = await this.get(metaKey);
    if ( r.err || !r.res.rows.length ) return defaultValue;
    try {
      return JSON.parse(r.res.rows[0].meta_value);
    } catch (e) {
      console.error(`config.getJson: invalid JSON for key ${metaKey}`, e);
      return defaultValue;
    }
  }

  /**
   * @description Set a config value, JSON-encoding it first
   * @param {String} metaKey
   * @param {*} value
   * @returns {Object} {res, err}
   */
  async setJson(metaKey, value){
    return await this.set(metaKey, JSON.stringify(value));
  }
}

export default new UcdlibConfig();
