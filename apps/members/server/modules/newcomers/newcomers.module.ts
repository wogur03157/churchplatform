import { Module } from "@nestjs/common";
import { PlatformAuthModule } from "@platform/auth";
import { TenantOrmModule } from "@platform/tenancy";
import { Member } from "../members/member.entity";
import { NewcomerProgress, NewcomerStage } from "./newcomer.entity";
import { NewcomersController } from "./newcomers.controller";
import { NewcomersService } from "./newcomers.service";

@Module({
  imports: [
    TenantOrmModule.forFeature([NewcomerStage, NewcomerProgress, Member]),
    PlatformAuthModule,
  ],
  controllers: [NewcomersController],
  providers: [NewcomersService],
})
export class NewcomersModule {}
