/**
 * This file maps element properties to payload properties for the permissions form
 * Structure:
 * {
 *  prop: 'element property',
 *  payload: 'payload property',
 *  default: 'default value',
 *  applicationId: 'application id from ./applications.js',
 *  eleId: 'an element on the permissions form page',
 *  eleProp: 'a property of the element on the permissions form page. Will be set as well as page prop if eleId is set'
 */
export default [
  {
    prop: 'iamId',
    payload: 'iamId',
    default: ''
  },
  {
    prop: 'pMainWebsiteRoles',
    payload: 'permissions.mainWebsite.roles',
    default: [],
    applicationId: 'main-website',
  },
  {
    prop: 'pMainWebsiteNotes',
    payload: 'permissions.mainWebsite.notes',
    default: '',
    applicationId: 'main-website'
  },
  {
    prop: 'pIntranetRoles',
    payload: 'permissions.intranet.roles',
    default: [],
    applicationId: 'intranet'
  },
  {
    prop: 'pAlmaRoles',
    payload: 'permissions.alma.roles',
    default: [],
    eleId: 'alma-user-lookup',
    eleProp: 'user_roles',
    applicationId: 'alma'
  },
  {
    prop: 'notes',
    payload: 'notes',
    default: '',
    applicationId: 'notes' // bad hack. sorry - sp.
  },
  {
    prop: 'workLocation',
    payload: 'permissions.techEquipment.location',
    default: ''
  },
  {
    prop: 'computerEquipment',
    payload: 'permissions.techEquipment.computer',
    default: 'none'
  },
  {
    prop: 'specialEquipment',
    payload: 'permissions.techEquipment.specialEquipment',
    default: ''
  },
  {
    prop: 'officePhone',
    payload: 'permissions.techEquipment.officePhone',
    default: ''
  },
  {
    prop: 'equipmentNotes',
    payload: 'permissions.techEquipment.notes',
    default: ''
  },
  {
    prop: 'pLibcal',
    payload: 'permissions.libcal.role',
    default: 'none',
    applicationId: 'libcal'
  },
  {
    prop: 'pLibguides',
    payload: 'permissions.libguides.role',
    default: 'none',
    applicationId: 'libguides'
  },
  {
    prop: 'facilitiesErgonmic',
    payload: 'permissions.facilities.ergonomic',
    default: false
  },
  {
    prop: 'facilitiesKeys',
    payload: 'permissions.facilities.keys',
    default: false
  },
  {
    prop: 'facilitiesAlarmCodes',
    payload: 'permissions.facilities.codes',
    default: false
  },
  {
    prop: 'facilitiesDetails',
    payload: 'permissions.facilities.details',
    default: ''
  },
  {
    prop: 'pSlack',
    payload: 'permissions.slack.create',
    default: false,
    applicationId: 'slack'
  },
  {
    prop: 'pBigsysPatron',
    payload: 'permissions.bigsys.patron',
    default: false,
    applicationId: 'bigsys'
  },
  {
    prop: 'pBigsysTravel',
    payload: 'permissions.bigsys.travel',
    default: false,
    applicationId: 'bigsys'
  },
  {
    prop: 'pBigsysOpenAccess',
    payload: 'permissions.bigsys.openAccess',
    default: false,
    applicationId: 'bigsys'
  },
  {
    prop: 'pBigsysCheckProcessing',
    payload: 'permissions.bigsys.checkProcessing',
    default: false,
    applicationId: 'bigsys'
  },
  {
    prop: 'pBigsysOther',
    payload: 'permissions.bigsys.other',
    default: '',
    applicationId: 'bigsys'
  },
  {
    prop: 'customApplications',
    payload: 'permissions.customApplications',
    default: '',
    applicationId: 'custom-applications'
  }
];
