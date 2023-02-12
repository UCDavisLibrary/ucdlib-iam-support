import Pg from "./pg.js";

/**
 * @description Manages pg data for groups (departments, committees, etc)
 */
class UcdlibGroups{
  constructor() {
  }

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

  async getParents(parent=true){
    let text = `
      SELECT g.*, gt.name AS type_name, gt.part_of_org
      FROM 
        groups g
      left join group_types gt on g.type = gt.id
        `;
    
    if ( !parent ) {
      text += ' WHERE g.parent_id IS NOT NULL';
    }else {
      text += ' WHERE g.parent_id IS NULL';
    }

    text += ' ORDER BY g.name';
    return await Pg.query(text);
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