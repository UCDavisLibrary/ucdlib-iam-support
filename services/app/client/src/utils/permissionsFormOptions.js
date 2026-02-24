export default [
  {
    k: 'pMainWebsiteRolesList',
    v: [
      {
        slug: 'subscriber', 
        label: 'Subscriber',
        description: 'User can log in, but has no real capabilities.'
      },
      {
        slug: 'author', 
        label: 'Author',
        description: `The default role. User can create pages, exhibits, and news posts, but cannot edit other's pages/posts`
      },
      {
        slug: 'editor', 
        label: 'Editor',
        description: 'User can create and edit all pages, exhibits, and news posts on the site.'
      },
      {
        slug: 'directory_manager', 
        label: 'Directory Manager',
        description: 'Can create and edit person profiles, and update staff directory display settings.'
      },
      {
        slug: 'exhibit_manager', 
        label: 'Exhibit Manager',
        description: 'Can manage exhibit terms (locations, curating orgs, etc).'
      },
      {
        slug: 'collection_manager', 
        label: 'Special Collection Manager',
        description: 'Can create and edit manuscripts/univeristy archives entries.'
      },
      {
        slug: 'admin', 
        label: 'Admin',
        description: 'User has all capabilities.'
      }
    ]
  },
  {
    k: 'pIntranetRolesList',
    v: [
      {
        slug: 'subscriber', 
        label: 'Subscriber',
        description: 'User can view, but not edit pages.'
      },
      {
        slug: 'editor', 
        label: 'Editor',
        description: 'The defaul role. User can create and edit all pages on the site.'
      },
      {
        slug: 'admin', 
        label: 'Admin',
        description: 'User has all capabilities.'
      }
    ]
  },
  {
    k: 'computerEquipmentOptions',
    v: [
      {value: 'workstation', label: 'Workstation'},
      {value: 'laptop', label: 'Laptop'}
    ]
  },
  {
    k: 'libguidesRoles',
    v: [
      {
        value: 'regular', 
        label: 'Regular',
        description: 'Create guides and content but not edit system-level settings.'
      },
      {
        value: 'editor', 
        label: 'Editor',
        description: 'Cannot create guides, but can be assigned to edit guides or courses created by others.'
      },
      {
        value: 'admin', 
        label: 'Admin',
        description: 'Full access to all areas of the system.'
      }
    ]
  },
  {
    k: 'libcalRoles',
    v: [
      {
        value: 'regular', 
        label: 'Regular',
        description: 'Can create and manage their own events, and manage space & equipment bookings.'
      },
      {
        value: 'admin', 
        label: 'Admin',
        description: 'In addition to Regular permissions, can also create and manage calendars, library & department hours, and manage all system settings.'
      }
    ]
  }
];