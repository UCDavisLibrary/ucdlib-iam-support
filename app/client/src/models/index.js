import AppStateModel from "./AppStateModel";
import { PersonModel, OnboardingModel, AuthModel, RtModel } from "@ucd-lib/iam-support-lib";
AppStateModel.init(window.APP_CONFIG.appRoutes);

export {
  AppStateModel,
  AuthModel,
  OnboardingModel,
  PersonModel,
  RtModel
};