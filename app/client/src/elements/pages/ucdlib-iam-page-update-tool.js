import { LitElement } from 'lit';
import * as Templates from "./ucdlib-iam-page-update-tool.tpl.js";
import { LitCorkUtils, Mixin } from '@ucd-lib/cork-app-utils';


import "../components/ucdlib-employee-search";
import "../components/ucdlib-iam-search";

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
      isHead: {state: true},
    };
  }

  constructor() {
    super();
    this.render = Templates.render.bind(this);
    this.renderEmployeeSelect = Templates.renderEmployeeSelect.bind(this);
    this.renderEmployeeEdit = Templates.renderEmployeeEdit.bind(this);
    this.renderEmployeeResult = Templates.renderEmployeeResult.bind(this);
    this.hasEmployeeRecord = false;
    this.employeeRecord = {};
    this.page = 'employee-select';
    this.groups = [];
    this.disabledSubmit = false;
    this.deptHeadConflict = false;
    this.departmentName = 'department';

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
   * @method _onGroupsFetched
   * @description attached to GroupModel GROUPS_FETCHED event
   * @param {Object} e
   */
  _onGroupsFetched(e){
    if ( e.state === this.GroupModel.store.STATE.LOADED ){
      this.groups = e.payload.filter(g => !g.archived);

    } else if ( e.state === this.GroupModel.store.STATE.ERROR ) {
      console.error('Cannot display page. Groups not loaded!');
      this.AppStateModel.showError('Unable to load department list.');
    }
  }

  /**
   * @method _onUpdateEmployees
   * @description attached to EmployeeModel UPDATE_EMPLOYEES event
   * @param {Object} e
   */
  _onUpdateEmployees(e){
    if ( e.state === this.EmployeeModel.store.STATE.LOADED ){
      console.log("Update Finished: ",e);
    } else if ( e.state === this.EmployeeModel.store.STATE.ERROR ) {
      console.error('Cannot display page. Something wrong with update');
      this.AppStateModel.showError('Unable to update employee.');
    }
  }

  /**
   * @method _onAddEmployeeToGroup
   * @description attached to EmployeeModel ADD_EMPLOYEE_TO_GROUP event
   * @param {Object} e
   */
  _onAddEmployeeToGroup(e){
    if ( e.state === this.EmployeeModel.store.STATE.LOADED ){
      console.log("Add Employee Finished: ",e);
    } else if ( e.state === this.EmployeeModel.store.STATE.ERROR ) {
      console.error('Cannot display page. Employee not added.');
      this.AppStateModel.showError('Unable to add employee.');
    }
  }

  /**
   * @method _onRemoveEmployeeFromGroup
   * @description attached to EmployeeModel REMOVE_EMPLOYEE_FROM_GROUP event
   * @param {Object} e
   */
  _onRemoveEmployeeFromGroup(e){
    if ( e.state === this.EmployeeModel.store.STATE.LOADED ){
      console.log("Remove Employee Finished:",e);
    } else if ( e.state === this.EmployeeModel.store.STATE.ERROR ) {
      console.error('Cannot display page. Employee not removed');
      this.AppStateModel.showError('Unable to remove employee.');
    }
  }

  /**
   * @method _onSetGroupsHead
   * @description attached to GroupModel SET_GROUPS_HEAD event
   * @param {Object} e
   */
  _onSetGroupsHead(e){
    if ( e.state === this.GroupModel.store.STATE.LOADED ){
      console.log("Add Head Finished:",e);

    } else if ( e.state === this.GroupModel.store.STATE.ERROR ) {
      console.error('Cannot display page. Group Head not added.');
      this.AppStateModel.showError('Unable to add group head.');
    }
  }

  /**
   * @method _onRemoveGroupsHead
   * @description attached to GroupModel REMOVE_GROUPS_HEAD event
   * @param {Object} e
   */
  _onRemoveGroupsHead(e){
    if ( e.state === this.GroupModel.store.STATE.LOADED ){
      console.log("Head Remove Finished:", e);

    } else if ( e.state === this.GroupModel.store.STATE.ERROR ) {
      console.error('Cannot display page. Group Head not removed.');
      this.AppStateModel.showError('Unable to remove group head.');
    }
  }


  /**
   * @method _onAppStateUpdate
   * @description bound to AppStateModel app-state-update event
   *
   * @param {Object} e
   */
  async _onAppStateUpdate(e) {
    if (e.page != this.id ) return;

    const token = this.AuthModel.getToken();
    if(!token.hasAdminAccess && !token.hasHrAccess) {
      this.AppStateModel.showError('You do not have permission to use this tool.');
      return;
    }
    this._setPage(e);

    const promises = [];
    promises.push(this.GroupModel.getAll());
    await Promise.all(promises);
  }

  /**
   * @description Sets subpage based on location hash
   * @param {Object} e
   */
  async _setPage(){
    this.page = "employee-select";
    this.AppStateModel.showLoaded(this.id);

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

    this.checkDepartmentHead(this.departmentId);

    this.requestUpdate();
  }

  /**
   * @method checkDepartmentHead
   * @description checks if department already has a head
   * @param {Number} id
   */
  async checkDepartmentHead(id){
    this.departmentId = Number(id);
    let groupById = await this.GroupModel.getById(this.departmentId);

    await this.GroupModel.clearGroupIDCache();
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
    let message;

    try {
      message = `Employee ${this.firstName} ${this.lastName} updated successfully.`;
      // Update title if changed
      if (this.employeeTitle !== this.employeeRecord.title) {
        let updateEmployeeTitle = { title: this.employeeTitle };
        promises.push(await this.EmployeeModel.update(this.dbId, updateEmployeeTitle));
      }

      // Handle department change
      if (this.departmentId !== this.department.id) {
        promises.push(await this.EmployeeModel.removeFromGroup(this.dbId, { departmentId: this.department.id }));
        promises.push(await this.EmployeeModel.addToGroup(this.dbId, {
          departmentId: this.departmentId,
          isHead: this.isHead
        }));
      } else {
        // Handle only head status change
        if (this.isHead !== this.department.isHead) {
          if (!this.isHead) {
            promises.push(await this.GroupModel.removeGroupHead(this.departmentId));
          } else {
            promises.push(await this.GroupModel.setGroupHead(this.departmentId, { employeeRowID: this.dbId }));
          }
        }
      }

      // Await promises
      await Promise.all(promises);

      this.AppStateModel.showAlertBanner({message: message, brandColor: 'quad'});

      this.requestUpdate();
      this._onRenderResult();

    } catch (error) {
      message ='An error occurred while updating the employee record.';
      this.AppStateModel.showAlertBanner({message: message, brandColor: 'double-decker'});
    }
  }


  /**
   * @method _onRenderResult
   * @description refreshes UI with updated employee info
  */
  async _onRenderResult(){
    let id = this.iamId;

    let res = await this.EmployeeModel.searchById(id, 'iamId');
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
