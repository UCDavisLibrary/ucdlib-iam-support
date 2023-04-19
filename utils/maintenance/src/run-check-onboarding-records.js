import { run as checkOnboardingRecords } from './check-onboarding-records.js';
import pg from "@ucd-lib/iam-support-lib/src/utils/pg.js";

await checkOnboardingRecords(true);

await pg.client.end();