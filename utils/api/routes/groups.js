import UcdlibEmployees from '@ucd-lib/iam-support-lib/src/utils/employees.js';
import UcdlibGroups from '@ucd-lib/iam-support-lib/src/utils/groups.js';
import utils from "../lib/utils.js";

export default ( api ) => {

  const route = '/groups';

  const queryOptions = [
    {
      urlQuery: 'head',
      dbArg: 'returnHead',
      type: 'boolean'
    },
    {
      urlQuery: 'members',
      dbArg: 'returnMembers',
      type: 'boolean'
    },
    {
      urlQuery: 'parent',
      dbArg: 'returnParent',
      type: 'boolean'
    },
    {
      urlQuery: 'children',
      dbArg: 'returnChildren',
      type: 'boolean'
    },
    {
      urlQuery: 'filter-id',
      dbArg: 'filterById',
      type: 'comma-list'
    },
    {
      urlQuery: 'filter-active',
      dbArg: 'filterActive',
      type: 'boolean'
    },
    {
      urlQuery: 'filter-archived',
      dbArg: 'filterArchived',
      type: 'boolean'
    },
    {
      urlQuery: 'filter-group-type',
      dbArg: 'filterByGroupType',
      type: 'comma-list'
    },
    {
      urlQuery: 'filter-part-of-org',
      dbArg: 'filterPartOfOrg',
      type: 'boolean'
    },
    {
      urlQuery: 'filter-not-part-of-org',
      dbArg: 'filterNotPartOfOrg',
      type: 'boolean'
    }
  ];

  api.get(`${route}`, async (req, res) => {

    const results = await UcdlibGroups.getById([], getQueryOptions(req));
    if ( results.err ) {
      return res.status(400).json({
        error: 'Error getting groups'
      });
    }

    res.json(results.res.rows);

  });

  /**
   * @description Get all groups an employee directly (no inheritance) belongs to
   * url params:
   * - id: employee identifier
   * - id-type: employee identifier type
   * - part-of-org: filter to only library org groups (aka departments)
   * - [all group queryOptions]
   */
  api.get(`${route}/member/:id`, async (req, res) => {

    // query for employee
    const employeeIdentifier = req.params.id;
    if ( !employeeIdentifier ) {
      return res.status(400).json({
        error: 'Missing employee identifier'
      });
    }
    const employeeIdentifierType = utils.getEmployeeIdType(req);
    const employee = await UcdlibEmployees.getById(employeeIdentifier, employeeIdentifierType, {returnGroups: true});
    if ( employee.err ) {
      return res.status(400).json({
        error: 'Error getting employee'
      });
    }
    if ( !employee.res.rowCount ){
      return res.json([]);
    }

    // query for groups
    const groups = [];
    for( let i = 0; i < (employee.res.rows[0].groups || []).length; i++ ) {
      const g = employee.res.rows[0].groups[i];
      if ( !g || !g.id ) continue;

      if ( req.query['part-of-org'] && !g.partOfOrg ) continue;

      const group = await UcdlibGroups.getById(g.id, getQueryOptions(req));
      if ( group.err ) {
        return res.status(400).json({
          error: 'Error getting group'
        });
      }
      if ( !group.res.rowCount ) continue;
      groups.push(group.res.rows[0]);
    }

    res.json(groups);
  });


  const getQueryOptions = (req) => {
    const options = {};
    queryOptions.forEach(option => {
      if ( req.query[option.urlQuery] ) {
        if ( option.type === 'boolean' ) {
          options[option.dbArg] = true;
        } else if ( option.type === 'comma-list' ) {
          options[option.dbArg] = (req.query[option.urlQuery] || '').split(',').map(item => item.trim());
        } else {
          options[option.dbArg] = req.query[option.urlQuery];

        }
      }
    });
    return options;
  }

}
