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
   * @description Preferred or official middle name
   * @returns {String}
   */
  get middleName(){
    if ( this.isEmpty ) return '';
    if ( this.data.dMiddleName ) return this.data.dMiddleName;
    if ( this.data.oMiddleName ) return this.data.oMiddleName;
    return "";
  }

  /**
   * @description Preferred or official suffix
   * @returns {String}
   */
  get suffix(){
    if ( this.isEmpty ) return '';
    if ( this.data.dSuffix ) return this.data.dSuffix;
    if ( this.data.oSuffix ) return this.data.oSuffix;
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

  /**
   * @description Returns primary association if defined, otherwise returns first one.
   * Returns empty object if none
   */
  get primaryAssociation(){
    if ( !this.hasAppointment ) return {};
    return this.data.ppsAssociations[this.primaryAssociationIndex];
  }

  /**
   * @description Returns association by dept/title codes if found, otherwise returns mpty object.
   * @param {String} deptCode
   * @param {String} titleCode
   * @param {Boolean} setAsPrimary - If true, sets primary association to this one
   * @returns {Object}
   */
  getAssociation(deptCode, titleCode, setAsPrimary){
    let i = 0;
    for (const appt of this.appointments) {
      if ( appt.deptCode == deptCode && appt.titleCode == titleCode ) {
        if ( setAsPrimary ) this.setPrimaryAssociationIndex(i);
        return appt;
      }
      i++;
    }
    return {};
  }

  /**
   * @description Returns employee id of supervisor for primary association
   * @returns {String}
   */
  get supervisorEmployeeId(){
    return this.primaryAssociation.reportsToEmplID || '';
  }

  /**
   * @description Returns employee ids for all supervisors
   */
  get allSupervisorEmployeeIds(){
    const empIds = new Set();
    if ( !this.hasAppointment ) return [];
    this.appointments.forEach(a => empIds.add(a.reportsToEmplID));
    return Array.from(empIds).map(x => x);
  }

  get types(){
    return {
      student: this.data.isStudent || false,
      faculty: this.data.isFaculty || false,
      staff: this.data.isStaff || false,
      employee: this.data.isEmployee || false,
      hsEmployee: this.data.isHSEmployee || false,
      external: this.data.isExternal || false
    }
  }

  get isLibraryEmployee(){
    const libCodes = ['060500'];
    for ( const appt of this.appointments ) {
      if ( libCodes.includes(appt.deptCode) ) return true;
    }
    return false;
  }
}

export default IamPersonTransform;