import config from '../lib/config.js';
import sftp from '@ucd-lib/iam-support-lib/src/utils/sftp.js';


export default (api) => {

  // posts org chart from files
  api.post('/orgchart', async (req, res) => {
    // console.log("W", req.body);
    let jsonOrgData = req.body;

    let sftpConfig = {
        host: config.sftp.server,
        port: 22,
        username: config.sftp.user,
        password: config.sftp.password, // Use token as a password if the SFTP server supports Keycloak
    }

    const timestamp = Date.now();

    
    let sftpConnect = new sftp(sftpConfig);

    if(await sftpConnect.isFolderEmpty()){
        
        //Run sendJsontoSftp with new data
        await sftpConnect.sendJsonToSftp(jsonOrgData)

    } else {
        let newName = 'prev_org_' + timestamp;

        //Run renameJsonWithSftp with timestamp replacement
        await sftpConnect.renameJsonWithSftp(newName)

        //Run sendJsontoSftp with new data
        await sftpConnect.sendJsonToSftp(jsonOrgData)

    }


  });

}
