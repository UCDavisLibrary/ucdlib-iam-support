import bcrypt from "bcrypt";
import { jwtDecode } from "jwt-decode";
import { Issuer } from 'openid-client';

import config from './config.js';
import UcdlibCache from '@ucd-lib/iam-support-lib/src/utils/cache.js';

export default ( api ) => {

  /**
   * @description Protect all routes with basic auth.
   * Need a username and password from keycloak "internal" realm with "read" role for client.
   */
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

    // compare password to cached hash
    const cached = await UcdlibCache.get('authApi', username, '30 minutes');
    if ( cached.err ) {
      console.error(cached.err);
    }
    if ( cached.res && cached.res.rowCount ) {
      const hash = cached.res.rows[0].data.hash;
      const match = await bcrypt.compare(password, hash);
      if ( match ) {
        req.accessToken = cached.res.rows[0].data.accessToken;
        next();
        return;
      }
    }

    // fetch access token from keycloak
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

    // parse access token and check for read role
    const accessToken = jwtDecode(tokenSet.access_token);
    req.accessToken = accessToken;
    const clientRoles = accessToken?.resource_access?.[config.keycloak.apiClientId]?.roles || [];
    if ( !clientRoles.includes('read') ) {
      return res.status(403).json({
        error: 'Access denied.'
      });
    }

    // cache access token and hash
    const setCache = await UcdlibCache.set('authApi', username, {
      accessToken,
      hash: await bcrypt.hash(password, 10)
    });
    if ( setCache.err ) {
      console.error(setCache.err);
    }

    next();
  });
}
