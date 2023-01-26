const config = require('../lib/config.js');
module.exports = (app) => {

  app.get('/api/ucd-iam/people/search', async (req, res) => {
    res.json({ 'hi': 'jere' }); 
  });

  app.get('/api/ucd-iam/*', async (req, res) => {
    const { ExampleModel } = await import('@ucd-lib/iam-support-lib/index.js');
    ExampleModel.test();
    res.json({ api: true, hi: 'there' });
    /**
    let url = process.env.IAM_BASE_URL + "/";
    if ( req.params[0] ){
      url += req.params[0];
    }
    let query = new URLSearchParams({
      v: '1.0',
      key: process.env.IAM_KEY,
      ...req.query
    });
    let status = 502;
    let data = {responseDetails: 'An unknown error has occurred'};
    try {
      const response = await fetch(`${url}?${query.toString()}`);
      status = response.status;
      data = await response.json();
    } catch (error) {
      
    }
  
    res.status(status);
    res.send(JSON.stringify(data));
    */
  });

}