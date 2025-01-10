import config from '../lib/config.js';
import sftp from '@ucd-lib/iam-support-lib/src/utils/sftp.js';


export default (api) => {

  // posts org chart from files
  api.post('/orgchart', async (req, res) => {
    let jsonOrgData = req.body;

    if (!req.auth.token.hasAdminAccess && 
        !req.auth.token.hasHrAccess &&
        !req.auth.token.canUploadOrgChart ){
      res.status(403).json({
        error: true,
        message: 'Not authorized to access this resource.'
      });
      return res.json({error:'Not authorized to access this resource.'})
      ;
    }

    let sftpConfig = {
        host: config.sftp.server,
        port: 22,
        username: config.sftp.user,
        password: config.sftp.password,
    }

    let filepath = config.sftp.filepath;

    const timestamp = Date.now();

    
    let sftpConnect = new sftp(sftpConfig, filepath);

    if(await sftpConnect.isFolderEmpty()){
        
        //Run sendJsontoSftp
        let sendSFTP = await sftpConnect.sendJsonToSftp(jsonOrgData);
        if(sendSFTP && sendSFTP.error) return res.json({error: sendSFTP.error});;


    } else {
        let newName = 'prev_org_' + timestamp;

        //Run renameJsonWithSftp
        let renameResult = await sftpConnect.renameJsonWithSftp(newName);
        if(renameResult && renameResult.error) return res.json({error: renameResult.error});

        //Run sendJsontoSftp
        let sendSFTP = await sftpConnect.sendJsonToSftp(jsonOrgData);
        if(sendSFTP && sendSFTP.error) return res.json({error: sendSFTP.error});;


    }    

    return res.json({submit:"Success"});



  });

}
