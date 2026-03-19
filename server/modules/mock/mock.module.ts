import { Module } from "@nestjs/common";
import { MockAuthController } from "./mock-auth.controller";
import {
  MockAnnouncementsController,
  MockImagesController,
  MockVideosController,
  MockFloatingMessagesController,
  MockLayoutSettingsController,
  MockAiAssistantController,
  MockPopupsController,
  MockChurchesController,
  MockVideoCategoriesController,
  MockPageGroupsController,
  MockFormFieldsController,
  MockFormSubmissionsController,
  MockSiteConfigController,
  MockAdminPermissionsController,
  MockInvitationsController,
  MockHeroSlidesController,
} from "./mock-data.controller";

@Module({
  controllers: [
    MockAuthController,
    MockAnnouncementsController,
    MockImagesController,
    MockVideosController,
    MockFloatingMessagesController,
    MockLayoutSettingsController,
    MockAiAssistantController,
    MockPopupsController,
    MockChurchesController,
    MockVideoCategoriesController,
    MockPageGroupsController,
    MockFormFieldsController,
    MockFormSubmissionsController,
    MockSiteConfigController,
    MockAdminPermissionsController,
    MockInvitationsController,
    MockHeroSlidesController,
  ],
})
export class MockModule {}
