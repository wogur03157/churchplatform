import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { HomeNextGenItem } from "./entities/home-next-gen-item.entity";
import { HomeNextGenController } from "./home-next-gen.controller";
import { HomeNextGenService } from "./home-next-gen.service";

@Module({
  imports: [TypeOrmModule.forFeature([HomeNextGenItem])],
  controllers: [HomeNextGenController],
  providers: [HomeNextGenService],
  exports: [HomeNextGenService],
})
export class HomeNextGenModule {}
