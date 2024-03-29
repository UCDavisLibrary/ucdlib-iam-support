import config from '../lib/config.js';
import {UcdIamModel} from '@ucd-lib/iam-support-lib/index.js';

UcdIamModel.init(config.ucdIamApi);

/**
 * @description Copies status code from UcdIamModel response to current Express response
 * @param {*} res - Express Response
 * @param {*} apiResponse - Response from UcdIamModel
 */
const setErrorStatusCode = (res, apiResponse) => {
  if ( apiResponse.response && apiResponse.response.status ){
    res.status(apiResponse.response.status);
  } else {
    res.status(500);
  }
}

export default (api) => {

  // query for a person by name
  // returns a set of records
  api.get('/ucd-iam/person/search', async (req, res) => {
    if ( !req.auth.token.canQueryUcdIam ){
      res.status(403).json({
        error: true,
        message: 'Not authorized to access this resource.'
      });
      return;
    }

    const firstName = req.query.firstName;
    const lastName = req.query.lastName;
    const middleName = req.query.middleName;
    const source = req.query.useDirectory ? true : false;

    let response = await UcdIamModel.getPersonByName(lastName, firstName, middleName, source, true);

    if ( response.error ){
      setErrorStatusCode(res, response);
    } else if ( response.responseData && response.responseData.results ){
      response = response.responseData.results;
      const queryLimit = config.ucdIamApi.queryLimit;
      if ( response.length > queryLimit ) response = response.slice(0, queryLimit);
    }
    res.json(response);

  });



  // query for a people by bulk
  // returns a set of records
  api.get('/ucd-iam/people/search', async (req, res) => {
    if ( !req.auth.token.canQueryUcdIam ){
      res.status(403).json({
        error: true,
        message: 'Not authorized to access this resource.'
      });
      return;
    }

    const queryLimit = config.ucdIamApi.queryLimit;
    const iamIds = req.query.ids.split(',').map(id => id.trim()).slice(0, queryLimit);

    const maxConcurrentRequests = config.ucdIamApi.maxConcurrentRequests;

    while (iamIds.length > 0) {
        const chunk = iamIds.splice(0, maxConcurrentRequests);
        res.push(chunk);
    }
    const chunks = res;

    const people = [];
    for (const chunk of chunks) {
      const promises = chunk.map(id => UcdIamModel.getPersonByIamId(id));
      await Promise.all(promises);
      people.push(...promises);
    }


    res.json(people);


  });



  // query for a person by a unique identifier
  // returns a single record if successful
  api.get('/ucd-iam/person/:id', async (req, res) => {
    if ( !req.auth.token.canQueryUcdIam ){
      res.status(403).json({
        error: true,
        message: 'Not authorized to access this resource.'
      });
      return;
    }
    const idType = req.query.idType || 'userId';
    let response;

    if ( idType == 'iamId' ){
      response = await UcdIamModel.getPersonByIamId(req.params.id);
    } else if( idType == 'employeeId' ){
      response = await UcdIamModel.getPersonByEmployeeId(req.params.id);
    } else if( idType == 'studentId' ){
      response = await UcdIamModel.getPersonByStudentId(req.params.id);
    } else if( idType == 'email' ){
      response = await UcdIamModel.getPersonByEmail(req.params.id);
    } else {
      response = await UcdIamModel.getPersonByUserId(req.params.id);
    }

    if ( response.error ){
      setErrorStatusCode(res, response);
    } else if (
      UcdIamModel.getPersonSearchEndpoint(idType) &&
      UcdIamModel.getPersonSearchEndpoint(idType).id === 'people' &&
      response.iamId
       ) {
      // do a second query to the better 'profile' endpoint
      response = await UcdIamModel.getPersonByIamId(response.iamId)
      if ( response.error ){
        setErrorStatusCode(res, response);
      }
    }
    res.json(response);

  });

}
