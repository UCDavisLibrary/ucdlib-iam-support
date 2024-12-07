/**
 * @description Utility class for accessing and transforming data from a Employeerecord to Organizational Chart
 */
 class OrgChartTransform{
    /**
     * 
     * @param {Object} record - Alma employee record from profile endpoint
     * @param {Object} jobInfo - Alma person record from Person endpoint

     */
    constructor(record, jobInfo){
      if ( typeof record !== 'object' ) record = {};
      this.data = record;

      this.positionInfo = jobInfo.payload != undefined ? jobInfo.payload.ppsAssociations[0] : null;
      this.isEmpty = Object.keys(this.data).length == 0;
    }

    /**
     * @description Job Type
     * @returns {String}
     */
    get jobType(){
      if ( this.isEmpty ) return '';
      if (this.positionInfo) return this.positionInfo.positionType
    }

    /**
     * @description Job Percentage
     * @returns {String}
     */
    get jobPercentage(){
      if ( this.isEmpty ) return '';

      if (this.positionInfo) {
        let result = String(this.positionInfo.percentFulltime * 100)
        return result + '%'
      }
    }
  
    /**
     * @description Preferred or official first name
     * @returns {String}
     */
    get unique_id(){
      if ( this.isEmpty ) return '';
      if ( this.data.employeeId ) return this.data.employeeId;
      return "";
    }

    /**
     * @description IAM ID
     * @returns {String}
     */
    get iam_id(){
      if ( this.isEmpty ) return '';
      if ( this.data.iamId ) return this.data.iamId;
      return "";
    }

        /**
     * @description Supervisor ID
     * @returns {String}
     */
    get supervisor_id(){
      if ( this.isEmpty ) return '';
      if ( this.data.supervisorId ) return this.data.supervisorId;
      return "";
    }
  
  
    /**
     * @description Preferred or official Full Name
     * @returns {String}
     */
     get name(){
      if ( this.isEmpty ) return '';
      if ( this.data.firstName && this.data.lastName ) return this.data.firstName + " " + this.data.lastName;
      return "";
    }

    /**
     * @description Preferred or official middle name
     * @returns {String}
     */
    get department(){
      if ( this.isEmpty ) return '';      
      if ( this.data.groups ) {
        let dpt = Object.entries(this.data.groups).find(a => a[1].type === 'Department')[1];
        return dpt.name;
      }
      return "";
    }

    /**
     * @description Returns userId
     * @returns {String}
     */
    get supervisor(){
      let supervisor = this.data.supervisorId != "" ? 
                this.data.supervisor.firstName + " " + this.data.supervisor.lastName 
                : "";
      return supervisor || '';
    }

    /**
     * @description Returns account_type
     * @returns {String}
     */
    get title(){
      return this.data.title || '';
    }
    
    /**
     * @description Returns campus_code
     * @returns {String}
     */
     get email(){
      return this.data.email || '';
    }

  
  }
  
  export default OrgChartTransform;