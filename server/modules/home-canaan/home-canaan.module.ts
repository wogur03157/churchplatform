import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { HomeCanaan } from "./entities/home-canaan.entity";
import { HomeCanaanController } from "./home-canaan.controller";
import { HomeCanaanService } from "./home-canaan.service";

@Module({
  imports: [TypeOrmModule.forFeature([HomeCanaan])],
  controllers: [HomeCanaanController],
  providers: [HomeCanaanService],
  exports: [HomeCanaanService],
})
export class HomeCanaanModule {}
