import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "../auth/auth.module";
import { HeroSlidesController } from "./hero-slides.controller";
import { HeroSlidesService } from "./hero-slides.service";
import { HeroSlide } from "./entities/hero-slide.entity";

@Module({
  imports: [TypeOrmModule.forFeature([HeroSlide]), AuthModule],
  controllers: [HeroSlidesController],
  providers: [HeroSlidesService],
})
export class HeroSlidesModule {}
