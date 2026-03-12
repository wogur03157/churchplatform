import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { FormFieldsService } from "./form-fields.service";
import { OptionalAuthGuard } from "../auth/guards/optional-auth.guard";

@Controller("form-fields")
@UseGuards(OptionalAuthGuard)
export class FormFieldsController {
  constructor(private readonly service: FormFieldsService) {}

  @Get() findAll(@Query("activeOnly") activeOnly?: string) { return this.service.findAll(activeOnly === "true"); }
  @Get(":id") findOne(@Param("id", ParseIntPipe) id: number) { return this.service.findOne(id); }
  @Post() create(@Body() body: any) { return this.service.create(body); }
  @Patch(":id") update(@Param("id", ParseIntPipe) id: number, @Body() body: any) { return this.service.update(id, body); }
  @Delete(":id") remove(@Param("id", ParseIntPipe) id: number) { return this.service.remove(id); }
}
