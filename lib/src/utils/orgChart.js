/**
 * @description Utility class for accessing and transforming data from a Employeerecord to Organizational Chart
 */
 class OrgChartTransform{
    /**
     * 
     * @param {Object} record - Alma person record from profile endpoint
     */
    constructor(record){
      if ( typeof record !== 'object' ) record = {};
      this.data = record;
      this.isEmpty = Object.keys(this.data).length == 0;
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
     * @description Preferred or official first name
     * @returns {String}
     */
    get iam_id(){
      if ( this.isEmpty ) return '';
      if ( this.data.iamId ) return this.data.iamId;
      return "";
    }

        /**
     * @description Preferred or official first name
     * @returns {String}
     */
    get supervisor_id(){
      if ( this.isEmpty ) return '';
      if ( this.data.supervisorId ) return this.data.supervisorId;
      return "";
    }
  
  
    /**
     * @description Preferred or official last name
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