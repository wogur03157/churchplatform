import { Module } from "@nestjs/common";
import { TenantOrmModule } from "@platform/tenancy";
import { AuthModule } from "../auth/auth.module";
import { FloatingMessage } from "./entities/floating-message.entity";
import { FloatingMessagesController } from "./floating-messages.controller";
import { FloatingMessagesService } from "./floating-messages.service";

@Module({
  imports: [TenantOrmModule.forFeature([FloatingMessage]), AuthModule],
  controllers: [FloatingMessagesController],
  providers: [FloatingMessagesService],
})
export class FloatingMessagesModule {}
