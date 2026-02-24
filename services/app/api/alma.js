import AlmaModel from '#lib/cork/models/AlmaModel.js';


export default (api) => {

  api.get('/alma/users/search', async (req, res) => {

    if ( !req.auth.token.canQueryUcdIam ){
      res.status(403).json({
        error: true,
        message: 'Not authorized to access this resource.'
      });
      return;
    }

    const firstName = req.query.firstName;
    const lastName = req.query.lastName;

    let response = await AlmaModel.queryUserByName(lastName, firstName);
    if ( response.state === 'error' ){
      return res.status(502).json({
        error: true,
        message: 'Error retrieving user from Alma.'
      });
    }
    res.json(response.payload);

  });

  // query for a person by a unique identifier
  // returns a single record if successful
  api.get('/alma/users/:id', async (req, res) => {

    if ( !req.auth.token.canQueryUcdIam ){
      res.status(403).json({
        error: true,
        message: 'Not authorized to access this resource.'
      });
      return;
    }

    const response = await AlmaModel.getUserById(req.params.id);

    if ( response.state === 'error' ){
      return res.status(502).json({
        error: true,
        message: 'Error retrieving user from Alma.'
      });
    }

    res.json(response.payload);

  });

  api.get('/alma/roleTypes', async (req, res) => {

    if ( !req.auth.token.canQueryUcdIam ){
      res.status(403).json({
        error: true,
        message: 'Not authorized to access this resource.'
      });
      return;
    }

    let response = await AlmaModel.getRoles();

    if ( response.state === 'error' ){
      return res.status(502).json({
        error: true,
        message: 'Error retrieving role types from Alma.'
      });
    }
    res.json(response.payload);

  });

}
