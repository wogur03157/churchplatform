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
  MockContentPagesController,
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
    MockContentPagesController,
  ],
})
export class MockModule {}
