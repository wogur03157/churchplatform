import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PlatformAuthModule } from "@platform/auth";
import { PLATFORM_ENTITIES } from "@platform/entities";
import { TenancyModule } from "@platform/tenancy";
import { HealthController } from "./modules/health/health.controller";
import { TENANT_ENTITIES } from "./tenant-entities";

const dbUrl = process.env.DATABASE_URL ?? "";
const isDbEnabled = process.env.SKIP_DB !== "true" && dbUrl.length > 0;

if (!isDbEnabled) {
  console.warn("[finance] DB disabled - health endpoint only");
}

const dbModules = isDbEnabled
  ? [
      TypeOrmModule.forRoot({
        type: "mysql",
        url: dbUrl,
        entities: [...PLATFORM_ENTITIES, ...TENANT_ENTITIES],
        synchronize: false,
        logging: process.env.NODE_ENV === "development",
      }),
      TenancyModule.forRoot({ tenantEntities: [...TENANT_ENTITIES] }),
      PlatformAuthModule,
    ]
  : [];

@Module({
  controllers: [HealthController],
  imports: dbModules,
})
export class AppModule {}
