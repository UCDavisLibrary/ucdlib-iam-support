import UcdlibEmployees from '@ucd-lib/iam-support-lib/src/utils/employees.js';
import UcdlibGroups from '@ucd-lib/iam-support-lib/src/utils/groups.js';
import utils from "../lib/utils.js";
import protect from '../lib/protect.js';

export default ( api ) => {


  api.get(`/active-titles`, async (req, res) => {


    const results = await UcdlibEmployees.getAll({returnUcdRecord: true});
    if ( results.err ) {
      return res.status(400).json({
        error: 'Error getting active titles'
      });
    }

    const titles = {};
    results.res.rows.forEach(employee => {
      const primaryTitleCode = employee.primary_association?.titleCode;
      if ( !primaryTitleCode ) return;

      const appointment = ((employee.ucd_record || {}).ppsAssociations || []).find(appt => appt.titleCode === primaryTitleCode);
      if ( !appointment ) return;

      const count = titles[primaryTitleCode] ? titles[primaryTitleCode].count + 1 : 1;

      titles[primaryTitleCode] = {
        titleCode: primaryTitleCode,
        titleDisplayName: appointment.titleDisplayName,
        titleOfficialName: appointment.titleOfficialName,
        count
      };


    });

    res.json(Object.values(titles));
  });




}
