import AppStateModel from "./AppStateModel.js";

import '#lib/cork/models/AlmaUserModel.js';
import '#lib/cork/models/AuthModel.js';
import '#lib/cork/models/EmployeeModel.js';
import '#lib/cork/models/GroupModel.js';
import '#lib/cork/models/LdapModel.js';
import '#lib/cork/models/OnboardingModel.js';
import '#lib/cork/models/OrgchartModel.js';
import '#lib/cork/models/PermissionsModel.js';
import '#lib/cork/models/PersonModel.js';
import '#lib/cork/models/RtModel.js';
import '#lib/cork/models/SeparationModel.js';

AppStateModel.init(window.APP_CONFIG.appRoutes);
