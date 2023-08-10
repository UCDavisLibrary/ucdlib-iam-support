import utils from './utils.js';
import UcdlibSeparation from '@ucd-lib/iam-support-lib/src/utils/separation.js';
import pg from '@ucd-lib/iam-support-lib/src/utils/pg.js';

class separationCli {

  async list(options) {
    const query = {};
    if ( options.statustype === 'open' ) {
      query.isOpen = true;
    } else if ( options.statustype === 'resolved' ) {
      query.isOpen = false;
    }
    const r = await UcdlibSeparation.query(query);
    await pg.pool.end();
    if ( !r.res.rowCount ) {
      console.log('No separation records found');
      return;
    }
    const colsToShow = ['id', 'iam_id', 'rt_ticket_id', 'separation_date', 'status_name', 'submitted_by'];
    utils.printTable(r.res.rows, colsToShow);
  }

  async inspect(id){
    const r = await UcdlibSeparation.getById(id);
    await pg.pool.end();
    if ( !r.res.rowCount ) {
      console.log('No separation records found');
      return;
    }
    utils.logObject(r.res.rows[0]);
  }

  async remove(id){
    const request = await UcdlibSeparation.getById(id);
    if ( !request.res.rowCount ) {
      console.error(`Separation request ${id} not found`);
      await pg.pool.end();
      return;
    }

    const r = await UcdlibSeparation.delete(id);
    await pg.pool.end();
    if ( r.err ) {
      console.error(r.err);
      return;
    }
    console.log(`Removed separation request ${id}`);
  }

}

export default new separationCli();
