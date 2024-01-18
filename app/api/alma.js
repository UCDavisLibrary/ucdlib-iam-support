import config from '../lib/config.js';
import AlmaModel from '@ucd-lib/iam-support-lib/src/models/AlmaModel.js';

AlmaModel.init(config.alma);

export default (api) => {

  api.get('/users', async (req, res) => {

    if ( !req.auth.token.canQueryUcdIam ){
      res.status(403).json({
        error: true,
        message: 'Not authorized to access this resource.'
      });
      return;
    }

    let response = await AlmaModel.getUsers(config.alma.key);
    res.json(response);

  });

  api.get('/users/search', async (req, res) => {

    if ( !req.auth.token.canQueryUcdIam ){
      res.status(403).json({
        error: true,
        message: 'Not authorized to access this resource.'
      });
      return;
    }

    const firstName = req.query.firstName;
    const lastName = req.query.lastName;

    let response = await AlmaModel.getUsersByName(lastName, firstName, config.alma.key);
    res.json(response);

  });

    // query for a people by bulk
  // returns a set of records
  api.get('/users/bulksearch', async (req, res) => {

    if ( !req.auth.token.canQueryUcdIam ){
      res.status(403).json({
        error: true,
        message: 'Not authorized to access this resource.'
      });
      return;
    }

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

    res.json(people);


  });

  // query for a person by a unique identifier
  // returns a single record if successful
  api.get('/users/:id', async (req, res) => {

    if ( !req.auth.token.canQueryUcdIam ){
      res.status(403).json({
        error: true,
        message: 'Not authorized to access this resource.'
      });
      return;
    }

    let response;

    response = await AlmaModel._getUsersById(req.params.id, config.alma.key);
    res.json(response);

  });

  api.get('/roleTypes', async (req, res) => {

    if ( !req.auth.token.canQueryUcdIam ){
      res.status(403).json({
        error: true,
        message: 'Not authorized to access this resource.'
      });
      return;
    }

      let response = await AlmaModel.getRoles(config.alma.key);
      res.json(response);

  });

}
