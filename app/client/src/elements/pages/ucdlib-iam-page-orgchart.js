import { LitElement } from 'lit';
import {render} from "./ucdlib-iam-page-orgchart.tpl.js";
import { LitCorkUtils, Mixin } from '@ucd-lib/cork-app-utils';
import Papa from 'papaparse';
import jschardet from 'jschardet';

/**
 * @classdesc Xomponent for displaying the application Org chart page
 */
export default class UcdlibIamPageOrgChart extends Mixin(LitElement)
  .with(LitCorkUtils) {

  static get properties() {
    return {
      hidden: {type: Boolean},
      message: {type: String},
      brandColor: {type: String},
      fileType: {type: String},
      isFetching: {state: true},
      wasError: {state: true},
      data: { type: Array },
      src: { type: String }
    };
  }

  constructor() {
    super();
    this.render = render.bind(this);
    this.hidden = true;
    this.message = '';
    this.brandColor = '';
    this.fileType = "";
    this.data;
    this.uploadWidgetTitle =  'Upload File for Organizational Chart';
    this.csvData = null;
    this.formatError = false;
    this._injectModel('AppStateModel', 'EmployeeModel', 'PersonModel', 'OrgchartModel');
  }

  /**
   * @description check for correct import headers
   * @param {Object} keyMap key Map 
   * @returns 
   */
  checkCorrectHeaders(keyMap) {
    let givenheaders = Object.keys(this.csvData[0]);
    let keyheaders = Object.keys(keyMap);
    
    if (givenheaders.length !== keyheaders.length) {
      return false;
    }

    // Sort both arrays
    const arr1 = [...givenheaders].sort();
    const arr2 = [...keyheaders].sort();

    return arr1.every((value, index) => value === arr2[index]);
  }

  /**
   * @description anonymize the ids of the data
   * @param {Array} data key Map 
   * @returns 
   */
  anonymizeData(data){
    const idMap = new Map();
    let currentId = 1;

    // Generate anonymized IDs and map original IDs to them
    data.forEach(item => {
      if (!idMap.has(item.id)) {
        idMap.set(item.id, currentId++);
      }
    });

    // Create the anonymized dataset
    return data.map(item => ({
      ...item,
      id: idMap.get(item.id),
      parentId: idMap.get(item.parentId) || null // Handle null or missing parentId
    }));
  }

  /**
   * @description rename the keys
   * @param {Object} obj new object
   * @param {Object} keyMap key Map 
   * @returns
   */
  renameKeys(obj, keyMap) {
    const result = {};

    for (const [key, value] of Object.entries(obj)) {
      // Check if the current key is in the keyMap
      const newKey = keyMap[key] || key; // Use the mapped name or keep the original key
      // If the value is an object, recursively rename keys
      result[newKey] = value && typeof value === "object" && !Array.isArray(value) 
        ? this.renameKeys(value, keyMap) 
        : value;
    }

    return result;
  }

  /**
   * @description on the submit of the csv
   * @param {e} e event files
   * @returns 
   */
  async _onSubmitCSV(e) {
    e.preventDefault();

    if (!this.csvData) {
      console.error("CSV Data is missing or not yet processed.");
      return;
    }


    let errorMessage = 'Error with headers in CSV. Headers:(Lived Name, External ID, Email, Notes, Department Name, Working Title, Appointment Type Code, External ID Reports To)';
    let successMessage = 'File Successfully Uploaded!';
    let serverErrorMessage = 'Permisson/Server Error: Contact Admin to Fix Possible Error.';


    const keyMap = {
      "Lived Name": "fullName",
      "External ID": "id",
      "Email": "email",
      "Notes": "notes",
      "Department Name": "departmentName",
      "Working Title": "title",
      "Appointment Type Code": "employeeType",
      "External ID Reports To": "parentId"
    };


    let checkCSV = this.checkCorrectHeaders(keyMap);

    if(!checkCSV){

      // Alert the user
      this.AppStateModel.showAlertBanner({message: errorMessage, brandColor: 'double-decker'});
      return;
    }

    this.csvData = Object.values(this.renameKeys(this.csvData, keyMap));

    let updatedData = [];
    let formatErrorMessage;

    for (const item of this.csvData) {
      if(item.fullName == null){
        formatErrorMessage = "Formatting Error; Missing a column entry: Lived Name.";
        this.formatError = true;
      }

      if(item.id == null){
        formatErrorMessage = "Formatting Error; Missing a column entry: External ID.";
        this.formatError = true;      
      }

      if(item.parentId == null){
        formatErrorMessage = "Formatting Error; Missing a column entry: External ID Reports To.";
        this.formatError = true;        
      }

      const updatedItem = {
        fullName: item.fullName,
        id: Number(item.id),
        email: item.email,
        notes: item.notes,
        departmentName: item.departmentName,
        title: item.title,
        employeeType: item.employeeType,
        parentId: item.parentId !== null ? Number(item.parentId) : null
      };
      updatedData.push(updatedItem);
    }



    if(this.formatError) {
      this.AppStateModel.showAlertBanner({message: formatErrorMessage, brandColor: 'double-decker'});
    } else {
      this.csvData = this.anonymizeData(updatedData);
      let singleRoots = this.notSingleRootPasses();
      if(singleRoots) {
        let multipleNodeErrorMessage = `Several entries lack a valid supervisor reference: the Reports To External ID does not correspond to any 
                                        External ID in this worksheet. With the exception of the University Librarian, which is also listed below, all 
                                        employees should have a  Reports To External ID listed that corresponds to someone on the excel sheet. \n\n 
                                        Please update the following names:
                                        ${singleRoots.map(n => ` ${n.fullName}`)}
                                       `;
        this.AppStateModel.showAlertBanner({message: multipleNodeErrorMessage, brandColor: 'double-decker'});
        return;
      }
      let res = await this.OrgchartModel.orgPush(this.csvData);
      
      if(res.error) {
        this.AppStateModel.showAlertBanner({message: serverErrorMessage, brandColor: 'double-decker'});
      } else {
        this.AppStateModel.showAlertBanner({message: successMessage, brandColor: 'quad'});
      }
    }






    this.requestUpdate();
  }

  /**
  * @description checks if there is multiple nodes and if so then who
  * @param {Array} nodes an array of node objects
  * @returns {Array} nodes
  */
  listRoots(nodes) {
    return nodes
      .filter(n => n.parentId == null)
      .map(n => ({ id: n.id, fullName: n.fullName }));
  }
  
  /**
  * @description node single root check
  * @param 
  * @returns {Array || Boolean} nodes
  */
  notSingleRootPasses() {
    let notSingleRoots = this.listRoots(this.csvData);
    if(notSingleRoots.length === 1) return false;
    return notSingleRoots;
  }

  /**
  * @description upload the entered the csv
  * @param {File} file csv file
  */
  async _onCSV(file){

    this.file = file;
    this.csvData = null;
    if (!this.file) return;

    this.reader = new FileReader();

    this.reader.onload = async (e) => {
      let arrayBuffer = e.target.result;

      if (!arrayBuffer.byteLength) {
        console.error('File is empty.');
        return;
      }

      const uint8Array = new Uint8Array(arrayBuffer);

      // Detect encoding
      const detectedEncoding = jschardet.detect(new TextDecoder().decode(uint8Array)).encoding;
      console.log("Detected Encoding:", detectedEncoding);

      let decodedContent;
      try {
        const encoding = detectedEncoding ? detectedEncoding.toLowerCase() : "utf-8";
        const decoder = new TextDecoder(encoding, { fatal: false }); 
        decodedContent = decoder.decode(uint8Array);
      } catch (error) {
        console.warn("Failed to decode, defaulting to UTF-8:", error);
        decodedContent = new TextDecoder("utf-8").decode(uint8Array);
      }

      if (!decodedContent.trim()) {
        console.error('File is empty after decoding.');
        return;
      }

      // Parse CSV with PapaParse
      let parseData = [];
      Papa.parse(decodedContent, {
        header: true,
        skipEmptyLines: true,
        complete: function (results) {
          parseData = results.data.map(record => {
            const cleanedRecord = {};
            for (const [key, value] of Object.entries(record)) {
              if (typeof value === 'string') {
                let trimmedValue = value.trim();
                cleanedRecord[key] = trimmedValue === '' ? null : trimmedValue;
              } else {
                cleanedRecord[key] = value;
              }
            }
            return cleanedRecord;
          });
        }
      });

      this.csvData = parseData;
      this.requestUpdate();
    };

    this.reader.readAsArrayBuffer(file);
    this.requestUpdate();

  }

  /**
   * @description Disables the shadowdom
   * @returns
   */
  createRenderRoot() {
    return this;
  }

  /**
   * @method _onAppStateUpdate
   * @description bound to AppStateModel app-state-update event
   *
   * @param {Object} e
   */
  async _onAppStateUpdate(e) {
    if ( e.page != this.id ) return;
    this.AppStateModel.showLoaded(this.id);
  }

}

customElements.define('ucdlib-iam-page-orgchart', UcdlibIamPageOrgChart);
