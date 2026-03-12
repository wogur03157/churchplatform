import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { FormField } from "./entities/form-field.entity";

@Injectable()
export class FormFieldsService {
  constructor(@InjectRepository(FormField) private readonly repo: Repository<FormField>) {}

  findAll(activeOnly = false): Promise<FormField[]> {
    const where = activeOnly ? { status: "active" as const } : {};
    return this.repo.find({ where, order: { displayOrder: "ASC" } });
  }
  findOne(id: number): Promise<FormField | null> { return this.repo.findOne({ where: { id } }); }
  create(data: Partial<FormField>): Promise<FormField> { return this.repo.save(this.repo.create(data)); }
  async update(id: number, data: Partial<FormField>): Promise<void> { await this.repo.update(id, data); }
  async remove(id: number): Promise<void> { await this.repo.delete(id); }
}
