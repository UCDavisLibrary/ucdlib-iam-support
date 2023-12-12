import UcdlibEmployees from '@ucd-lib/iam-support-lib/src/utils/employees.js';
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
    }
  ];

  /**
   * @description Get an employee by identifier
   * url params:
   * - id: employee identifier
   * - id-type: employee identifier type
   * - [all employee queryOptions]
   */
  api.get(`${route}/:id`, async (req, res) => {

    // query for employee
    const employeeIdentifier = req.params.id;
    if ( !employeeIdentifier ) {
      return res.status(400).json({
        error: 'Missing employee identifier'
      });
    }
    const employeeIdentifierType = utils.getEmployeeIdType(req);
    const queryOptions = getQueryOptions(req);
    const employee = await UcdlibEmployees.getById(employeeIdentifier, employeeIdentifierType, queryOptions);
    if ( employee.err ) {
      return res.status(400).json({
        error: 'Error getting employee'
      });
    }
    if ( !employee.res.rowCount ){
      return res.status(404).json({
        error: 'Employee not found'
      });
    }

    res.json(employee.res.rows[0]);
  });


  const getQueryOptions = (req) => {
    const options = {};
    queryOptions.forEach(option => {
      if ( req.query[option.urlQuery] ) {
        options[option.dbArg] = queryOptions.type === 'boolean' ? true : req.query[option.urlQuery];
      }
    });
    return options;
  }

}
