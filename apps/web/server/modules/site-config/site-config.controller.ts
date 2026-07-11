import { Body, Controller, Get, Inject, Param, Patch, UseGuards } from "@nestjs/common";
import { SiteConfigService } from "./site-config.service";
import { OptionalAuthGuard } from "@platform/auth";

@Controller("site-config")
@UseGuards(OptionalAuthGuard)
export class SiteConfigController {
  constructor(@Inject(SiteConfigService) private readonly service: SiteConfigService) {}

  @Get() findAll() { return this.service.findAll(); }
  @Patch(":key") update(@Param("key") key: string, @Body("value") value: string) { return this.service.upsert(key, value); } // SiteConfig 반환
}
