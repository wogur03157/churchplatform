import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { randomBytes } from "crypto";
import { Invitation } from "./entities/invitation.entity";
import { ChurchAdmin } from "../churches/entities/church-admin.entity";
import { User } from "../users/entities/user.entity";

@Injectable()
export class InvitationsService {
  constructor(
    @InjectRepository(Invitation)
    private readonly invitationRepo: Repository<Invitation>,
    @InjectRepository(ChurchAdmin)
    private readonly churchAdminRepo: Repository<ChurchAdmin>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async createInvite(churchId: number, email: string): Promise<{ token: string; inviteUrl: string }> {
    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await this.invitationRepo.save({ churchId, email, token, expiresAt, usedAt: null });
    const inviteUrl = `/admin/invite?token=${token}`;
    // TODO: 실제 이메일 발송 (현재는 콘솔 로그)
    console.log(`[Invitations] 초대 메일 → ${email} : ${inviteUrl}`);
    return { token, inviteUrl };
  }

  async findByToken(token: string) {
    const inv = await this.invitationRepo.findOne({ where: { token } });
    if (!inv) return null;
    return {
      valid: !inv.usedAt && new Date() < inv.expiresAt,
      email: inv.email,
      churchId: inv.churchId,
      expiresAt: inv.expiresAt,
      used: !!inv.usedAt,
    };
  }

  async accept(token: string, userId: number): Promise<{ success: boolean; message?: string }> {
    const inv = await this.invitationRepo.findOne({ where: { token } });
    if (!inv) return { success: false, message: "유효하지 않은 초대입니다" };
    if (inv.usedAt) return { success: false, message: "이미 사용된 초대입니다" };
    if (new Date() > inv.expiresAt) return { success: false, message: "만료된 초대입니다" };

    // 이미 해당 교회 관리자인지 확인
    const existing = await this.churchAdminRepo.findOne({
      where: { churchId: inv.churchId, userId },
    });
    if (!existing) {
      await this.churchAdminRepo.save({ churchId: inv.churchId, userId });
    }

    // 역할이 user이면 church_admin으로 업그레이드
    await this.userRepo.update(
      { id: userId, role: "user" as any },
      { role: "church_admin" as any },
    );

    await this.invitationRepo.update({ id: inv.id }, { usedAt: new Date() });
    return { success: true };
  }
}
