import { Body, Controller, Get, Inject, Post, Query, UseGuards } from "@nestjs/common";
import { FormSubmissionsService } from "./form-submissions.service";
import { OptionalAuthGuard } from "@platform/auth";

@Controller("form-submissions")
@UseGuards(OptionalAuthGuard)
export class FormSubmissionsController {
  constructor(@Inject(FormSubmissionsService) private readonly service: FormSubmissionsService) {}

  @Get() findAll(@Query("formType") formType?: string) { return this.service.findAll(formType); }
  @Post() create(@Body() body: any) { return this.service.create(body); }
}
