import type { DataSource } from "typeorm";
import { Account, Department, FiscalYear } from "./modules/settings/settings.entities";

/** 새 테넌트 DB 기본 데이터 (각 테이블이 비어 있을 때만) */
export async function seedTenantDefaults(dataSource: DataSource): Promise<void> {
  const fiscalRepo = dataSource.getRepository(FiscalYear);
  if ((await fiscalRepo.count()) === 0) {
    await fiscalRepo.save(
      fiscalRepo.create({ year: new Date().getFullYear(), status: "open" })
    );
  }

  const departmentRepo = dataSource.getRepository(Department);
  let departments = await departmentRepo.find();
  if (departments.length === 0) {
    const names = ["예배부", "교육부", "선교부", "봉사부", "관리부"];
    departments = await departmentRepo.save(
      names.map((name, index) =>
        departmentRepo.create({ name, displayOrder: index + 1, isBuiltIn: 1 })
      )
    );
  }
  const deptId = (name: string) => departments.find((d) => d.name === name)?.id ?? null;

  const accountRepo = dataSource.getRepository(Account);
  if ((await accountRepo.count()) === 0) {
    const income = ["십일조", "주정헌금", "감사헌금", "선교헌금", "건축헌금", "절기헌금", "기타수입"];
    const expense: Array<[string, string | null]> = [
      ["예배비", "예배부"],
      ["교육비", "교육부"],
      ["선교비", "선교부"],
      ["구제비", "봉사부"],
      ["운영비", "관리부"],
      ["사례비", "관리부"],
    ];
    await accountRepo.save([
      ...income.map((name, index) =>
        accountRepo.create({ kind: "income" as const, name, displayOrder: index + 1, isBuiltIn: 1 })
      ),
      ...expense.map(([name, dept], index) =>
        accountRepo.create({
          kind: "expense" as const,
          name,
          departmentId: dept ? deptId(dept) : null,
          displayOrder: index + 1,
          isBuiltIn: 1,
        })
      ),
    ]);
  }
}
