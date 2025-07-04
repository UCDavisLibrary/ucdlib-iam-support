import Client from 'ssh2-sftp-client';
import fs from 'fs/promises';

/**
 * @description Manages SFTP to send and get files
 */
class SFTP {
  constructor(config, filepath) {
    this.sftp = new Client();
    this.sftpConfig = config;
    this.filepath = filepath;
  }


   /**
     * @description Get csv file to the files server
     * @return {Object} status
     */
  async getJsonFromSftp() {
    const remoteFilePath = `${this.filepath}/current_org_data.json`;
    const localFilePath = './downloaded_org_data.json';

        try {
            // Connect to SFTP server
            await this.sftp.connect(this.sftpConfig);
            console.log('Connected to SFTP server.');

            // Download the JSON file
            await this.sftp.get(remoteFilePath, localFilePath);
            console.log(`File downloaded successfully to ${localFilePath}`);

            // Read and parse the JSON file
            const fileContent = await fs.readFile(localFilePath, 'utf8');
            const jsonData = JSON.parse(fileContent);
            console.log('Downloaded JSON data:', jsonData);

            return jsonData;
        } catch (err) {
            let errorMessage = "Error downloading file" + err.message;
            return {"error" :  errorMessage}
        } finally {
            // Close SFTP connection
            await this.sftp.end();
            console.log('Get JSON SFTP connection closed.');
        }
    }

   /**
     * @description Send csv file to the files server
     * @return {Object} status
     */
    async sendJsonToSftp(jsonData) {   
        const remoteFilePath = `${this.filepath}/current_org_data.json`;//`${this.filepath}/peter_current_org_data.json`;
        const localFilePath = './to_upload_org_data.json';
    
        try {
            // Save JSON data to a file
            await fs.writeFile(localFilePath, JSON.stringify(jsonData, null, 2), 'utf8');
            console.log('JSON file created.');
    
            // Connect to SFTP server
            await this.sftp.connect(this.sftpConfig);
            console.log('Connected to SFTP server.');
    
            // Upload the JSON file
            await this.sftp.put(localFilePath, remoteFilePath);
            console.log(`JSON File uploaded successfully to ${remoteFilePath}`);
        } catch (err) {
            let errorMessage = "Error uploading json file" + err.message;
            return {"error" :  errorMessage}
        } finally {
            // Close SFTP connection
            await this.sftp.end();
            console.log('Send JSON connection closed.');
            return {"success" :  "Json File is sent."}
        }
    }

    /**
     * @description Send dist file to the files server
     * @return {Object} status
     */
    async sendDistToSftp(filename) {   
        const remoteFilePath = `${this.filepath}/${filename}.js`; 
        const localFilePath = `./${filename}.js`;
    
        try {
            // Save JSON data to a file
    
            // Connect to SFTP server
            await this.sftp.connect(this.sftpConfig);
            console.log('Connected to SFTP server.');
    
            // Upload the JSON file
            await this.sftp.put(localFilePath, remoteFilePath);
            console.log(`Dist File uploaded successfully to ${remoteFilePath}`);
        } catch (err) {
            let errorMessage = "Error uploading dist file" + err.message;
            return {"error" :  errorMessage};
        } finally {
            // Close SFTP connection
            await this.sftp.end();
            console.log('Send Dist SFTP connection closed.');
            return {"success" :  "Dist File is sent."}
        }
    }

    /**
     * @description Rename the org chart csv file 
     * @return {Object} status
     */
    async renameJsonWithSftp(renameName) {    
        const remoteRenamedFilePath = `${this.filepath}/${renameName}.json`;
        const remoteFilePath = `${this.filepath}/current_org_data.json`;
    
        try {    
            // Connect to SFTP server
            await this.sftp.connect(this.sftpConfig);
            console.log('Connected to SFTP server.');
    
            // Upload the JSON file
            await this.sftp.rename(remoteFilePath, remoteRenamedFilePath);
            console.log(`File renamed to ${remoteFilePath}`);
        } catch (err) {
            let errorMessage = "Error renaming file" + err.message;
            return {"error" :  errorMessage}
        } finally {
            // Close SFTP connection
            await this.sftp.end();
            console.log('Rename JSON SFTP connection closed.');
            return {"success" :  "Successfully Renamed File."}
        }
    }
    

    /**
     * @description Checks if the folder is empty
     * @return {Object} status
     */
    async isFolderEmpty() {
    try {
        // Connect to the SFTP server
        await this.sftp.connect(this.sftpConfig);

        // List the contents of the remote folder
        const folderContents = await this.sftp.list(this.filepath);

        // Check if the folder is empty
        if (folderContents.length === 0) {
            console.log(`The folder "${this.filepath}" is empty.`);
            return true;
        } else {
            return false;
        }
    } catch (err) {
        let errorMessage = "Error" + err.message;
        return {"error" :  errorMessage}
    } finally {
        // Close the SFTP connection
        await this.sftp.end();
    }
}
}

export default SFTP;
