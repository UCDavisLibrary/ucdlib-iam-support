import { run as checkSeparationRecords } from './check-separation-records.js';
import pg from "@ucd-lib/iam-support-lib/src/utils/pg.js";

await checkSeparationRecords(true);

await pg.pool.end();
