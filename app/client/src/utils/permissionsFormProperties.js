export default [
  {
    prop: 'iamId',
    payload: 'iamId',
    default: ''
  },
  {
    prop: 'pMainWebsiteRoles',
    payload: 'permissions.mainWebsite.roles',
    default: []
  },
  {
    prop: 'pMainWebsiteNotes',
    payload: 'permissions.mainWebsite.notes',
    default: ''
  },
  {
    prop: 'pIntranetRoles',
    payload: 'permissions.intranet.roles',
    default: []
  },
  {
    prop: 'notes',
    payload: 'notes',
    default: ''
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
    default: 'none'
  },
  {
    prop: 'pLibguides',
    payload: 'permissions.libguides.role',
    default: 'none'
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
    default: false
  },
  {
    prop: 'pBigsysPatron',
    payload: 'permissions.bigsys.patron',
    default: false
  },
  {
    prop: 'pBigsysTravel',
    payload: 'permissions.bigsys.travel',
    default: false
  },
  {
    prop: 'pBigsysOpenAccess',
    payload: 'permissions.bigsys.openAccess',
    default: false
  },
  {
    prop: 'pBigsysCheckProcessing',
    payload: 'permissions.bigsys.checkProcessing',
    default: false
  },
  {
    prop: 'pBigsysOther',
    payload: 'permissions.bigsys.other',
    default: ''
  }
];