import { Module } from "@nestjs/common";
import { PlatformAuthModule } from "@platform/auth";
import { TenantOrmModule } from "@platform/tenancy";
import { AuditModule } from "../audit/audit.module";
import { PastoralNote, Visitation } from "./care.entities";
import { PastoralNotesController } from "./pastoral-notes.controller";
import { PastoralNotesService } from "./pastoral-notes.service";
import { VisitationsController } from "./visitations.controller";
import { VisitationsService } from "./visitations.service";

/** 목양(심방 + 목양 메모) 모듈 */
@Module({
  imports: [TenantOrmModule.forFeature([Visitation, PastoralNote]), PlatformAuthModule, AuditModule],
  controllers: [VisitationsController, PastoralNotesController],
  providers: [VisitationsService, PastoralNotesService],
})
export class CareModule {}
