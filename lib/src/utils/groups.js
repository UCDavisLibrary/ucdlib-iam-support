import Pg from "./pg.js";

/**
 * @description Manages pg data for groups (departments, committees, etc)
 */
class UcdlibGroups{
  constructor() {
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