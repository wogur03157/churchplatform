import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Church } from "./entities/church.entity";
import { ChurchAdmin } from "./entities/church-admin.entity";
import { ChurchFeature } from "./entities/church-feature.entity";
import { ChurchesController } from "./churches.controller";
import { ChurchesService } from "./churches.service";
import { User } from "../users/entities/user.entity";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [TypeOrmModule.forFeature([Church, ChurchAdmin, ChurchFeature, User]), AuthModule],
  controllers: [ChurchesController],
  providers: [ChurchesService],
  exports: [ChurchesService],
})
export class ChurchesModule {}
