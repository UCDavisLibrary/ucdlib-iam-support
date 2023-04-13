import pg from "./pg.js";
import TextUtils from "./text.js";


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

    const whereClause = pg.toWhereClause(whereParams);

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

    return await pg.query(text, whereClause.values);
  }


  async getAll(){
    let text = `
      SELECT g.*, gt.name AS type_name, gt.part_of_org
      FROM 
        groups g
      left join group_types gt on g.type = gt.id
      ORDER BY g.name
        `;
    return await pg.query(text);
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
    WHERE g.id IN ${pg.valuesArray(ids)}
    ORDER BY g.name
    `;
    return await pg.query(text, ids);
  }

  // get group count
  async getCount(){
    let text = `
    SELECT count(*) as count FROM groups g
    `;
    return await pg.query(text);
  }


  async create(data){
    let text = 'INSERT INTO groups(';
    let props = [
      'type', 'name', 'nameShort', 'parentId', 'siteId', 'archived'
    ];

    const values = [];
    let first = true;
    for (const prop of props) {
      if ( data.hasOwnProperty(prop) ){
        if ( first ) {
          text += TextUtils.underscore(prop);
          first = false;
        } else {
          text += `, ${TextUtils.underscore(prop)}`;
        }
        values.push(data[prop]);
      }
    }
    
    text += `) VALUES ${pg.valuesArray(values)} RETURNING id`;
    return await pg.query(text, values);
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
      g.id IN ${pg.valuesArray(ids)} AND
      gt.part_of_org
    ORDER BY g.name
    `;
    return await pg.query(text, ids);
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
    return await pg.query(text);
  }

  /**
   * @description Get group membership
   * @param {*} groupId - Group id - if not provided, returns all group membership
   * @param {*} activeOnly - If true, only returns active group membership
   * @returns Employee identifiers and group id
   */
  async getGroupMembershipWithIds(groupId, activeOnly=false) {
    const params = [];
    let text = `
    SELECT 
      e.iam_id, 
      e.employee_id, 
      e.user_id, 
      e.email, 
      gm.is_head, 
      gm.group_id,
      g.archived as group_archived
    FROM 
      employees e
    LEFT JOIN 
      group_membership gm on e.id = gm.employee_key
    LEFT JOIN
      groups g on gm.group_id = g.id
    ${groupId || activeOnly ? 'WHERE' : ''}
    ${activeOnly ? `g.archived = FALSE` : ''}
    ${groupId ? `gm.group_id = $1` : ''}
    `;
    if ( groupId ) params.push(groupId);

    return await pg.query(text, params);
  }

}

export default new UcdlibGroups();