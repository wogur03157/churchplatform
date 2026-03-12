import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { FormSubmissionsService } from "./form-submissions.service";
import { OptionalAuthGuard } from "../auth/guards/optional-auth.guard";

@Controller("form-submissions")
@UseGuards(OptionalAuthGuard)
export class FormSubmissionsController {
  constructor(private readonly service: FormSubmissionsService) {}

  @Get() findAll() { return this.service.findAll(); }
  @Post() create(@Body() body: any) { return this.service.create(body); }
}
