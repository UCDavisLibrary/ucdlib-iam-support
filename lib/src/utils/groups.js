import Pg from "./pg.js";

/**
 * @description Manages pg data for groups (departments, committees, etc)
 */
class UcdlibGroups{
  constructor() {
  }


  /**
   * @description Performs basic query of groups requests
   * @param {Object} q - Query object where keys are filters:
   * - id (int)
   * - type (int)
   * - name (str)
   * - name_short (str)
   * - parent_id (int)
   * - site_id (int)
   * - archived (bool)
   * - type_name (str)
   * - part_of_org (bool)
   */
   async queryTest(q){
    const whereParams = {};
    // let orderBy = 'submitted';
    // let orderAsc = false;
    console.log(q);
    let text = `
    SELECT g.*, gt.name AS type_name, gt.part_of_org
    FROM 
      groups g
    left join group_types gt on g.type = gt.id
      `;
    
    // if ( q.active ) whereParams['g.id'] = q.active;
    // if ( q.archived ) whereParams['g.type'] = q.archived;
    // if ( q.group_type ) whereParams['g.name'] = q.group_type;
    // if ( q.type_name ) whereParams['g.name_short'] = q.name_short;
    // if ( q.parent ) whereParams['g.parent_id'] = q.parent_id;
    // if ( q.parent_group ) whereParams['g.site_id'] = q.site_id;
    // if ( q.archived ) whereParams['g.archived'] = q.archived;
    // if ( q.type_name ) whereParams['g.type_name'] = q.type_name;
    // if ( q.org ) whereParams['g.part_of_org'] = q.org;

    // if ( q.orderAsc ) orderAsc = true;
    // if ( q.orderBy && ['submitted', 'modified', 'startDate'].includes(q.orderBy) ) {
    //   orderBy = TextUtils.underscore(q.orderBy);
    // }
    console.log("KDL:",Pg);
    const whereClause = Pg.toWhereClause(whereParams);
    console.log("WHERE:", whereClause);

    if ( whereClause.sql ) {
      text = `${text} WHERE ${whereClause.sql}`;
    }
    // text = `${text} ORDER BY ${orderBy} ${orderAsc ? 'ASC' : 'DESC'}`;
    // return await Pg.query(text, whereClause.values);
  }





  /**
     * @method getAll
     * @param {Boolean} archived - If this is archived
     * @description Retrieves all of the groups in database
     * @returns {Promise} Query
   */
  async getAll(archived=false){
    let text = `
      SELECT g.*, gt.name AS type_name, gt.part_of_org
      FROM 
        groups g
      left join group_types gt on g.type = gt.id
        `;
    
    if ( !archived ) {
      text += ' WHERE g.archived = FALSE';
    }
    text += ' ORDER BY g.name';
    return await Pg.query(text);
  }

  /**
     * @method getArchived
     * @description Retrieves all of the groups in database if it is archived
     * @returns {Promise} Query
   */
  async getArchived(){
    let text = `
      SELECT g.*, gt.name AS type_name, gt.part_of_org
      FROM 
        groups g
      left join group_types gt on g.type = gt.id
      WHERE g.archived = TRUE
        `;
  
    text += ' ORDER BY g.name';
    return await Pg.query(text);
  }

  /**
     * @method getParents
     * @param {Boolean} parent - If this is the parents
     * @description Retrieves all of the groups if the parents
     * @returns {Promise} Query
   */
  async getParents(parent=true){
    let text = `
      SELECT g.*, gt.name AS type_name, gt.part_of_org
      FROM 
        groups g
      left join group_types gt on g.type = gt.id
        `;
    
    if ( parent ) {
      text += ' WHERE g.parent_id IS NULL';
    }else {
      text += ' WHERE g.parent_id IS NOT NULL';

    }

    text += ' ORDER BY g.name';
    return await Pg.query(text);
  }

  /**
     * @method getParentsGroups
     * @param {Integer} id - If this is the parents
     * @description Retrieves all of the groups if the parents
     * @returns {Promise} Query
   */
   async getParentsGroups(id){
    let text = `
      SELECT g.*, gt.name AS type_name, gt.part_of_org
      FROM 
        groups g
      left join group_types gt on g.type = gt.id
      WHERE g.parent_id = ` + id;
    

    text += ' ORDER BY g.name';
    return await Pg.query(text);
  }

    /**
     * @method getGroupType
     * @param {Integer} id - By group type id
     * @description Retrieves all of the groups of certain type
     * @returns {Promise} Query
   */
     async getGroupType(id){
      let text = `
        SELECT g.*, gt.name AS type_name, gt.part_of_org
        FROM 
          groups g
        left join group_types gt on g.type = gt.id
        WHERE g.type = ` + id;
      
  
      text += ' ORDER BY g.name';
      return await Pg.query(text);
    }

  /**
     * @method getTypeName
     * @param {String} name - By name
     * @description Retrieves all of the groups by name
     * @returns {Promise} Query
   */
     async getTypeName(name){
      console.log(name);
      let text = `
        SELECT g.*, gt.name AS type_name, gt.part_of_org
        FROM 
          groups g
        left join group_types gt on g.type = gt.id
        WHERE g.type_name = ` + name;
      
  
      // text += ' ORDER BY g.name';
      return await Pg.query(text)
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