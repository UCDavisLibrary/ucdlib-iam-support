/**
 * @description Utility class for accessing and transforming data from a UCD IAM person record
 */
class IamPersonTransform{
  /**
   * 
   * @param {Object} record - UCD IAM person record from profile endpoint
   */
  constructor(record, primaryAssociationIndex=0){
    if ( typeof record !== 'object' ) record = {};
    this.data = record;
    this.isEmpty = Object.keys(this.data).length == 0;
    this.primaryAssociationIndex = primaryAssociationIndex;
  }

  /**
   * @description Preferred or official first name
   * @returns {String}
   */
  get firstName(){
    if ( this.isEmpty ) return '';
    if ( this.data.dFirstName ) return this.data.dFirstName;
    if ( this.data.oFirstName ) return this.data.oFirstName;
    return "";
  }

  /**
   * @description Preferred or official last name
   * @returns {String}
   */
   get lastName(){
    if ( this.isEmpty ) return '';
    if ( this.data.dLastName ) return this.data.dLastName;
    if ( this.data.oLastName ) return this.data.oLastName;
    return "";
  }

  /**
   * @description Preferred or official full name
   * @returns {String}
   */
  get fullName(){
    if ( this.data.dFullName ) return this.data.dFullName;
    if ( this.data.oFullName ) return this.data.oFullName;
    return "";
  }

  /**
   * @description Person has at least one job appointment
   * @returns {Boolean}
   */
  get hasAppointment(){
    if ( this.isEmpty ) return false;
    return  this.data.ppsAssociations && this.data.ppsAssociations.length > 0;
  }

  /**
   * @description Sets primary appointment from ppsAssociations index
   * @param {Number} i 
   */
  setPrimaryAssociationIndex(i){
    if ( !this.hasAppointment ) this.primaryAssociationIndex = 0;
    if ( this.data.ppsAssociations.length < i + 1) {
      this.primaryAssociationIndex = 0;
    } else {
      this.primaryAssociationIndex = i;
    }
  }

  /**
   * @description Returns list of job appointments
   * @returns {Array}
   */
  get appointments(){
    if ( !this.hasAppointment ) return [];
    return this.data.ppsAssociations;
  }

  /**
   * @description Returns start date of primary appointment
   * @returns {String}
   */
  get startDate(){
    if ( !this.hasAppointment ) return '';
    return this.data.ppsAssociations[this.primaryAssociationIndex].assocStartDate.split(' ')[0];
  }

  /**
   * @description Returns person's preferred email
   * @returns {String}
   */
  get email(){
    let email = this.data.email || '';
    if ( !this.data.directory || !this.data.directory.listings || !Array.isArray(this.data.directory.listings)) return email;
    const listingEmails = this.data.directory.listings.filter(l => l.email).sort((a, b) => a.listingOrder - b.listingOrder);
    if ( !listingEmails.length ) return email;
    return listingEmails[0].email;
  }

  /**
   * @description Returns employeeid
   * @returns {String}
   */
  get employeeId(){
    return this.data.employeeId || '';
  }

  /**
   * @description Returns userId (kerberos)
   * @returns {String}
   */
  get userId(){
    return this.data.userID || '';
  }

  /**
   * @description Returns iamId
   * @returns {String}
   */
  get id(){
    return this.data.iamId;
  }
}

export default IamPersonTransform;