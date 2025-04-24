import UcdlibEmployees from '@ucd-lib/iam-support-lib/src/utils/employees.js';
import UcdlibGroups from '@ucd-lib/iam-support-lib/src/utils/groups.js';
import utils from "../lib/utils.js";
import protect from '../lib/protect.js';

export default ( api ) => {

  const route = '/employees';

  const queryOptions = [
    {
      urlQuery: 'groups',
      dbArg: 'returnGroups',
      type: 'boolean'
    },
    {
      urlQuery: 'supervisor',
      dbArg: 'returnSupervisor',
      type: 'boolean'
    },
    {
      urlQuery: 'department-head',
      dbArg: 'returnDepartmentHead',
      type: 'boolean'
    },
    {
      urlQuery: 'name',
      dbArg: 'name',
      type: 'string'
    },
    {
      urlQuery: 'department',
      dbArg: 'department',
      type: 'comma-list'
    },
    {
      urlQuery: 'title-code',
      dbArg: 'titleCode',
      type: 'comma-list'
    }
  ];

  api.get(`${route}`, async (req, res) => {

    const queryOptions = getQueryOptions(req);
    const employeeName = queryOptions.name || '';

    const results = await UcdlibEmployees.searchByName(employeeName, queryOptions);
    if ( results.err ) {
      return res.status(400).json({
        error: 'Error getting employees'
      });
    }

    res.json(results.res.rows);

  });


  api.get(`${route}/metadata/:id`, async (req, res) => {

    // query for employee
    if ( !req.params.id ) {
      return res.status(400).json({
        error: 'Missing employee identifier'
      });
    }
 
  });


  api.post(`${route}/metadata/:id?`, async (req, res) => {

    // query for employee
    if ( !req.params.id ) {
      return res.status(400).json({
        error: 'Missing employee identifier'
      });
    }

    console.log(req.query);
    
    // const queryOptions = getQueryOptions(req);
    // const employeeName = queryOptions.name || '';

    // const results = await UcdlibEmployees.searchByName(employeeName, queryOptions);
    // if ( results.err ) {
    //   return res.status(400).json({
    //     error: 'Error getting employees'
    //   });
    // }

    // res.json(results.res.rows);

  });


  /**
   * @description Get an employee by identifier
   * url params:
   * - id: employee identifier
   * - id-type: employee identifier type
   * - [all employee queryOptions]
   */
  api.get(`${route}/:id`, async (req, res) => {

    // query for employee
    if ( !req.params.id ) {
      return res.status(400).json({
        error: 'Missing employee identifier'
      });
    }
    const employeeIdentifier = req.params.id.split(',').map(id => id.trim());
    const returnSingle = employeeIdentifier.length === 1;
    const employeeIdentifierType = utils.getEmployeeIdType(req);
    const queryOptions = getQueryOptions(req);

    const groupReq = queryOptions.returnGroups;
    if ( queryOptions.returnDepartmentHead ) {
      queryOptions.returnGroups = true;
    }

    const results = await UcdlibEmployees.getById(employeeIdentifier, employeeIdentifierType, queryOptions);
    if ( results.err ) {
      return res.status(400).json({
        error: 'Error getting employee'
      });
    }
    if ( !results.res.rowCount && returnSingle ){
      return res.status(404).json({
        error: 'Employee not found'
      });
    }

    const employees = results.res.rows;

    for (const employee of employees) {

      // get supervisor if requested
      if ( queryOptions.returnDepartmentHead ) {
        employee.departmentHead = null;
        const department = (employee.groups || []).find(group => group.partOfOrg);
        if ( department && !department.isHead ) {
          const headResult = await UcdlibGroups.getGroupHead(department.id);
          if ( headResult.err ) {
            return res.status(400).json({
              error: 'Error getting department head'
            });
          }
          if ( headResult.res.rowCount ) {
            employee.departmentHead = UcdlibEmployees.toBriefObject(headResult.res.rows[0]);
          }
        }
      }

      // remove groups if not requested
      if ( queryOptions.returnGroups && !groupReq ) {
        delete employee.groups;
      }

    }

    returnSingle ? res.json(employees[0]) : res.json(employees);
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
