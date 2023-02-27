import Pg from "./pg.js";

/**
 * @description Manages pg data for groups (departments, committees, etc)
 */
class UcdlibGroups{
  constructor() {
  }

  async getAll(){
    let text = `
      SELECT g.*, gt.name AS type_name, gt.part_of_org
      FROM 
        groups g
      left join group_types gt on g.type = gt.id
      ORDER BY g.name
        `;
    return await Pg.query(text);
  }

  /**
   * @description Get group by id or list of ids
   * @param {*} ids - Number or array of numbers
   */
  async getById(ids){
    if ( typeof ids === 'string' ) ids = [ids];
    let text = `
    SELECT g.*, gt.name AS type_name, gt.part_of_org
    FROM 
      groups g
    left join group_types gt on g.type = gt.id
    WHERE g.id IN ${Pg.valuesArray(ids)}
    ORDER BY g.name
    `;
    return await Pg.query(text, ids);
  }

  /**
   * @description Get departments (official org unit) by id or list of ids
   * @param {*} ids - Number or array of numbers
   */
  async getDepartmentsById(ids){
    if ( typeof ids === 'string' ) ids = [ids];
    let text = `
    SELECT g.*, gt.name AS type_name, gt.part_of_org
    FROM 
      groups g
    left join group_types gt on g.type = gt.id
    WHERE 
      g.id IN ${Pg.valuesArray(ids)} AND
      gt.part_of_org
    ORDER BY g.name
    `;
    return await Pg.query(text, ids);
  }

  async getOrgGroups(archived=false){
    let text = `
      SELECT g.*, gt.name AS type_name
      FROM 
        groups g
      left join group_types gt on g.type = gt.id
      WHERE gt.part_of_org = TRUE
        `;
    
    if ( !archived ) {
      text += ' AND g.archived = FALSE';
    }
    return await Pg.query(text);
  }


}

export default new UcdlibGroups();