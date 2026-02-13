import bcrypt from "bcrypt";
import { jwtDecode } from "jwt-decode";

import config from '#lib/utils/config.js';
import models from '#models';

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
    const cached = await models.cache.get('authApi', username, '30 minutes');
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

    let tokenSet;
    try {
      const tokenEndpoint = `${config.keycloak.url}/realms/${config.keycloak.realm}/protocol/openid-connect/token`;

      // Resource Owner Password Grant (public client) -- send client_id in body, no auth header
      const params = new URLSearchParams({
        grant_type: 'password',
        username,
        password,
        client_id: config.keycloak.apiClientId
      });

      const resp = await fetch(tokenEndpoint, {
        method: 'POST',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
      });

      if (!resp.ok) {
        const errBody = await resp.text().catch(() => '');
        throw new Error(`token endpoint returned ${resp.status} ${resp.statusText}: ${errBody}`);
      }

      tokenSet = await resp.json(); 
    } catch (error) {
      console.error('Authentication error:', error?.message ?? error);
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
    const setCache = await models.cache.set('authApi', username, {
      accessToken,
      hash: await bcrypt.hash(password, 10)
    });
    if ( setCache.err ) {
      console.error(setCache.err);
    }

    next();
  });
}