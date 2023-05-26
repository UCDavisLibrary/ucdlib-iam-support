const jwt_decode = require('jwt-decode');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

module.exports = (api) => {
  api.use(async (req, res, next) => {
    const { default: AccessToken } = await import('@ucd-lib/iam-support-lib/src/utils/accessToken.js');
    const { default: UcdlibCache } = await import('@ucd-lib/iam-support-lib/src/utils/cache.js');
    const { default: config } = await import('../lib/config.js');

    let token, oidcConfig, userInfo;
    // check for access token
    if ( !req.headers.authorization ) {
      res.status(401).json({
        error: true,
        message: 'You must authenticate to access this resource.'
      });
      return;
    }

    // parse token
    try {
      token = req.headers.authorization.replace('Bearer ', '');
      token = jwt_decode(token)
      if ( !token.iss ) throw new Error('Missing iss');
    } catch (error) {
      console.log(error);
      res.status(401).json({
        error: true,
        message: 'Unable to parse access token.'
      });
      return;
    }

    // check for cached token
    let cached = await UcdlibCache.get('accessToken', token.preferred_username, '1 minute');
    if ( cached.err ) {
      console.error(cached.err);
    }
    if ( cached.res && cached.res.rows.length ) {
      cached = cached.res.rows[0];
      req.auth = {
        token: new AccessToken(cached.data.token, config.keycloak.clientId),
        userInfo: cached.data.userInfo
      }
      next();
      return;
    }

    // discover userinfo endpoint
    /**
    try {
      const wellKnown = await fetch(`${token.iss}/.well-known/openid-configuration`);
      if ( !wellKnown.ok ) {
        throw new Error(`HTTP Error Response: ${wellKnown.status} ${wellKnown.statusText}`)
      }
      oidcConfig = await wellKnown.json();
      if ( !oidcConfig.userinfo_endpoint ) throw new Error('Missing userinfo endpoint');
    } catch (error) {
      console.log(error);
      res.status(401).json({
        error: true,
        message: 'Unable to access openid configuration.'
      });
      return;
    }
    */

    // fetch userinfo with access token
    try {
      const userInfoResponse = await fetch(`${token.iss}/protocol/openid-connect/userinfo`, {headers: {'Authorization': req.headers.authorization}});
      if ( !userInfoResponse.ok ) throw new Error(`HTTP Error Response: ${userInfoResponse.status} ${userInfoResponse.statusText}`);
      userInfo = await userInfoResponse.json();
    } catch (error) {
      console.log(error);
      res.status(403).json({
        error: true,
        message: 'Not authorized to access this resource.'
      });
      return;
    }

    // check if user has base privileges
    const accessToken = new AccessToken(token, config.keycloak.clientId);
    if ( !accessToken.hasAccess ) {
      res.status(403).json({
        error: true,
        message: 'Not authorized to access this resource.'
      });
      return;
    }
    const setCache = await UcdlibCache.set('accessToken', token.preferred_username, {token: token, userInfo});
    if ( setCache.err ) {
      console.error(setCache.err);
    }
    req.auth = {
      token: accessToken,
      userInfo
    }

    next();
  });
}
