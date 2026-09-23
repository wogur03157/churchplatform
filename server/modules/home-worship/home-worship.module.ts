import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { HomeWorshipSchedule } from "./entities/home-worship-schedule.entity";
import { HomeWorshipController } from "./home-worship.controller";
import { HomeWorshipService } from "./home-worship.service";

@Module({
  imports: [TypeOrmModule.forFeature([HomeWorshipSchedule])],
  controllers: [HomeWorshipController],
  providers: [HomeWorshipService],
  exports: [HomeWorshipService],
})
export class HomeWorshipModule {}
