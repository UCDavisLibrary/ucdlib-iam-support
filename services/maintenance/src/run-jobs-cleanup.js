import { run as jobsCleanup } from './jobs-cleanup.js';
import pg from "#lib/utils/pg.js";

await jobsCleanup();

await pg.pool.end();
process.exit(0);
