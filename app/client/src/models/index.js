import AppStateModel from "./AppStateModel";
import {
  PersonModel,
  OnboardingModel,
  AuthModel,
  EmployeeModel,
  OrgchartModel,
  SeparationModel,
  RtModel,
  PermissionsModel,
  AlmaUserModel } from "@ucd-lib/iam-support-lib";
AppStateModel.init(window.APP_CONFIG.appRoutes);

export {
  AppStateModel,
  AuthModel,
  OnboardingModel,
  SeparationModel,
  PersonModel,
  RtModel,
  PermissionsModel,
  OrgchartModel,
  AlmaUserModel,
  EmployeeModel,
};
