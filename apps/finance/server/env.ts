// 반드시 main.ts의 첫 번째 import여야 함 — ESM 임포트 호이스팅 때문에
// app.module보다 먼저 환경변수를 로드하려면 side-effect 모듈로 분리해야 한다.
import { config as loadEnv } from "dotenv";
import { resolve } from "path";

// 앱 로컬 .env 우선, 없으면 워크스페이스 루트 .env (dotenv는 기존 값을 덮어쓰지 않음)
loadEnv({ path: resolve(process.cwd(), ".env") });
loadEnv({ path: resolve(process.cwd(), "../../.env") });
