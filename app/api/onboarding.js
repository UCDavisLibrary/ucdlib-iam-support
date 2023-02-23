module.exports = (app) => {
  app.post('/api/onboarding/new', async (req, res) => {
    const { default: UcdlibOnboarding } = await import('@ucd-lib/iam-support-lib/src/utils/onboarding.js');
    const payload = req.body;

    // TODO: set submittedBy and modifiedBy properties


    const r = await UcdlibOnboarding.create(payload);
    if ( r.err ) {
      console.error(r.err);
      res.json({error: true, message: 'Unable to create onboarding request.'});
      return;
    }
    const output = r.res.rows[0];

    // create rt
    // update submission if successful, delete if not
    return res.json(output);

  });

  app.get('/api/onboarding/:id', async (req, res) => {
    const { default: UcdlibOnboarding } = await import('@ucd-lib/iam-support-lib/src/utils/onboarding.js');
    const { default: TextUtils } = await import('@ucd-lib/iam-support-lib/src/utils/text.js')

    const r = await UcdlibOnboarding.getById(req.params.id);
    if ( r.err ) {
      console.error(r.err);
      res.json({error: true, message: 'Unable to retrieve onboarding request'});
      return;
    }
    if ( !r.res.rows.length ){
      console.error(r.err);
      res.json({error: true, message: 'Request does not exist!'});
      return;
    }
    return res.json(TextUtils.camelCaseObject(r.res.rows[0]));

  });

  app.get('/api/onboarding', async (req, res) => {
    const { default: UcdlibOnboarding } = await import('@ucd-lib/iam-support-lib/src/utils/onboarding.js');
    const { default: TextUtils } = await import('@ucd-lib/iam-support-lib/src/utils/text.js');
    const { default: UcdlibGroups } = await import('@ucd-lib/iam-support-lib/src/utils/groups.js');
    const { default: Pg } = await import('@ucd-lib/iam-support-lib/src/utils/pg.js');


    const errorMsg = 'Unable to retrieve onboarding requests';
    const q = {
      statusId: req.query.statusId,
      iamId: req.query.iamId,
      rtTicketId: req.query.rtTicketId,
      supervisorId: req.query.supervisorId
    };
    if ( req.query.isOpen != undefined ) q['isOpen'] = req.query.isOpen;

    const r = await UcdlibOnboarding.query(q);
    if ( r.err ) {
      console.error(r.err);
      res.json({error: true, message: errorMsg});
      return;
    }
    let groups = await UcdlibGroups.getAll();
    if ( groups.err ){
      console.error(r.err);
      res.json({error: true, message: errorMsg});
      return;
    }
    groups = Pg.recordsById(groups.res.rows);

    const output = r.res.rows.map(row => {
      row.group_ids.forEach(gid => {
        if ( groups[gid] && groups[gid].part_of_org ){
          row.department_name = groups[gid].name;
        }
      });
      row.department_name = row.department_name || '';
      return TextUtils.camelCaseObject(row);
    });
    return res.json(output);
  });
  }