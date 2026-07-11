import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";
import type { ValueTransformer } from "typeorm";

/**
 * 개인정보(연락처·주소) 컬럼 암호화 — AES-256-GCM.
 *
 * - 키: MEMBER_DATA_KEY 환경변수 (임의 문자열 → SHA-256으로 32바이트 파생)
 * - 저장 형식: enc:v1:<iv b64>:<authTag b64>:<ciphertext b64>
 * - 키가 없으면 평문 저장 + 부팅 시 경고 (개발 편의) — 운영에서는 반드시 설정
 * - 접두사 없는 값은 평문 레거시로 간주해 그대로 반환 (점진 마이그레이션)
 */
const PREFIX = "enc:v1:";

function deriveKey(): Buffer | null {
  const raw = process.env.MEMBER_DATA_KEY;
  if (!raw) return null;
  return createHash("sha256").update(raw).digest();
}

let warned = false;
function warnOnce(): void {
  if (warned) return;
  warned = true;
  console.warn(
    "[members] MEMBER_DATA_KEY가 없어 개인정보 컬럼이 평문으로 저장됩니다 — 운영 환경에서는 반드시 설정하세요"
  );
}

export function encryptValue(plain: string): string {
  const key = deriveKey();
  if (!key) {
    warnOnce();
    return plain;
  }
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${PREFIX}${iv.toString("base64")}:${tag.toString("base64")}:${encrypted.toString("base64")}`;
}

export function decryptValue(stored: string): string {
  if (!stored.startsWith(PREFIX)) return stored; // 평문 레거시
  const key = deriveKey();
  if (!key) return "[암호화됨 — MEMBER_DATA_KEY 필요]";
  const [ivB64, tagB64, dataB64] = stored.slice(PREFIX.length).split(":");
  const decipher = createDecipheriv("aes-256-gcm", key, Buffer.from(ivB64, "base64"));
  decipher.setAuthTag(Buffer.from(tagB64, "base64"));
  return Buffer.concat([
    decipher.update(Buffer.from(dataB64, "base64")),
    decipher.final(),
  ]).toString("utf8");
}

/** TypeORM 컬럼 transformer — @Column({ transformer: encryptedColumn }) */
export const encryptedColumn: ValueTransformer = {
  to: (value: string | null | undefined) =>
    value === null || value === undefined || value === "" ? (value ?? null) : encryptValue(value),
  from: (value: string | null) => (value === null ? null : decryptValue(value)),
};
