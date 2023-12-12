import { jwtDecode } from "jwt-decode";
import { Issuer } from 'openid-client';

import config from './config.js';

export default ( api ) => {

  api.use(async (req, res, next) => {

    // get credentials from basic auth
    let auth = req.headers.authorization;
    if ( !auth ) {
      return res.status(401).json({
        error: 'Missing authorization header'
      });
    }
    auth = auth.split(' ');
    if ( auth.length < 2 || auth[0] != 'Basic') {
      return res.status(401).json({
        error: 'Invalid authorization header'
      });
    }
    let username, password;
    try {
      const credentials = Buffer.from(auth[1], 'base64').toString('utf-8').split(':');
      username = credentials[0];
      password = credentials[1];
    } catch (error) {
      return res.status(401).json({
        error: 'Invalid authorization header'
      });
    }

    const keycloakIssuer = await Issuer.discover(
      `${config.keycloak.url}/realms/${config.keycloak.realm}`,
    );
    const client = new keycloakIssuer.Client({
      client_id: config.keycloak.apiClientId,
      token_endpoint_auth_method: 'none'
    });

    let tokenSet;
    try {
      tokenSet = await client.grant({
        grant_type: 'password',
        username,
        password
      });
    } catch (error) {
      return res.status(401).json({
        error: 'Authentication failed.'
      });
    }

    const accessToken = jwtDecode(tokenSet.access_token);
    req.accessToken = accessToken;

    const clientRoles = accessToken?.resource_access?.[config.keycloak.apiClientId]?.roles || [];
    if ( !clientRoles.includes('read') ) {
      return res.status(403).json({
        error: 'Access denied.'
      });
    }

    next();
  });
}
