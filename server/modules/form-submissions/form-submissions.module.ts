import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { FormSubmission } from "./entities/form-submission.entity";
import { FormSubmissionsController } from "./form-submissions.controller";
import { FormSubmissionsService } from "./form-submissions.service";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [TypeOrmModule.forFeature([FormSubmission]), AuthModule],
  controllers: [FormSubmissionsController],
  providers: [FormSubmissionsService],
  exports: [FormSubmissionsService],
})
export class FormSubmissionsModule {}
