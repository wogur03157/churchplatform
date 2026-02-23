# 환경변수 초기 세팅 가이드

Forge/Manus 없이 독립 운영 환경으로 세팅하는 방법.

---

## 한눈에 보기

| 변수 | 상태 | 비고 |
|------|------|------|
| `DATABASE_URL` | 쉬움 | MySQL 연결 정보 입력 |
| `JWT_SECRET` | 쉬움 | 랜덤 문자열 생성 |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | ✅ 코드 완료 | Google Cloud Console에서 발급 |
| `OAUTH_CALLBACK_URL` | ✅ 코드 완료 | Google Console에도 등록 필요 |
| `OWNER_OPEN_ID` | 로그인 후 설정 | 첫 로그인 후 DB에서 확인 |
| `BUILT_IN_FORGE_API_URL/KEY` (스토리지) | 코드 교체 필요 | AWS S3로 교체 가능 |
| `BUILT_IN_FORGE_API_URL/KEY` (AI) | env만 교체 가능 | OpenAI 호환 API면 동작 |

---

## 1. DATABASE_URL — 쉬움 ✅

MySQL 서버가 있으면 아래 형식으로 입력:

```env
DATABASE_URL=mysql://유저:비밀번호@호스트:3306/DB이름
```

**로컬 MySQL 예시:**
```env
DATABASE_URL=mysql://root:password@localhost:3306/admin_dashboard
```

**DB 생성:**
```sql
CREATE DATABASE admin_dashboard CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

테이블 자동 생성: `server/app.module.ts`의 `synchronize: false` → `synchronize: true`로 바꾸면 서버 시작 시 자동 생성됨. 운영 환경에서는 반드시 `false`로 되돌릴 것.

---

## 2. JWT_SECRET — 쉬움 ✅

세션 쿠키 서명에 사용하는 비밀키. 랜덤하게 생성:

```bash
openssl rand -base64 32
```

출력된 값을 그대로 사용:
```env
JWT_SECRET=abc123xyz...생성된값
```

---

## 3. Google OAuth ✅ (코드 완료)

> Forge OAuth 의존성이 Google OAuth 2.0 표준 방식으로 교체 완료.
> 아래 절차대로 env 값만 채우면 됨.

### Google Cloud Console 설정 절차

1. [console.cloud.google.com](https://console.cloud.google.com) 접속
2. 프로젝트 생성 (또는 기존 프로젝트 선택)
3. **API 및 서비스 → 사용자 인증 정보 → + 사용자 인증 정보 만들기 → OAuth 2.0 클라이언트 ID**
4. 애플리케이션 유형: **웹 애플리케이션**
5. **승인된 리다이렉션 URI** 에 아래 추가:
   - 개발: `http://localhost:5173/api/oauth/callback`
   - 운영: `https://yourdomain.com/api/oauth/callback`
6. 생성 후 클라이언트 ID / 클라이언트 보안 비밀 복사

**OAuth 동의 화면도 설정 필요:**
- API 및 서비스 → OAuth 동의 화면
- 앱 이름, 사용자 지원 이메일 입력
- 범위: `email`, `profile`, `openid` 추가
- 테스트 사용자에 본인 Gmail 추가 (게시 전까지)

**env 설정:**
```env
GOOGLE_CLIENT_ID=123456789-abc...apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-...
OAUTH_CALLBACK_URL=http://localhost:5173/api/oauth/callback
```

### 로그인 플로우 (구현 완료)

```
[관리자 로그인 페이지]
    → "Google로 로그인" 클릭
    → GET /api/oauth/google
    → Google 계정 선택 화면
    → GET /api/oauth/callback?code=...
    → JWT 세션 쿠키 발급
    → / 로 리다이렉트
```

---

## 4. OWNER_OPEN_ID — 로그인 후 설정

이 값을 가진 사용자가 자동으로 `admin` 역할을 받음.
Google 로그인 시 `openId`는 Google 계정의 숫자 ID.

**설정 순서:**
1. `OWNER_OPEN_ID` 없이 일단 서버 시작
2. Google 계정으로 로그인 (DB에 사용자 row가 생성됨)
3. DB에서 본인 openId 확인:
   ```sql
   SELECT open_id FROM users WHERE email = 'your@gmail.com';
   ```
4. 확인된 값을 `.env`에 입력 후 서버 재시작:
   ```env
   OWNER_OPEN_ID=123456789012345678901
   ```
5. 재로그인하면 `role = 'admin'` 으로 자동 업데이트됨

> 또는 DB를 직접 수정해도 됨:
> ```sql
> UPDATE users SET role = 'admin' WHERE email = 'your@gmail.com';
> ```

---

## 5. 스토리지 — AWS S3로 교체 (코드 교체 필요)

현재 `server/modules/storage/storage.service.ts`가 Forge 스토리지 프록시를 사용 중.
`@aws-sdk/client-s3`가 이미 `package.json`에 설치되어 있으므로 `storage.service.ts`만 교체하면 됨.

**env 추가:**
```env
AWS_REGION=ap-northeast-2
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_S3_BUCKET=your-bucket-name
```

**`server/modules/storage/storage.service.ts` 교체 코드:**

```typescript
import { Injectable } from "@nestjs/common";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

@Injectable()
export class StorageService {
  private s3 = new S3Client({
    region: process.env.AWS_REGION ?? "ap-northeast-2",
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "",
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "",
    },
  });

  async put(
    relKey: string,
    data: Buffer | Uint8Array | string,
    contentType = "application/octet-stream"
  ): Promise<{ key: string; url: string }> {
    const bucket = process.env.AWS_S3_BUCKET ?? "";
    const key = relKey.replace(/^\/+/, "");

    await this.s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: data,
        ContentType: contentType,
      })
    );

    const url = `https://${bucket}.s3.${process.env.AWS_REGION ?? "ap-northeast-2"}.amazonaws.com/${key}`;
    return { key, url };
  }
}
```

**S3 버킷 퍼블릭 읽기 정책 (버킷 정책):**
```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": "*",
    "Action": "s3:GetObject",
    "Resource": "arn:aws:s3:::your-bucket-name/*"
  }]
}
```

---

## 6. AI 어시스턴트 — env 교체만으로 가능 ✅

현재 코드가 OpenAI 호환 API 형식(`/v1/chat/completions`)을 사용하므로 env만 교체하면 됨.

### OpenAI 사용 시

```env
BUILT_IN_FORGE_API_URL=https://api.openai.com
BUILT_IN_FORGE_API_KEY=sk-...
```

모델명도 변경 (`server/modules/ai-assistant/ai-assistant.service.ts` 내):
```typescript
model: "gpt-4o-mini",   // gemini-2.5-flash → 원하는 모델로 교체
```

### Anthropic Claude 사용 시

API 형식이 달라 `ai-assistant.service.ts`를 Anthropic SDK 방식으로 교체해야 함:

```bash
pnpm add @anthropic-ai/sdk
```

```env
ANTHROPIC_API_KEY=sk-ant-...
```

---

## 7. 알림 (Notifications) — 무시해도 됨 ✅

`notifications.service.ts`는 env가 없으면 자동으로 건너뜀 (graceful degradation).
별도 설정 불필요.

---

## 현재 `.env` 전체 예시

```env
# DB
DATABASE_URL=mysql://root:password@localhost:3306/admin_dashboard

# JWT
JWT_SECRET=여기에_openssl_rand_-base64_32_출력값

# Google OAuth
GOOGLE_CLIENT_ID=123456789-abc...apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-...
OAUTH_CALLBACK_URL=http://localhost:5173/api/oauth/callback

# 관리자 openId (로그인 후 DB에서 확인)
OWNER_OPEN_ID=123456789012345678901

# AI (OpenAI 사용 시)
BUILT_IN_FORGE_API_URL=https://api.openai.com
BUILT_IN_FORGE_API_KEY=sk-...

# 스토리지 (S3 사용 시)
AWS_REGION=ap-northeast-2
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_S3_BUCKET=your-bucket-name
```

---

## 세팅 순서 요약

```
1단계 (env만)         : DATABASE_URL, JWT_SECRET
2단계 (env만)         : GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, OAUTH_CALLBACK_URL
                        + Google Cloud Console에서 리다이렉션 URI 등록
3단계 (로그인 후)     : OWNER_OPEN_ID 확인 후 env 설정
4단계 (코드 교체)     : StorageService → AWS S3
5단계 (env/코드)      : AI → OpenAI 또는 Claude API
6단계 (선택)          : 알림 — 필요 없으면 스킵
```
