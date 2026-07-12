import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AdminPermission, Church } from "@platform/entities";
import { ChurchAdmin } from "@platform/entities";
import { ChurchFeature } from "@platform/entities";
import { ChurchesController } from "./churches.controller";
import { ChurchesService } from "./churches.service";
import { User } from "@platform/entities";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [TypeOrmModule.forFeature([Church, ChurchAdmin, ChurchFeature, User, AdminPermission]), AuthModule],
  controllers: [ChurchesController],
  providers: [ChurchesService],
  exports: [ChurchesService],
})
export class ChurchesModule {}
