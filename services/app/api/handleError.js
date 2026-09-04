import { RosettaApiError } from '#lib/utils/rosetta.js';

/**
 * @description Sends a JSON error response. Maps known error codes to HTTP status codes.
 * @param {import('express').Response} res - The Express response object
 * @param {import('express').Request} req - The Express request object
 * @param {Error} error - The error that was thrown
 * @param {*} [details] - Optional additional details to include in the response
 */
function handleError(res, req, error, details) {

  let status = 500;

  if ( error instanceof RosettaApiError ) {
    if ( error.status >= 400 && error.status < 500 ){
      status = error.status;
    } else if ( error instanceof RosettaApiError && error.status >= 500 ) {
      status = 502;
    }

    if ( error.json ){
      details = error.json;
    } else if ( error.text ){
      details = error.text;
    }
  }

  res.status(status).json({
    message : error.message,
    details : details,
    stack : error.stack
  });

}

export default handleError;
