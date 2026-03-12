import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { FormSubmission } from "./entities/form-submission.entity";

@Injectable()
export class FormSubmissionsService {
  constructor(@InjectRepository(FormSubmission) private readonly repo: Repository<FormSubmission>) {}

  findAll(): Promise<FormSubmission[]> { return this.repo.find({ order: { submittedAt: "DESC" } }); }
  create(data: Partial<FormSubmission>): Promise<FormSubmission> { return this.repo.save(this.repo.create(data)); }
}
