import { Module } from "@nestjs/common";
import { TenantOrmModule } from "../tenancy/tenant-orm.module";
import { FormField } from "./entities/form-field.entity";
import { FormFieldsController } from "./form-fields.controller";
import { FormFieldsService } from "./form-fields.service";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [TenantOrmModule.forFeature([FormField]), AuthModule],
  controllers: [FormFieldsController],
  providers: [FormFieldsService],
  exports: [FormFieldsService],
})
export class FormFieldsModule {}
