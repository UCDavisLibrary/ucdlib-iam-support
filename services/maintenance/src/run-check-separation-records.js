import { run as checkSeparationRecords } from './check-separation-records.js';
import pg from "#lib/utils/pg.js";

await checkSeparationRecords(true);

await pg.pool.end();
