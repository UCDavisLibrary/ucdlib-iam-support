import AppStateModel from "./AppStateModel";
import { PersonModel, OnboardingModel, AuthModel, RtModel, PermissionsModel, AlmaModel, AlmaUserModel } from "@ucd-lib/iam-support-lib";
AppStateModel.init(window.APP_CONFIG.appRoutes);

export {
  AppStateModel,
  AuthModel,
  OnboardingModel,
  PersonModel,
  RtModel,
  PermissionsModel,
  AlmaModel,
  AlmaUserModel
};