import utils from './utils.js';
import models from '#models';
import pg from '#lib/utils/pg.js';

class separationCli {

  async list(options) {
    const query = {};
    if ( options.statustype === 'open' ) {
      query.isOpen = true;
    } else if ( options.statustype === 'resolved' ) {
      query.isOpen = false;
    }
    const r = await models.separation.query(query);
    await pg.pool.end();
    if ( !r.res.rowCount ) {
      console.log('No separation records found');
      return;
    }
    const colsToShow = ['id', 'iam_id', 'rt_ticket_id', 'separation_date', 'status_name', 'submitted_by'];
    utils.printTable(r.res.rows, colsToShow);
  }

  async inspect(id){
    const r = await models.separation.getById(id);
    await pg.pool.end();
    if ( !r.res.rowCount ) {
      console.log('No separation records found');
      return;
    }
    utils.logObject(r.res.rows[0]);
  }

  async remove(id){
    const request = await models.separation.getById(id);
    if ( !request.res.rowCount ) {
      console.error(`Separation request ${id} not found`);
      await pg.pool.end();
      return;
    }

    const r = await models.separation.delete(id);
    await pg.pool.end();
    if ( r.err ) {
      console.error(r.err);
      return;
    }
    console.log(`Removed separation request ${id}`);
  }

  async replaceDepartmentHead(separationId, newHeadId) {
    let request = await models.separation.getById(separationId);
    if ( !request.res.rowCount ) {
      console.error(`Separation request ${separationId} not found`);
      await pg.pool.end();
      return;
    }
    request = request.res.rows[0];
    const additionalData = request.additional_data || {};

    let employee = await models.employees.getById(newHeadId, 'iamId');
    if ( !employee.res?.rowCount ) {
      console.error(`Employee record with iam_id ${newHeadId} does not exist`);
      await pg.pool.end();
      return;
    }
    employee = employee.res.rows[0];

    additionalData.newDepartmentHead = newHeadId;
    additionalData.newDepartmentHeadName = `${employee.first_name} ${employee.last_name}`;
    const r = await models.separation.update(separationId, {additionalData});
    await pg.pool.end();
    if ( r.err ) {
      console.error(r.err);
      return;
    }
    console.log(`Updated separation request ${separationId} with new department head ${newHeadId}`); 
  }

}

export default new separationCli();
