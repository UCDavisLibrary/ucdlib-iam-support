// a little script that compares internal alma users with users from local db
// just an ad hoc script we needed to run not related to the migration

import UcdlibEmployees from "@ucd-lib/iam-support-lib/src/utils/employees.js";
import * as fs from 'fs';
import { parse } from 'csv-parse';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const run = async () => {

  const out = [];
  // get local users and map by user id
  const localUsers = (await UcdlibEmployees.getAll()).res.rows;
  const localUsersMap = localUsers.reduce((map, user) => {
    map[user.user_id] = user;
    return map;
  }, {});

  const filename = fileURLToPath(import.meta.url);
  const dirname = path.dirname(filename);
  fs.createReadStream(path.join(dirname, "../data/staffLoginReportList.csv"))
  .pipe(parse({ delimiter: ",", from_line: 3 }))
  .on("data", function (row) {
    out.push({
      userId: row[0].toLowerCase(),
      lastLogin: row[1],
      email: row[2],
      isLibEmployee: localUsersMap[row[0].toLowerCase()] ? true : false
    });
  })
  .on("end", function () {
    const data = JSON.stringify(out, null, 2);
    fs.writeFileSync(path.join(dirname, "../data/staffLoginReportList.json"), data);
  });

};

run();