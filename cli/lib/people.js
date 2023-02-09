const config = require('./cli-config');

class PeopleCli {
  async searchUcd(options){
    const { UcdIamModel } = await import('@ucd-lib/iam-support-lib/index.js');
    UcdIamModel.init(config.ucdIamApi);
    let person;

    if("email" in options){
      person = await UcdIamModel.getPersonByEmail(options.email);
    }else if(options.first != '' || options.middle != '' || options.last != ''){
      person = await UcdIamModel.getPersonByName(options.last, options.first, options.middle, options.online);
      person = person.responseData.results;
    }else if("studentID" in options){
      person = await UcdIamModel.getPersonByStudentId(options.studentID);
    }else if("employeeID" in options){
      person = await UcdIamModel.getPersonByEmployeeId(options.employeeID);
    }else if("kerberos" in options){
      person = await UcdIamModel.getPersonByUserId(options.kerberos);
    }

    console.log(person);
  }
}

module.exports = new PeopleCli();