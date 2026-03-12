# MySQL 설치 및 DB 세팅 가이드

> macOS 기준. Docker 방식도 함께 제공.

---

## 방법 1 — Homebrew (로컬 설치)

### 1. Homebrew 설치 확인
```bash
brew --version
# 없으면: /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### 2. MySQL 8.0 설치
```bash
brew install mysql
```

### 3. MySQL 서비스 시작
```bash
brew services start mysql
# 재시작: brew services restart mysql
# 중지:   brew services stop mysql
```

### 4. 초기 보안 설정
```bash
mysql_secure_installation
```
물음에 답변:
- Validate password component → `N` (개발 환경)
- New root password → 원하는 비밀번호 입력
- Remove anonymous users → `Y`
- Disallow root login remotely → `Y`
- Remove test database → `Y`
- Reload privilege tables → `Y`

### 5. root 접속 확인
```bash
mysql -u root -p
# 비밀번호 입력 후 mysql> 프롬프트 나오면 성공
```

---

## 방법 2 — Docker (권장, 환경 오염 없음)

### 1. Docker Desktop 설치
https://www.docker.com/products/docker-desktop

### 2. MySQL 컨테이너 실행
```bash
docker run -d \
  --name churchplatform-mysql \
  -e MYSQL_ROOT_PASSWORD=rootpassword \
  -e MYSQL_DATABASE=churchplatform \
  -e MYSQL_USER=churchuser \
  -e MYSQL_PASSWORD=churchpassword \
  -p 3306:3306 \
  mysql:8.0
```

### 3. 접속 확인
```bash
docker exec -it churchplatform-mysql mysql -u churchuser -pchurchpassword churchplatform
```

> Docker 사용 시 아래 "DB 및 유저 생성" 단계는 건너뛰어도 됨 (컨테이너 시작 시 자동 생성됨)

---

## DB 및 유저 생성 (Homebrew 방식)

```sql
-- root로 접속 후 실행
mysql -u root -p

CREATE DATABASE churchplatform
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

CREATE USER 'churchuser'@'localhost' IDENTIFIED BY 'churchpassword';

GRANT ALL PRIVILEGES ON churchplatform.* TO 'churchuser'@'localhost';

FLUSH PRIVILEGES;

EXIT;
```

---

## 스키마 적용

```bash
mysql -u churchuser -pchurchpassword churchplatform < z_docs/db-schema.sql
```

적용 확인:
```bash
mysql -u churchuser -pchurchpassword churchplatform -e "SHOW TABLES;"
```

정상이면 아래 테이블 목록이 출력됨:
```
admin_permissions
announcements
church_admins
church_features
churches
floating_messages
form_fields
form_submissions
images
layout_settings
page_groups
popups
site_config
users
video_categories
videos
```

---

## .env 설정

프로젝트 루트 `.env` 파일 수정:

```dotenv
# Homebrew 방식
DATABASE_URL=mysql://churchuser:churchpassword@localhost:3306/churchplatform

# Docker 방식 (포트 동일)
DATABASE_URL=mysql://churchuser:churchpassword@127.0.0.1:3306/churchplatform
```

JWT_SECRET 생성:
```bash
openssl rand -base64 32
# 출력값을 JWT_SECRET= 에 붙여넣기
```

---

## 서버 실행 (Mock 모드 OFF)

```bash
# 루트에서 (클라이언트 + 서버 같이)
pnpm dev
```

> `SKIP_DB=true` 또는 `DATABASE_URL`이 플레이스홀더(`user:password@host`)이면 자동으로 Mock 모드로 동작하므로, 반드시 실제 URL로 교체해야 실 DB에 연결됨.

---

## 첫 로그인 후 슈퍼어드민 지정

Google OAuth로 로그인 후 DB에서 해당 계정의 `openId` 확인:

```sql
SELECT id, openId, email, role FROM users WHERE email = 'your@gmail.com';
```

`.env`의 `OWNER_OPEN_ID`에 해당 `openId` 값 입력 후 서버 재시작.
서버 시작 시 해당 유저의 `role`이 자동으로 `super_admin`으로 업데이트됨.

---

## 자주 쓰는 명령어

```bash
# Homebrew MySQL 상태 확인
brew services list | grep mysql

# 컨테이너 재시작 (Docker)
docker restart churchplatform-mysql

# 테이블 초기화 (주의: 전체 삭제)
mysql -u churchuser -pchurchpassword -e "DROP DATABASE churchplatform; CREATE DATABASE churchplatform CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u churchuser -pchurchpassword churchplatform < z_docs/db-schema.sql
```
