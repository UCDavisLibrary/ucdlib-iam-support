import slack from './slack.js';
import { run as syncEmployees } from './iam-employee.js';

try {
  await syncEmployees();  
} catch (error) {
  console.error(error.message);
  console.error(error.error);
  slack.sendErrorNotification(error.message, error.error);
}

