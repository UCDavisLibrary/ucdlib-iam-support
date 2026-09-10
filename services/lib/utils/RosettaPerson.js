/**
 * @description Represents a person record returned from the Rosetta API. 
 * Provides convenient accessors for commonly used fields
 */
class RosettaPerson {

  constructor(data){
    this.data = data || {};
  }

  /**
   * @description Returns true if the person record is empty (no data), false otherwise
   */
  get isEmpty(){
    return !this.data || Object.keys(this.data).length === 0;
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

  /**
   * @description Employee ID for the person, or an empty string if none exists
   */
  get employeeId(){
    return this.data.id?.employee_id || '';
  }

  /**
   * @description Iam ID for the person, or an empty string if none exists
   */
  get id(){
    return this.data.id?.iam_id || '';
  }

  /**
   * @description Login ID/Username/kerberos for the person, or an empty string if none exists
   */
  get userId(){
    return this.data.id?.login_id || '';
  }

  /**
   * @description Returns true if the person has at least one employment association, false otherwise
   */
  get hasAppointment(){
    return this.data.employee_association?.length > 0;
  }

  /**
   * @description Returns the start date of the primary employment association, or an empty string if no primary association exists
   */
  get startDate(){
    return this.primaryAssociation?.start_date || '';
  }

  /**
   * @description Returns the list of employment associations for the person
   */
  get appointments(){
    return this.data.employee_association || [];
  }

  /**
   * @description Returns the primary campus email address for the person, or an empty string if none exists
   */
  get email(){
    return this.data.email?.campus || '';
  }

  /**
   * @description Primary employment association. Returns null if no primary association exists.
   */
  get primaryAssociation(){
    return this.data.employee_association?.find(a => a.job_indicator === 'P') || null;
  }

  /**
   * @description Primary employment association label. Returns an empty string if no primary association exists.
   */
  get primaryAssociationLabel(){
    const assoc = this.primaryAssociation;
    if ( !assoc ) return '';
    return `${assoc.position_title || ''} - ${assoc.department_title || ''}, ${assoc.subdivision_title || ''}`.trim();
  }

  /**
   * @description First student association. Returns null if no student association exists.
   */
  get studentAssociation(){
    return this.data.student_association?.[0] || null;
  }

  /**
   * @description First student association label. Returns an empty string if no student association exists.
   */
  get studentAssociationLabel(){
    const assoc = this.studentAssociation;
    if ( !assoc ) return '';
    return `${assoc.class_level || ''} - ${assoc.major_title || ''}`.trim();
  }

  /**
   * @description Returns true if the person is a temporary affiliate, false otherwise
   */
  get isTemporaryAffiliate(){
    return this.data.affiliation?.temporary_affiliate === 'Y';
  }

  /**
   * @description Returns true if the person is a health affiliate, false otherwise
   */
  get isHealthAffiliate(){
    return this.data.affiliation?.health_affiliate === 'Y';
  }

  /**
   * @description Returns true if the person is a UC ANR affiliate, false otherwise
   */
  get ucanrAffiliation(){
    return this.data.affiliation?.ucanr_affiliate === 'Y';
  }
}

export default RosettaPerson;