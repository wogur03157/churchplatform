import { Controller, Get, Inject } from "@nestjs/common";
import { PublicHomeService } from "./public-home.service";

@Controller("public")
export class PublicHomeController {
  constructor(
    @Inject(PublicHomeService)
    private readonly service: PublicHomeService,
  ) {}

  @Get("home-data")
  getHomeData() {
    return this.service.getHomeData();
  }
}
