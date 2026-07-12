import "./env";
import "reflect-metadata";
import { webcrypto } from "crypto";
if (!globalThis.crypto) (globalThis as any).crypto = webcrypto;
import { NestFactory } from "@nestjs/core";
import type { NestExpressApplication } from "@nestjs/platform-express";
import cookieParser from "cookie-parser";
import { AppModule } from "./app.module";

async function bootstrap() {
  // 영수증 base64 업로드를 위해 body 한도 상향 (기본 100kb)
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bodyParser: false,
  });
  const express = (await import("express")).default;
  app.use(express.json({ limit: "20mb" }));
  app.use(express.urlencoded({ limit: "20mb", extended: true }));
  app.use(cookieParser());

  // nginx가 /api/finance/* 를 이 앱으로 라우팅 — prefix를 그대로 사용
  app.setGlobalPrefix("api/finance");

  const port = parseInt(process.env.PORT || "4200");
  await app.listen(port, () => {
    console.log(`[finance] Server running on http://localhost:${port}/`);
  });
}

bootstrap().catch(console.error);
