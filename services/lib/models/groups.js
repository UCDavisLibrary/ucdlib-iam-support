import pg from "#lib/utils/pg.js";
import textUtils from "#lib/utils/text.js";

/**
 * @typedef {Object} GroupQueryOptions
 * @property {Boolean} [returnHead] - If true, returns head(s) of group
 * @property {Boolean} [returnMembers] - If true, returns members of group
 * @property {Boolean} [returnParent] - If true, returns parent of group
 * @property {Boolean} [returnChildren] - If true, returns children of group
 * @property {Array} [filterById] - List of group ids to filter by - superseded by ids argument
 * @property {Boolean} [filterActive] - If true, only returns active groups
 * @property {Boolean} [filterArchived] - If true, only returns archived groups
 * @property {Boolean} [filterPartOfOrg] - If true, only returns groups that are part of the org
 * @property {Boolean} [filterNotPartOfOrg] - If true, only returns groups not part of the org
 * @property {Array} [filterByGroupType] - List of group type ids to filter by
 * @property {String} [filterByName] - Case-insensitive substring match against group name or short name
 */

/**
 * @description Manages pg data for groups (departments, committees, etc)
 */
class UcdlibGroups{
  constructor() {
  }

  /**
   * @description Query groups with no id filter
   * @param {GroupQueryOptions} [options={}]
   * @returns {Promise}
   */
  async query(options={}){
    return this.getById([], options);
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
   * @param {Number|Array} ids - Number or array of numbers
   * @param {GroupQueryOptions} [options={}]
   * @returns {Promise}
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

    const filterByName = options.filterByName || '';
    const nameOffset = params.length;
    if ( filterByName ) params.push(`%${filterByName}%`);

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
    ${filterByName ? ` AND (g.name ILIKE $${nameOffset + 1} OR g.name_short ILIKE $${nameOffset + 1})` : ''}
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
      'type', 'name', 'nameShort', 'parentId', 'siteId', 'archived', 'rtName'
    ];

    const values = [];
    let first = true;
    for (const prop of props) {
      if ( data.hasOwnProperty(prop) ){
        if ( first ) {
          text += textUtils.underscore(prop);
          first = false;
        } else {
          text += `, ${textUtils.underscore(prop)}`;
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
   * @description Move all members from one group to another
   * @param {Number} from_group_id - Group id to move from
   * @param {Number} to_group_id - Group id to move to
   * @returns
   */
  async moveAllMembers(from_group_id, to_group_id){
    const params = [to_group_id, from_group_id];
    let text = `
      WITH updated AS (
          UPDATE group_membership
          SET group_id = $1, is_head = FALSE
          WHERE group_id = $2
          RETURNING *)
      SELECT count(*) FROM updated;
    `;
    return await pg.query(text, params);
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
