/**
 * @description Represents a person record returned from the Rosetta API. 
 * Provides convenient accessors for commonly used fields
 */
class RosettaPerson {

  constructor(data){
    this.data = data || {};
  }

  /**
   * @description Preferred or official first name
   */
  get firstName(){
    return this.data.name?.lived_first_name || this.data.name?.legal_first_name || '';
  }

  /**
   * @description Preferred or official last name
   */
  get lastName(){
    return this.data.name?.lived_last_name || this.data.name?.legal_last_name || '';
  }

  /**
   * @description Preferred or official full name
   */
  get fullName(){
    return this.data.displayname || `${this.firstName} ${this.lastName}`.trim();
  }
}

export default RosettaPerson;