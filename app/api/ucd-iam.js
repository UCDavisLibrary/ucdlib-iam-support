module.exports = (app) => {

  app.get('/api/ucd-iam/*', async (req, res) => {
    res.json({ api: true });
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