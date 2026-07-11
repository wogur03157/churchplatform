import "./env";
import "reflect-metadata";
import { webcrypto } from "crypto";
if (!globalThis.crypto) (globalThis as any).crypto = webcrypto;
import { NestFactory } from "@nestjs/core";
import type { NestExpressApplication } from "@nestjs/platform-express";
import cookieParser from "cookie-parser";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.use(cookieParser());

  // nginx가 /api/finance/* 를 이 앱으로 라우팅 — prefix를 그대로 사용
  app.setGlobalPrefix("api/finance");

  const port = parseInt(process.env.PORT || "4200");
  await app.listen(port, () => {
    console.log(`[finance] Server running on http://localhost:${port}/`);
  });
}

bootstrap().catch(console.error);
