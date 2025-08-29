import config from '../lib/config.js';
import ldap from '@ucd-lib/iam-support-lib/src/utils/ldap.js'

export default (api) => {

    // posts org chart from files
    api.get('/ldap', async (req, res) => {   
        
        if ( !req.auth.token.canQueryUcdIam ){
            res.status(403).json({
              error: true,
              message: 'Not authorized to access this resource.'
            });
            return;
          }

        const ldapConfig = {
            host: config.ldap.server,
            user: config.ldap.user,
            password: config.ldap.key,
            port: config.ldap.port,
            base: config.ldap.base
        } 

        let ldapConnect = new ldap(ldapConfig);
        let ldapResponse = await ldapConnect.search(req.query);

        if ( ldapResponse.err )  {
            console.error(ldapResponse);
            return res.json([]);;
        }

        return res.json(ldapResponse);

    }); 
    
  
  }