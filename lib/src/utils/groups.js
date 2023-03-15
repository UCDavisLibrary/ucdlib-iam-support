import Pg from "./pg.js";

/**
 * @description Manages pg data for groups (departments, committees, etc)
 */
class UcdlibGroups{
  constructor() {
  }

  /**
   * @method groupQuery
   * @description Performs basic query of groups requests
   * @param {Object} q - Query object where keys are filters:
   * - active (bool)
   * - archived (bool)
   * - group_type (str)
   * - type_name (str)
   * - name (str)
   * - parent_group (int)
   * - name_short (str)
   * - org (bool)
   * - archived (bool)
   * - part_of_org (bool)
   * - parent (bool)
   * - child (bool)
  */
  async groupQuery(q){
    const whereParams = {};
    let text = `
    SELECT g.*, gt.name AS type_name, gt.part_of_org
    FROM 
      groups g
    left join group_types gt on g.type = gt.id
    `;
    
    if ( q.active ) whereParams['g.archived'] = "FALSE";
    if ( q.archived ) whereParams['g.archived'] = String(q["archived"]).toUpperCase();
    if ( q.group_type ) whereParams['g.type'] = q.group_type;
    if ( q.type_name ) whereParams['gt.name'] = q.type_name;
    if ( q.name ) whereParams['g.name'] = q.name;
    if ( q.parent_group ) whereParams['parent_id'] = q.parent_group;
    if ( q.name_short ) whereParams['g.name_short'] = q.name_short;
    if ( q.org ) whereParams['gt.part_of_org'] = String(q["org"]).toUpperCase();

    const whereClause = Pg.toWhereClause(whereParams);

    if ( whereClause.sql ) {
      text = `${text} WHERE ${whereClause.sql}`;
    }

    if ( q.parent ) {
      if(text.includes("WHERE"))
        text += " AND g.parent_id IS NULL"
      else
        text += "WHERE g.parent_id IS NULL"
    }
    if ( q.child ) {
      if(text.includes("WHERE"))
        text += " AND g.parent_id IS NOT NULL"
      else
        text += "WHERE g.parent_id IS NOT NULL"
    }

    return await Pg.query(text, whereClause.values);
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


  /**
     * @method getOrgGroups
     * @param {Boolean} archived - If this is archived
     * @description Retrieves all of the groups by organization
     * @returns {Promise} Query
   */
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