import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { AiAssistantController } from "./ai-assistant.controller";
import { AiAssistantService } from "./ai-assistant.service";

@Module({
  imports: [AuthModule],
  controllers: [AiAssistantController],
  providers: [AiAssistantService],
})
export class AiAssistantModule {}
