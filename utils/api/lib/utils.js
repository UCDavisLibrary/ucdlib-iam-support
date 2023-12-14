class Utils {
  constructor(){

    this.employeeIdOptions = [
      {
        urlQuery: 'db-id',
        dbArg: 'id',
        type: 'number'
      },
      {
        urlQuery: 'iam-id',
        dbArg: 'iamId',
        type: 'string',
        default: true
      },
      {
        urlQuery: 'employee-id',
        dbArg: 'employeeId',
        type: 'string'
      },
      {
        urlQuery: 'user-id',
        dbArg: 'userId',
        type: 'string'
      },
      {
        urlQuery: 'email',
        dbArg: 'email',
        type: 'string'
      }
    ];

  }

  /**
   * @description Get employee id type from request
   * Defaults to iamId
   * @param {*} req
   * @param {String} urlParam - Name of url parameter to check
   */
  getEmployeeIdType(req, urlParam='id-type'){
    const type = req.query[urlParam];
    let option = this.employeeIdOptions.find(o => o.urlQuery === type);
    if ( !option ) {
      option = this.employeeIdOptions.find(o => o.default);
    }
    return option.dbArg;
  }

}

export default new Utils();
