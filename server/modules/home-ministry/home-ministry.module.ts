import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { HomeMinistryItem } from "./entities/home-ministry-item.entity";
import { HomeMinistryController } from "./home-ministry.controller";
import { HomeMinistryService } from "./home-ministry.service";

@Module({
  imports: [TypeOrmModule.forFeature([HomeMinistryItem])],
  controllers: [HomeMinistryController],
  providers: [HomeMinistryService],
  exports: [HomeMinistryService],
})
export class HomeMinistryModule {}
