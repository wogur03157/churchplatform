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
  ],
})
export class MockModule {}
