import { Module } from "@nestjs/common";
import { TenantOrmModule } from "@platform/tenancy";
import { FormSubmission } from "./entities/form-submission.entity";
import { FormSubmissionsController } from "./form-submissions.controller";
import { FormSubmissionsService } from "./form-submissions.service";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [TenantOrmModule.forFeature([FormSubmission]), AuthModule],
  controllers: [FormSubmissionsController],
  providers: [FormSubmissionsService],
  exports: [FormSubmissionsService],
})
export class FormSubmissionsModule {}
