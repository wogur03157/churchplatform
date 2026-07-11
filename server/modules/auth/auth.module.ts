import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Church } from "../churches/entities/church.entity";
import { ChurchAdmin } from "../churches/entities/church-admin.entity";
import { User } from "../users/entities/user.entity";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { OptionalAuthGuard } from "./guards/optional-auth.guard";
import { AdminGuard } from "./guards/admin.guard";

@Module({
  imports: [TypeOrmModule.forFeature([User, ChurchAdmin, Church])],
  controllers: [AuthController],
  providers: [AuthService, OptionalAuthGuard, AdminGuard],
  exports: [AuthService, OptionalAuthGuard, AdminGuard],
})
export class AuthModule {}
