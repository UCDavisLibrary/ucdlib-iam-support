import { run as checkOnboardingRecords } from './check-onboarding-records.js';
import pg from "#lib/utils/pg.js";

await checkOnboardingRecords(true);

await pg.pool.end();
