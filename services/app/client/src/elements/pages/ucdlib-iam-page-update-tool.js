import { LitElement } from 'lit';
import * as Templates from "./ucdlib-iam-page-update-tool.tpl.js";
import { LitCorkUtils, Mixin } from '@ucd-lib/cork-app-utils';

import { AppComponentController } from '#controllers';

import "#components/ucdlib-employee-search.js";
import "#components/ucdlib-iam-search.js";

/**
 * @description Employee Update Tool
 */
export default class UcdlibIamPageUpdateTool extends Mixin(LitElement)
  .with(LitCorkUtils) {

  static get properties() {
    return {
      supervisor: {state: true},
      supervisorEmail: {state: true},
      supervisorId: {state: true},
      employeeTitle: {state: true},
      departmentId: {state: true},
      dismissDiscrepancyList: { type: Array },
      discrepancy: { type: Array },
      isHead: {state: true},
    };
  }

  constructor() {
    super();
    this.render = Templates.render.bind(this);
    this.renderEmployeeSelect = Templates.renderEmployeeSelect.bind(this);
    this.renderEmployeeEdit = Templates.renderEmployeeEdit.bind(this);
    this.renderEmployeeResult = Templates.renderEmployeeResult.bind(this);
    this.renderEmployeeDiscrepancy = Templates.renderEmployeeDiscrepancy.bind(this);
    this.admin = false;
    this.hasEmployeeRecord = false;
    this.employeeRecord = {};
    this.page = 'employee-select';
    this.groups = [];
    this.discrepancy = [];
    this.dismissDiscrepancyList = [];
    this.disabledSubmit = false;
    this.deptHeadConflict = false;
    this.departmentName = 'department';

    this.ctl = {
      appComponent : new AppComponentController(this),
    }


    this._injectModel('EmployeeModel','AppStateModel', 'AuthModel', 'GroupModel', 'PersonModel');
  }

  /**
   * @method createRenderRoot
   * @description disables Shadow DOM
   * @returns {HTMLElement}
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
    if ( !this.ctl.appComponent.isOnActivePage ) return;

    const token = this.AuthModel.getToken();
    if(!token.hasAdminAccess && !token.hasHrAccess) {
      this.AppStateModel.showError('You do not have permission to use this tool.');
      return;
    }

    if(token.hasAdminAccess) this.admin = true;
    this._setPage(e);

    const promises = [];
    promises.push(this.getGroups());
    await Promise.all(promises);
  }

  async getGroups(){
    const r = await this.GroupModel.list();
    if ( r.state === 'loaded' ){
      this.groups = r.payload.filter(g => !g.archived);
    } else if ( r.state === 'error' ) {
      this.AppStateModel.showError('Unable to load department list.');
    }
  }

  /**
   * @description Sets subpage based on location hash
   * @param {Object} e
   */
  async _setPage(){
    this.page = "employee-select";
    this.ctl.appComponent.showPage();

  }

  /**
   * @method _onEmployeeStatusChange
   * @description bound to ucdlib-employee-search state change
   * @param {CustomEvent} e
   */
  _onEmployeeStatusChange(e){
    if ( e.detail.employee ){
      this.employeeRecord = e.detail.employee;
      this.hasEmployeeRecord = true;

    } else {
      this.employeeRecord = {};
      this.hasEmployeeRecord = false;

    }

    this.requestUpdate();
  }

  /**
   * @method reset
   * @description resets all component state and reloads page
   */
  reset(){
    this.employeeRecord = {};
    this.employeeGroups = [];
    this.firstName = '';
    this.lastName = '';
    this.middleName = '';
    this.isDName = false;
    this.studentId = '';
    this.employeeId = '';
    this.userId = '';
    this.email = '';
    this.iamId = '';
    this.isFetching = false;
    this.wasError = false;
    this.page = 'employee-select';
    this.hideResults = false;
    this.discrepancy = [];
    this.dismissDiscrepancyList = [];
    this.results = [];
    this.selectedPersonId = '';
    this.selectedPersonProfile = {};
    this.departmentId = 0;
    this.deptHead = {};
    this.hasEmployeeRecord = false;
    this.departmentName = "department";

    this.resetDepartmentChecks();

    window.location.reload();


    this.requestUpdate();
  }

  /**
   * @method _onEmployeeSelect
   * @description maps selected employee record to local properties
   */
  async _onEmployeeSelect(){
    this.employeeGroups = this.employeeRecord.groups || [];
    this.department = this.employeeGroups.find(dep => dep.type == "Department");
    this.department = Array.isArray(this.department) ? this.department[0] : this.department;

    this.iamId = this.employeeRecord.iamId || '';
    this.dbId = this.employeeRecord.id || 0;
    this.middleName = this.employeeRecord.middleName || '';
    this.primaryAssociation = this.employeeRecord.primaryAssociation || {};
    this.employeeTitle = this.employeeRecord.title || '';
    this.supervisor = this.employeeRecord.supervisor || {};
    this.supervisor_fullname =  this.supervisor.firstName + " " + this.supervisor.lastName;
    this.supervisorEmail = this.supervisor.email || '';
    this.supervisorId = this.employeeRecord.supervisorId || '';
    this.types = this.employeeRecord.types || {};
    this.ucdDeptCode = this.employeeRecord.ucdDeptCode || '';
    this.firstName = this.employeeRecord.firstName || '';
    this.lastName = this.employeeRecord.lastName || '';
    this.email = this.employeeRecord.email || '';
    this.employeeId = this.employeeRecord.employeeId || '';
    this.userId = this.employeeRecord.userId || '';
    this.departmentId = this.department.id || 0;
    this.isHead = this.department.isHead || false;
    this.page = "employee-edit";
    this.departmentName = this.department.name;
    this.discrepancy = [];
    this.dismissDiscrepancyList = [];

    await this.getActiveDiscrepancies();

    this.checkDepartmentHead(this.departmentId);

    this.requestUpdate();
  }

  async getActiveDiscrepancies(){
    const r = await this.EmployeeModel.getActiveDiscrepancy(this.iamId);
    if ( r.state === 'loaded' ){
      this.discrepancy = r.payload || [];
    } else if ( r.state === 'error' ) {
      this.AppStateModel.showAlertBanner({message: 'Error occurred when retrieving discrepancies. Employee may have discrepancies not listed.', brandColor: 'double-decker'});
      this.discrepancy = [];
    }
  }

  /**
   * @method _toggleToDismissDiscrepanciesList
   * @description toggles discrepancies to/from the list
   * @param {Object} discrepancy
   */
  _toggleToDismissDiscrepanciesList(discrepancy){

    const id = discrepancy.id;

    if (this.dismissDiscrepancyList.includes(id)) {
      this.dismissDiscrepancyList = this.dismissDiscrepancyList.filter(i => i !== id);
    } else {
      this.dismissDiscrepancyList = [...this.dismissDiscrepancyList, id];
    }

    this.requestUpdate();

  }

  /**
   * @method _dismissDiscrepancies
   * @description dismiss the discrepancies listed
   * @param {Object} e
   */
  async _dismissDiscrepancies(){
    const r = await this.EmployeeModel.dismissDiscrepancies(this.iamId, this.dismissDiscrepancyList);
    if ( r.state === 'loaded' ){
      this.AppStateModel.showAlertBanner({message: 'Discrepancies successfully dismissed.', brandColor: 'farmers-market'});
      await this.getActiveDiscrepancies();
    } else if ( r.state === 'error' ) {
      this.AppStateModel.showAlertBanner({message: 'Error occurred when dismissing discrepancies. Please try again later.', brandColor: 'double-decker'});
    }
  }

  /**
   * @method checkDepartmentHead
   * @description checks if department already has a head
   * @param {Number} id
   */
  async checkDepartmentHead(id){
    this.departmentId = Number(id);
    let groupById = await this.GroupModel.get(this.departmentId);
    if ( groupById.state === 'error' ){
      this.AppStateModel.showError('Unable to verify department head. Please try again later.');
      return;
    }

    let deptHead = groupById?.payload?.[0].head[0];

    this.deptHead = deptHead;


    if(!deptHead) {
      this.resetDepartmentChecks();
      return;
    }



    if(this.isHead) this.alertDepartmentHead(this.isHead);
    this.requestUpdate();


  }

  /**
   * @method alertDepartmentHead
   * @description triggers UI alert for department head conflicts
   * @param {Boolean} assignHead
   * @param {String} departmentName
   */
  async alertDepartmentHead(assignHead){

    this.isHead = assignHead;

    let deptHeadIam = this.deptHead?.iamId;
    let deptHeadName = this.deptHead?.firstName + " " + this.deptHead?.lastName;

    if(!deptHeadIam || this.iamId == deptHeadIam) {
      this.resetDepartmentChecks();
      this.isHead = true;
      return;
    }

    this.disabledSubmit = true;
    this.deptHeadConflict = true;

    this.conflictMessage = `** ${deptHeadName} is already a head of this department. **`;
    this.requestUpdate();

  }

  /**
   * @method resetDepartmentChecks
   * @description clears head-of-department flags
   */
  resetDepartmentChecks(){
    this.disabledSubmit = false;
    this.deptHeadConflict = false;
    this.requestUpdate();
  }


  /**
   * @method unassignDepartmentHead
   * @description unassigns user as department head
   */
  unassignDepartmentHead(){
    this.resetDepartmentChecks();
    this.isHead = false;
    this.requestUpdate();
  }

  /**
   * @method updateEmployee
   * @description saves updates to employee title, department, and head status
   */
  async updateEmployee() {
    const promises = [];

    if (this.employeeTitle !== this.employeeRecord.title) {
      let updateEmployeeTitle = { title: this.employeeTitle };
      promises.push(this.EmployeeModel.update(this.dbId, updateEmployeeTitle));
    }

    // Handle department change
    if (this.departmentId !== this.department.id) {
      promises.push(this.EmployeeModel.removeFromGroup(this.dbId, { departmentId: this.department.id }));
      promises.push(this.EmployeeModel.addToGroup(this.dbId, {
        departmentId: this.departmentId,
        isHead: this.isHead
      }));
    } else {
      // Handle only head status change
      if (this.isHead !== this.department.isHead) {
        if (!this.isHead) {
          promises.push(this.GroupModel.removeHead(this.departmentId));
        } else {
          promises.push(this.GroupModel.setHead(this.departmentId, { employeeRowID: this.dbId }));
        }
      }
    }

    const resolvedPromises = await Promise.allSettled(promises);
    for ( const i in resolvedPromises ){
      const resolvedPromise = resolvedPromises[i];
      if ( resolvedPromise.status === 'rejected'  || resolvedPromise.value.state === 'error'){
        this.AppStateModel.showAlertBanner({message: 'An error occurred while updating the employee record.', brandColor: 'double-decker'});
        return;
      }
    }
    this.AppStateModel.showAlertBanner({message: `Employee ${this.firstName} ${this.lastName} updated successfully.`, brandColor: 'quad'});

    this.requestUpdate();
    this._onRenderResult();

  }

  /**
   * @method _onRenderResult
   * @description refreshes UI with updated employee info
  */
  async _onRenderResult(){
    let id = this.iamId;

    let res = await this.EmployeeModel.get(id, 'iamId');
    res = res.payload.results[0];
    this.employeeRecord = {};

    this.employeeRecord = res;
    this.hasEmployeeRecord = true;
    this.page = 'employee-result';



    this.AppStateModel.refresh();
    this.requestUpdate();
  }



}

customElements.define('ucdlib-iam-page-update-tool', UcdlibIamPageUpdateTool);
