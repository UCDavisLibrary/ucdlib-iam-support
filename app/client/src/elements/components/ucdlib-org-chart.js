import { LitElement } from 'lit';
import {render} from "./ucdlib-org-chart.tpl.js";
import exportFromJSON from 'export-from-json';
import OrgChartTransform from "@ucd-lib/iam-support-lib/src/utils/orgChart.js";

/**
 * @description Component for generating the organization chart datasheet
 */
export default class UcdlibOrgChart extends window.Mixin(LitElement)
  .with(window.LitCorkUtils) {

  static get properties() {
    return {
      hidden: {type: Boolean},
      message: {type: String},
      brandColor: {type: String},
      fileType: {type: String},
      isFetching: {state: true},
      wasError: {state: true},
    };
  }

  constructor() {
    super();
    this.render = render.bind(this);
    this.hidden = true;
    this.message = '';
    this.brandColor = '';
    this.fileType = "";

    this._injectModel('AppStateModel', 'EmployeeModel');
  }

  /**
   * @description Disables the shadowdom
   * @returns 
   */
  createRenderRoot() {
    return this;
  }


  /**
   * @description Download the FileType dictionary
   * @returns 
   * @param {String} v
   */
  _downloadOrgChart(){
    const data = this.dataSource;
    console.log(data);
    const fileName = this.fileType == "csv" ? 'orgchart_csv' : 'orgchart_excel';
    const exportType =  this.fileType == "csv" ? exportFromJSON.types.csv : exportFromJSON.types.xls; 
    exportFromJSON({ data, fileName, exportType });
  }

  /**
   * @description Inputs the filetype
   * @returns 
   * @param {String} v
   */
  onInput(v){
    this.fileType = v;
    console.log(this.fileType);
    this._onSubmit();
  }

  /**
   * @description Attached to submit event on element form
   * @param {*} e - Submit event
   */
   async _onSubmit(){
    if ( this.isFetching ) return;
    // reset state
    this.wasError = false;
    this.isFetching = true;
    
    let r;
    r = await this.EmployeeModel.getAll();     // } else {


    if ( r.state === this.EmployeeModel.store.STATE.LOADED ) {
      this.isFetching = false;
      this.results = Array.isArray(r.payload) ? r.payload : [r.payload];
      this.dataSource = [];
      this.results.map(emp => {
        let orgChart = new OrgChartTransform(emp);
        let dict = {
          "Employee_No" : orgChart.unique_id,
          "Name" : orgChart.name,
          "Reports_to" : orgChart.supervisor,
          "Title" : orgChart.title,
          "Department" : orgChart.department,
          "Email" : orgChart.email,
        };
        this.dataSource.push(dict);
      });
      console.log(this.dataSource);
    } else if( r.state === this.EmployeeModel.store.STATE.ERROR ) {
      this.isFetching = false;
      if ( r.error.payload && r.error.payload.response && r.error.payload.response.status == 404) {
        this.results = [];
      } else {
        this.wasError = true;
      }
    }
  }

}

customElements.define('ucdlib-org-chart', UcdlibOrgChart);