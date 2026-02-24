import { BaseStore, LruStore } from '@ucd-lib/cork-app-utils';

class AlmaStore extends BaseStore {

  constructor() {
    super();

    this.data = {
      roles: new LruStore({ name: 'alma.roles' }),
      getUserById: new LruStore({name: 'alma.getUserById'}),
      queryUserByName: new LruStore({ name: 'alma.queryUserByName' }),
    };
    this.events = {};

    // set interval to clear cache to prevent stale low-use entries for accumulating
    const FIFTEEN_MINUTES = 15 * 60 * 1000;
    const TWELVE_HOURS = 12 * 60 * 60 * 1000;
    this.cacheClearInterval = setInterval(() => this.clearCache(TWELVE_HOURS), FIFTEEN_MINUTES);
  }

  /**
   * @description Clear all LruStore caches in this store
   * @param {Number} interval - Entries greater than this age (in milliseconds) will be cleared. If not provided, all entries will be cleared.
   */
  clearCache(interval){
    for (const storeName in this.data) {
      const store = this.data[storeName];
      if ( !(store instanceof LruStore) ) {
        continue;
      }
      if (interval) {
        const now = Date.now();
        const keysToPurge = [];
        for ( const [key, entry] of store.cache.entries() ) {
          if ( now - entry.lastUsed > interval ) {
            keysToPurge.push(key);
          }
        }
        keysToPurge.forEach(key => store.cache.delete(key));
      } else {
        store.purge();
      }
    }
  }

}

const store = new AlmaStore();
export default store;