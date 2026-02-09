const applications = [
  {
    id: 'main-website',
    name: 'Main Website',
    url: 'https://library.ucdavis.edu',
  },
  {
    id: 'intranet',
    name: 'Staff Intranet',
    url: 'https://staff.library.ucdavis.edu'
  },
  {
    id: 'alma',
    name: 'Alma',
  },
  {
    id: 'libguides',
    name: 'LibGuides',
    url: 'https://guides.library.ucdavis.edu'
  },
  {
    id: 'libcal',
    name: 'LibCal',
    url: 'https://reservations.library.ucdavis.edu'
  },
  {
    id: 'calendly',
    name: 'Calendly',
  },
  {
    id: 'slack',
    name: 'Slack'
  },
  {
    id: 'bigsys',
    name: 'BigSys'
  },
  {
    id: 'lang-prize',
    name: 'Lang Prize'
  },
  {
    id: 'aggie-open',
    name: 'Aggie Open'
  }
];

applications.sort((a, b) => {
  if (a.name < b.name) {
    return -1;
  }
  return 1;
});

export default applications;
