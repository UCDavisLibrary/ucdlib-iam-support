module.exports = (api) => {

    /**
     * @description Get patron
     */
    api.get('/patron/:id', async (req, res) => {      
      // auth
      if ( !req.auth.token.hasAdminAccess && !req.auth.token.hasHrAccess ){
        if ( r.err || !r.res.rows.length ){
          console.error(r.err);
          res.status(403).json({
            error: true,
            message: 'Not authorized to access this resource.'
          });
          return;
        }
      }
  
      res.json(res);
    })
  }