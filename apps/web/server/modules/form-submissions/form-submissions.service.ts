import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { FormSubmission } from "./entities/form-submission.entity";

@Injectable()
export class FormSubmissionsService {
  constructor(@InjectRepository(FormSubmission) private readonly repo: Repository<FormSubmission>) {}

  async findAll(formType?: string): Promise<FormSubmission[]> {
    const all = await this.repo.find({ order: { submittedAt: "DESC" } });
    if (!formType) return all;
    // new-member는 formType이 null인 기존 데이터도 포함
    if (formType === "new-member") {
      return all.filter((s) => !s.formType || s.formType === "new-member");
    }
    return all.filter((s) => s.formType === formType);
  }
  create(data: Partial<FormSubmission>): Promise<FormSubmission> { return this.repo.save(this.repo.create(data)); }
}
