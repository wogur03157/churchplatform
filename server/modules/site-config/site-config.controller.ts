import { Body, Controller, Get, Param, Patch, UseGuards } from "@nestjs/common";
import { SiteConfigService } from "./site-config.service";
import { OptionalAuthGuard } from "../auth/guards/optional-auth.guard";

@Controller("site-config")
@UseGuards(OptionalAuthGuard)
export class SiteConfigController {
  constructor(private readonly service: SiteConfigService) {}

  @Get() findAll() { return this.service.findAll(); }
  @Patch(":key") update(@Param("key") key: string, @Body("value") value: string) { return this.service.upsert(key, value); }
}
