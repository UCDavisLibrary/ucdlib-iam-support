const config = require('../lib/config.js');
 
module.exports = (api) => {

  api.get('/users', async (req, res) => {
    const { default: AlmaModel } = await import('@ucd-lib/iam-support-lib/src/models/AlmaModel.js');
    AlmaModel.init(config.alma);

    let response = await AlmaModel.getUsers(config.alma.key);
    res.json(response);

  });

  api.get('/users/search', async (req, res) => {
    const { default: AlmaModel } = await import('@ucd-lib/iam-support-lib/src/models/AlmaModel.js');
    AlmaModel.init(config.alma);

    const firstName = req.query.firstName;
    const lastName = req.query.lastName;

    let response = await AlmaModel.getUsersByName(lastName, firstName, config.alma.key);
    res.json(response);

  });

    // query for a people by bulk
  // returns a set of records
  api.get('/users/bulksearch', async (req, res) => {
    const { default: AlmaModel } = await import('@ucd-lib/iam-support-lib/src/models/AlmaModel.js');
    AlmaModel.init(config.alma);

    const queryLimit = config.alma.queryLimit;
    const kerbIds = req.query.ids.split(',').map(id => id.trim()).slice(0, queryLimit);
    
    const maxConcurrentRequests = config.alma.maxConcurrentRequests;

    while (kerbIds.length > 0) {
        const chunk = kerbIds.splice(0, maxConcurrentRequests);
        res.push(chunk);
    }
    const chunks = res;

    const people = [];
    for (const chunk of chunks) {
      const promises = chunk.map(id => AlmaModel._getUsersById(id));
      await Promise.all(promises);
      people.push(...promises);
    }


    console.log("People:", people);

    res.json(people);


  });

  // query for a person by a unique identifier
  // returns a single record if successful
  api.get('/users/:id', async (req, res) => {
    const { default: AlmaModel } = await import('@ucd-lib/iam-support-lib/src/models/AlmaModel.js');
    AlmaModel.init(config.alma);
    let response;

    response = await AlmaModel._getUsersById(req.params.id, config.alma.key);
    res.json(response);
    
  });

  api.get('/roleTypes', async (req, res) => {
      const { default: AlmaModel } = await import('@ucd-lib/iam-support-lib/src/models/AlmaModel.js');
      AlmaModel.init(config.alma);

      let response = await AlmaModel.getRoles(config.alma.key);
      res.json(response);

  });

}