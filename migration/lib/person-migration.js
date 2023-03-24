import UcdlibCache from '@ucd-lib/iam-support-lib/src/utils/cache.js';
import { UcdIamModel } from "@ucd-lib/iam-support-lib/index.js";

import * as dotenv from 'dotenv' 
dotenv.config();

class PersonMigration {
  constructor() {
    // instantiate iam connection
    this.iam = UcdIamModel;
    this.iam.init(process.env.UCD_IAM_API_KEY);
  }

  // get iam record, cache it, and return it
  async getIamRecord(iamId) {
    const r = await UcdlibCache.get('iamId', iamId);
    if (r.err) {
      throw new Error(r.err);
    } else if (r.res.rows.length) {
      return r.res.rows[0].data;
    }

    const iamRecord = await this.iam.getPersonByIamId(iamId);
    if ( iamRecord.error ){
      console.log(iamRecord)
      throw new Error('Error getting iam record for '+iamId);
    }
    await UcdlibCache.set('iamId', iamId, iamRecord);
    return iamRecord;
  }
}

export default new PersonMigration();