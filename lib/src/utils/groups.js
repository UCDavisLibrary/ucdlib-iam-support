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
   * @param {Object} options - Options object where keys are options:
   * - returnHead (bool) - If true, returns head(s) of group
  */
  async groupQuery(q, options={}){
    const returnHead = options.returnHead || false;
    const whereParams = {};
    let text = `
    SELECT
      g.*,
      ${returnHead ? `
      ${this.memberCoalesceSql({}, true)},
      ` : ''}
      gt.name AS type_name,
      gt.part_of_org
    FROM
      groups g
    LEFT JOIN group_types gt on g.type = gt.id
    ${returnHead ? `
    LEFT JOIN group_membership gm on g.id = gm.group_id
    ` : ''}
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

    if ( returnHead ){
      text += ' GROUP BY g.id, gt.id';
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
   * @description Update group properties
   * @param {Number} id - Group id
   * @param {Object} data - Data to update
   * @returns
   */
  async update(id, data){
    const updateClause = pg.toUpdateClause(data, true);
    const text = `
    UPDATE groups SET ${updateClause.sql}
    WHERE id = $${updateClause.values.length + 1}
    `;
    return await pg.query(text, [...updateClause.values, id]);
  }

  /**
   * @description Get group by id or list of ids
   * @param {*} ids - Number or array of numbers
   * @param {*} options - Options object where keys are options:
   * - returnHead (bool) - If true, returns head(s) of group
   * - returnMembers (bool) - If true, returns members of group
   * - returnParent (bool) - If true, returns parent of group
   * - returnChildren (bool) - If true, returns children of group
   * - filterById (Array) - List of group ids to filter by - is superceded by ids
   * - filterActive (bool) - If true, only returns active groups
   * - filterArchived (bool) - If true, only returns archived groups
   */
  async getById(ids, options={}){
    const params = [];

    // return options
    const returnHead = options.returnHead || false;
    const returnMembers = options.returnMembers || false;
    const returnParent = options.returnParent || false;
    const returnChildren = options.returnChildren || false;
    const groupBys = [];
    if ( returnHead || returnMembers ) groupBys.push('g.id', 'gt.id');
    if ( returnParent ) groupBys.push('pt.id');

    // get list of ids
    if ( typeof ids === 'string' || typeof ids === 'number') ids = [ids];
    ids = ids.filter(x => x);
    if ( ids.length === 0 && options.filterById ) {
      ids = options.filterById;
    }
    const hasIds = ids.length > 0;
    params.push(...ids);

    // filter options
    const filterActive = options.filterActive || false;
    const filterArchived = options.filterArchived || false;
    const filterPartOfOrg = options.filterPartOfOrg || false;
    const filterNotPartOfOrg = options.filterNotPartOfOrg || false;

    let filterByGroupType = Array.isArray(options.filterByGroupType) ? options.filterByGroupType : [options.filterByGroupType];
    filterByGroupType = filterByGroupType.filter(x => x);
    const groupTypeOffset = params.length;
    params.push(...filterByGroupType);

    let text = `
    SELECT
      g.*,
      ${returnHead || returnMembers ? `${this.memberCoalesceSql({}, returnHead)},` : ''}
      ${returnParent ? `${this.groupJson({groups: 'pt'})} as parent,` : ''}
      ${returnChildren ? `
      (
        SELECT json_agg(child_json)
        FROM (
          SELECT DISTINCT ON (ch.id)
          ${this.groupJson({groups: 'ch'})} as child_json
          FROM groups ch
          WHERE g.id = ch.parent_id
        ) AS unique_children
      ) as children,` : ''}
      gt.name AS type_name,
      gt.part_of_org
    FROM
      groups g
    left join group_types gt on g.type = gt.id
    ${returnHead || returnMembers ? `
      LEFT JOIN group_membership gm on g.id = gm.group_id
    ` : ''}
    ${returnParent ? `
      LEFT JOIN groups pt on g.parent_id = pt.id
    ` : ''}

    WHERE 1=1
    ${hasIds ? ` AND g.id IN ${pg.valuesArray(ids)}` : ''}
    ${filterActive ? ` AND g.archived = FALSE` : ''}
    ${filterArchived ? ` AND g.archived = TRUE` : ''}
    ${filterPartOfOrg ? ` AND gt.part_of_org = TRUE` : ''}
    ${filterNotPartOfOrg ? ` AND gt.part_of_org = FALSE` : ''}
    ${filterByGroupType.length ? ` AND gt.id IN ${pg.valuesArray(filterByGroupType, groupTypeOffset)}` : ''}
    ${groupBys.length ?
      `GROUP BY ${groupBys.join(',')}`
      : ''}
    ORDER BY g.name
    `;
    return await pg.query(text, params);
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

  async getGroupHead(groupId){
    const params = [groupId];
    let text = `
    SELECT e.* FROM employees e
    LEFT JOIN
      group_membership gm on e.id = gm.employee_key
    WHERE gm.group_id = $1 AND gm.is_head = TRUE
    `;
    return await pg.query(text, params);
  }

  async removeGroupHead(groupId){
    const params = [groupId];
    let text = `
    UPDATE group_membership SET is_head = FALSE
    WHERE group_id = $1
    `;
    return await pg.query(text, params);
  }

  async setGroupHead(groupId, employeeRowId){
    const params = [groupId, employeeRowId];
    let text = `
    UPDATE group_membership SET is_head = TRUE
    WHERE group_id = $1 AND employee_key = $2
    `;
    return await pg.query(text, params);
  }

  groupJson(aliases={}){
    const groupTable = aliases.groups || 'g';
    return `
      json_build_object(
        'id', ${groupTable}.id,
        'name', ${groupTable}.name,
        'nameShort', ${groupTable}.name_short,
        'parentId', ${groupTable}.parent_id
      )
    `;
  }

  /**
   * @description Return 'json_build_object' SQL function for an employee
   * @param {Object} aliases - optional aliases for employees table
   * @param {String} aliases.employees - alias for employees table
   * @returns {String}
   */
  employeeJson(aliases={}){
    const employeeTable = aliases.employees || 'e';
    const membershipTable = aliases.membership || 'gm';
    return `
      json_build_object(
        'iamId', ${employeeTable}.iam_id,
        'firstName', ${employeeTable}.first_name,
        'lastName', ${employeeTable}.last_name,
        'title', ${employeeTable}.title,
        'email', ${employeeTable}.email,
        'isHead', ${membershipTable}.is_head
      )
    `
  }

  /**
   * @description Returns SQL for coalescing group heads into a json array
   * @param {*} aliases
   * @returns
   */
  memberCoalesceSql(aliases={}, headOnly=false){
    const employeeTable = aliases.employees || 'e';
    return `
    COALESCE(
      (
        SELECT json_agg(${this.employeeJson({employees: employeeTable, membership: 'gm_inner'})})
        FROM group_membership gm_inner
        LEFT JOIN employees as ${employeeTable} on ${employeeTable}.id = gm_inner.employee_key
        WHERE gm_inner.group_id = g.id
        ${headOnly ? 'AND gm_inner.is_head = TRUE' : ''}
      ),
      '[]'::json
    ) AS ${headOnly ? 'head' : 'members'}
    `;
  }

}

export default new UcdlibGroups();
