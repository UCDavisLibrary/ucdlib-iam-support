import { run as syncEmployees } from './iam-employee.js';
import pg from "#lib/utils/pg.js";

try {
  await syncEmployees();
} catch (e) {
  console.error(e.message);
  console.error(e.error || e);
}

await pg.pool.end();
process.exit(0);
