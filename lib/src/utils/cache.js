import pg from "./pg.js";

// postgres class for getting/settting cache values
class UcdlibCache {
  
  // set a cache value
  async set(type, query, data){
    let text = `
      INSERT INTO cache (type, query, data)
      VALUES ($1, $2, $3)
      ON CONFLICT (type, query) DO UPDATE SET data = $3
    `;
    return await pg.query(text, [type, query, data]);
  }

  // get a cache value
  async get(type, query){
    let text = `
      SELECT * FROM cache
      WHERE type = $1 AND query = $2
    `;
    return await pg.query(text, [type, query]);
  }
}

export default new UcdlibCache();