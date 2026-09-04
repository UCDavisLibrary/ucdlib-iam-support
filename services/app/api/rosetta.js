import rosetta from '#lib/utils/rosetta.js';
import config from '#lib/utils/config.js';
import handleError from './handleError.js';

export default (api) => {

  // query for a person by name
  // returns a set of records
  api.get('/rosetta/person', async (req, res) => {
    try {
      if ( !req.auth.token.canQueryUcdIam ){
        res.status(403).json({
          error: true,
          message: 'Not authorized to access this resource.'
        });
        return;
      }

      const firstName = req.query.firstName?.trim();
      const lastName = req.query.lastName?.trim();
      if ( !firstName && !lastName ){
        res.status(400).json({
          error: true,
          message: 'Please provide at least a first or last name to search'
        });
        return;
      }

      const query = {limit: config.rosetta.apiQueryLimit, count: true};
      for ( const param of [{v: lastName, k: 'lastname'}, {v: firstName, k: 'firstname'}] ) {
        if ( param.v ) {
          query[`${param.k}${req.query.partial ? 'like' : ''}`] = param.v;
        }
      }

      const r = await rosetta.getPeople(query);
      return res.json(r);

    } catch (e) {
      return handleError(res, req, e);
    }

  });


  // query for a person by a unique identifier
  // returns a single record if successful
  api.get('/rosetta/person/:id', async (req, res) => {
    try {
      if ( !req.auth.token.canQueryUcdIam ){
        res.status(403).json({
          error: true,
          message: 'Not authorized to access this resource.'
        });
        return;
      }
      const idType = (req.query.idType || rosetta.personIdTypes[0]).trim().toLowerCase();
      if ( !rosetta.personIdTypes.includes(idType) ){
        res.status(400).json({
          error: true,
          message: `Invalid idType '${idType}'. Valid values are: ${rosetta.personIdTypes.join(', ')}`
        });
        return;
      }

      const r = await rosetta.getPeople({ [idType]: req.params.id, limit: 1, count: true });
      return res.json(r);

    } catch (e) {
      return handleError(res, req, e);
    }
  });
}