import { run as sendOnboardingReminders } from './send-onboarding-reminders.js';
import pg from "#lib/utils/pg.js";

await sendOnboardingReminders();

await pg.pool.end();
process.exit(0);
