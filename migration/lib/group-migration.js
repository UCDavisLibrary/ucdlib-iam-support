import UcdlibGroups from '@ucd-lib/iam-support-lib/src/utils/groups.js';
import UcdlibCache from '@ucd-lib/iam-support-lib/src/utils/cache.js';

class GroupMigration {
  constructor() {
    this.groups = [];
    this.groupBySlug = {};
  }

  async importGroups(groups) {
    for (let group of groups) {
      const g = {
        name: group.name,
        type: group.type
      };
      if ( group.siteId ){
        g.siteId = group.siteId;
      }
      if ( group.nameShort ) {
        g.nameShort = group.nameShort;
      }
      if ( group.parent ){
        try {
          g.parentId = this.groupBySlug[group.parent].id;
        } catch (error) {
          throw new Error(`Parent group ${group.parent} not found for ${group.name}`);
        }
      }
      const r = await UcdlibGroups.create(g);
      if (r.err) {
        throw new Error(r.err);
      }
      this.groupBySlug[group.slug] = r.res.rows[0];
    }
    await UcdlibCache.set('migration', 'groupsBySlug', this.groupBySlug);
    await this.getAllGroups();
  }

  async getAllGroups() {
    const r = await UcdlibGroups.getAll();
    if (r.err) {
      throw new Error(r.err);
    }
    this.groups = r.res.rows;
    return this.groups;
  }

  async groupsExist() {
    const r = await UcdlibGroups.getCount();
    if (r.err) {
      throw new Error(r.err);
    }
    return r.res.rows[0].count > 0;
  }

  // set groupsBySlug from cache
  async setGroupsBySlug() {
    const r = await UcdlibCache.get('migration', 'groupsBySlug');
    if (r.err) {
      throw new Error(r.err);
    } else if (!r.res.rows.length) {
      throw new Error('groupsBySlug not found in cache. Clear groups table and try again.');
    }
    this.groupBySlug = r.res.rows[0].data;
  }
};

export default new GroupMigration();