import { LitElement} from 'lit';
import {render} from "./ucdlib-orgchart-upload.tpl.js";
// import exportFromJSON from 'export-from-json';
// import OrgChartTransform from "@ucd-lib/iam-support-lib/src/utils/orgChart.js";
import "./chart.js";

/**
 * @description Component for generating the organization chart datasheet
 */
export default class UcdlibOrgChartUpload extends window.Mixin(LitElement)
  .with(window.LitCorkUtils) {

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
    this.downloadWidgetTitle = 'Download IAM CSV File';
    this.csvData = null;
    this.shouldRenderChart = false;
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

    this.data = this.reader.result;
    this.csvData = this.reader.csvData;
    let errorMessage = 'Error with headers in CSV. Headers:(Lived Name, External ID, Email, Notes, Department Name, Working Title, Appointment Type Code, External ID Reports To)';
    let successMessage = 'File Successfully Uploaded!';

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

    for (const item of this.csvData) {
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

    this.csvData = this.anonymizeData(updatedData);


    let x = this.OrgchartModel.orgPush(this.csvData);

    console.log(x);

    this.AppStateModel.showAlertBanner({message: successMessage, brandColor: 'quad'});

    // Delete this when finished
    this.shouldRenderChart = true;

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
  * @description upload the entered the csv
  * @param {File} file csv file
  */
  async _onCSV(file){
    this.file = file;
    this.csvData = null;
    

    if (!this.file) return;
    this.reader = new FileReader();

    this.reader.onload = function (e) {

      /**
       * @description parse the csv to a object
       * @param {Object} data data for CSV
       * @param {Object} options options 
       * @returns 
       */
      function parseCSV(data, options = {}) {
        const { headersProvided = true } = options;

        const rows = [];
        let currentRow = [];
        let currentValue = "";
        let inQuotes = false;

        //Go by character 
        for (let i = 0; i < data.length; i++) {
          const char = data[i];
          const nextChar = data[i + 1];

          if (char === '"' && inQuotes && nextChar === '"') {
            // Handle escaped quotes within a quoted field
            currentValue += '"';
            i++; // Skip the next quote
          } else if (char === '"') {
            // Toggle the inQuotes state
            inQuotes = !inQuotes;
          } else if (char === ',' && !inQuotes) {
          // If delimiter and not in quotes, finish current value
            currentRow.push(currentValue.trim());
            currentValue = "";
          } else if ((char === '\n' || char === '\r') && !inQuotes) {
            // If newline (or carriage return) and not in quotes, finish row
            if (currentValue || currentRow.length) {
              currentRow.push(currentValue.trim());
              rows.push(currentRow);
              currentRow = [];
              currentValue = "";
            }
          } else {
            // Append character to the current value
            currentValue += char;
          }
        }

        // Add the last value/row if there's no trailing newline
        if (currentValue || currentRow.length) {
          currentRow.push(currentValue.trim());
          rows.push(currentRow);
        }

        let headers;
        if (headersProvided) {
          headers = rows.shift(); // Use the first row as headers
        } else {
          //Add an error: Did not read any headers, please add

          headers = rows[0].map((_, i) => `Column${i + 1}`); // Generate column names if headers are not provided
        }

        // Convert rows into objects using headers
        const parsedData = rows.map(row =>
          headers.reduce((obj, header, index) => {
            obj[header] = row[index] || null;
            return obj;
          }, {})
        );

        return parsedData;
      }


      const content = e.target.result;
      if (!content.trim()) {
        console.error('File is empty.');
        return;
      }
    
      this.csvData = parseCSV(content); // Use  parseCSV

      // this.renderRoot.querySelector('#uploadButton').disabled = false;
    };

    this.reader.readAsText(file);

    this.requestUpdate();

  }


  // /**
  //  * @description Download the FileType dictionary
  //  * @returns 
  //  * @param {String} v
  //  */
  // async _downloadOrgChart(){
  //   const data = await this.dataSource;
  //   const fileName = this.fileType == "csv" ? 'orgchart_csv' : 'orgchart_excel';
  //   const exportType =  this.fileType == "csv" ? exportFromJSON.types.csv : exportFromJSON.types.xls; 
  //   exportFromJSON({ data, fileName, exportType });
  // }

  // /**
  //  * @description Inputs the filetype
  //  * @returns 
  //  * @param {String} v
  //  */
  // onInput(v){
  //   this.fileType = v;
  //   this._onSubmit();
  // }

  // /**
  //  * @description Attached to submit event on element form
  //  * @param {*} e - Submit event
  //  */
  // async _onSubmit(){
  //   if ( this.isFetching ) return;
  //   // reset state
  //   this.wasError = false;
  //   this.isFetching = true;
    
  //   let r;
  //   r = await this.EmployeeModel.getAll();     // } else {

  //   if ( r.state === this.EmployeeModel.store.STATE.LOADED ) {
  //     // style="pointer-events:none;opacity:0.6;"
  //     document.querySelector("#fileList").style.opacity = 0.6;
  //     document.querySelector("#fileList").style.pointerEvents = "none";
  //     document.querySelector("#loading-orgchart").style.display = "block";
  //     this.isFetching = false;
  //     this.results = Array.isArray(r.payload) ? r.payload : [r.payload];
  //     this.dataSource = [];

  //     const promise = this.results.map(async (emp) => {

  //       let position = await this.PersonModel.getPersonById(emp.iamId);

  //       if(position) {
  //         let orgChart = new OrgChartTransform(emp, position);
  //         let dict = {
  //           "No." : orgChart.unique_id,
  //           "External ID" : orgChart.iam_id,
  //           "External ID Reports To" : orgChart.supervisor_id,
  //           "Lived Name" : orgChart.name,
  //           "Supervisor Name" : orgChart.supervisor,
  //           "Working Title" : orgChart.title,
  //           "Department Name" : orgChart.department,
  //           "Appointment Type Code" : orgChart.jobType,
  //           "Full-Time Percentage" : orgChart.jobPercentage,
  //           "Email" : orgChart.email,
  //         };
  
  //         this.dataSource.push(dict);
  //       }

  //     });

  //     Promise.all(promise).then(() => {
  //       console.log("Data Recieved:",this.dataSource);
  //       document.querySelector("#loading-orgchart").style.display = "none";
  //       document.querySelector("#download-orgchart").disabled = false;
  //       document.querySelector("#fileList").style.opacity = 1;
  //       document.querySelector("#fileList").style.pointerEvents = "auto";
  //     });
      
  //   } else if( r.state === this.EmployeeModel.store.STATE.ERROR ) {
  //     this.isFetching = false;
  //     if ( r.error.payload && r.error.payload.response && r.error.payload.response.status == 404) {
  //       this.results = [];
  //     } else {
  //       this.wasError = true;
  //     }
  //   }
  // }

}

customElements.define('ucdlib-orgchart-upload', UcdlibOrgChartUpload);