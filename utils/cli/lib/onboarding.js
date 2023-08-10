import utils from './utils.js';
import UcdlibOnboarding from '@ucd-lib/iam-support-lib/src/utils/onboarding.js';
import pg from '@ucd-lib/iam-support-lib/src/utils/pg.js';

class onboardingCli {

  async list(options) {
    const query = {};
    if ( options.statustype === 'open' ) {
      query.isOpen = true;
    } else if ( options.statustype === 'resolved' ) {
      query.isOpen = false;
    }
    const r = await UcdlibOnboarding.query(query);
    await pg.pool.end();
    if ( !r.res.rowCount ) {
      console.log('No onboarding records found');
      return;
    }
    const colsToShow = ['id', 'iam_id', 'rt_ticket_id', 'library_title', 'status_name', 'submitted_by', 'submitted'];
    utils.printTable(r.res.rows, colsToShow);
  }

  async inspect(id){
    const r = await UcdlibOnboarding.getById(id);
    await pg.pool.end();
    if ( !r.res.rowCount ) {
      console.log('No onboarding records found');
      return;
    }
    utils.logObject(r.res.rows[0]);
  }

  async remove(id){
    const request = await UcdlibOnboarding.getById(id);
    if ( !request.res.rowCount ) {
      console.error(`Onboarding request ${id} not found`);
      await pg.pool.end();
      return;
    }

    let r;
    r = await UcdlibOnboarding.deleteAllPermissionRequests(id);
    if ( r.err ) {
      console.error(r.err);
      await pg.pool.end();
      return;
    }
    r = await UcdlibOnboarding.delete(id);
    if ( r.err ) {
      console.error(r.err);
      await pg.pool.end();
      return;
    }
    await pg.pool.end();
    console.log(`Removed onboarding request ${id}`);
  }
}

export default new onboardingCli();
