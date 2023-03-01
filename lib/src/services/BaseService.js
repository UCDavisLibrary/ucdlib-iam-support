import {BaseService} from '@ucd-lib/cork-app-utils';

export default class BaseServiceImp extends BaseService {
  constructor() {
    super();
  }

  async request(options){
    if( typeof window !== 'undefined' && window.Keycloak ) { 
      if( !options.fetchOptions ) options.fetchOptions = {};
      if( !options.fetchOptions.headers ) options.fetchOptions.headers = {};
      options.fetchOptions.headers.Authorization = `Bearer ${window.Keycloak.token}`
    }
    super.request(options);
  }
}