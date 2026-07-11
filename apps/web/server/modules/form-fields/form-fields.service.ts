import { Injectable, OnModuleInit } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { FormField } from "./entities/form-field.entity";

type FieldSeed = Omit<Partial<FormField>, "id" | "churchId">;

const DEFAULT_FIELDS: Record<string, FieldSeed[]> = {
  "new-member": [],  // 기존 DB 데이터 그대로 사용, 시드 없음
  "consultation": [
    { formType: "consultation", label: "이름", fieldType: "text", placeholder: "이름을 입력해주세요", required: 1, displayOrder: 10, status: "active" },
    { formType: "consultation", label: "연락처", fieldType: "number", placeholder: "010-0000-0000", required: 1, displayOrder: 20, status: "active" },
    { formType: "consultation", label: "상담 분야", fieldType: "dropdown", placeholder: "분야를 선택해주세요", required: 1, options: ["신앙 상담", "가정 상담", "청소년 상담", "기타"], displayOrder: 30, status: "active" },
    { formType: "consultation", label: "문의 내용", fieldType: "textarea", placeholder: "상담 내용을 자유롭게 적어주세요", required: 1, displayOrder: 40, status: "active" },
  ],
  "registration": [
    { formType: "registration", label: "이름", fieldType: "text", placeholder: "이름을 입력해주세요", required: 1, displayOrder: 10, status: "active" },
    { formType: "registration", label: "성별", fieldType: "dropdown", placeholder: "선택", required: 1, options: ["남", "여"], displayOrder: 20, status: "active" },
    { formType: "registration", label: "생년월일", fieldType: "text", placeholder: "예) 1990-01-01", required: 1, displayOrder: 30, status: "active" },
    { formType: "registration", label: "연락처", fieldType: "number", placeholder: "010-0000-0000", required: 1, displayOrder: 40, status: "active" },
    { formType: "registration", label: "주소", fieldType: "text", placeholder: "주소를 입력해주세요", required: 0, displayOrder: 50, status: "active" },
    { formType: "registration", label: "이전 교회", fieldType: "text", placeholder: "이전에 다니시던 교회명", required: 0, displayOrder: 60, status: "active" },
    { formType: "registration", label: "세례 여부", fieldType: "dropdown", placeholder: "선택", required: 0, options: ["세례", "학습", "미세례"], displayOrder: 70, status: "active" },
  ],
};

@Injectable()
export class FormFieldsService implements OnModuleInit {
  constructor(@InjectRepository(FormField) private readonly repo: Repository<FormField>) {}

  async onModuleInit() {
    for (const [formType, seeds] of Object.entries(DEFAULT_FIELDS)) {
      if (seeds.length === 0) continue;
      const existing = await this.repo.count({ where: { formType } });
      if (existing === 0) {
        await this.repo.save(seeds.map((s) => this.repo.create(s)));
      }
    }
  }

  findAll(activeOnly = false, formType?: string): Promise<FormField[]> {
    const where: any = {};
    if (activeOnly) where.status = "active";
    if (formType) where.formType = formType;
    return this.repo.find({ where, order: { displayOrder: "ASC" } });
  }

  findOne(id: number): Promise<FormField | null> { return this.repo.findOne({ where: { id } }); }
  create(data: Partial<FormField>): Promise<FormField> { return this.repo.save(this.repo.create(data)); }
  async update(id: number, data: Partial<FormField>): Promise<void> { await this.repo.update(id, data); }
  async remove(id: number): Promise<void> { await this.repo.delete(id); }
}
