/**
 * @description Utility class for accessing and transforming data from a UCD alma record
 */
 class AlmaTransform{
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
    get firstName(){
      if ( this.isEmpty ) return '';
      if ( this.data.first_name ) return this.data.first_name;
      return "";
    }
  
    /**
     * @description Preferred or official last name
     * @returns {String}
     */
     get lastName(){
      if ( this.isEmpty ) return '';
      if ( this.data.last_name ) return this.data.last_name;
      return "";
    }

    /**
     * @description Preferred or official middle name
     * @returns {String}
     */
    get middleName(){
      if ( this.isEmpty ) return '';
      if ( this.data.middle_name ) return this.data.middle_name;
      return "";
    }

    /**
     * @description Returns userId
     * @returns {String}
     */
    get userId(){
      return this.data.primary_id || '';
    }

    /**
     * @description Returns account_type
     * @returns {String}
     */
    get account_type(){
      return this.data.account_type || '';
    }
    
    /**
     * @description Returns campus_code
     * @returns {String}
     */
     get campus_code(){
      return this.data.campus_code || '';
    }

    /**
     * @description Returns contact_info
     * @returns {String}
     */
     get contact_info(){
      return this.data.contact_info || {};
    }

    /**
     * @description Returns user_roles
     * @returns {String}
     */
     get user_roles(){
      return this.data.user_role || {};
    }
  
    /**
     * @description Returns status
     * @returns {String}
     */
    get status(){
      return this.data.status["value"] || '';
    }

  
  }
  
  export default AlmaTransform;