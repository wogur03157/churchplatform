import "reflect-metadata";
import "dotenv/config";
import { webcrypto } from "crypto";
if (!globalThis.crypto) (globalThis as any).crypto = webcrypto;
import { NestFactory } from "@nestjs/core";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { AppModule } from "./app.module";
import cookieParser from "cookie-parser";
import net from "net";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
// 빌드(cjs)에서는 __filename이 있고, 개발(ESM)에서는 import.meta.url을 사용
const __dirname = typeof __filename !== "undefined" ? dirname(__filename) : dirname(fileURLToPath(import.meta.url));

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort = 4000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) return port;
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bodyParser: false,
  });

  // Body parser with large limit for file uploads
  const express = (await import("express")).default;
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  app.use(cookieParser());

  // 읽기 전용 모드 (공개 데모 배포용): 공개 페이지가 쓰는 GET만 허용, 나머지 쓰기·관리자 API 차단
  if (process.env.PUBLIC_READONLY === "true") {
    const READ_ALLOWED = [
      "/auth/me",
      "/health",
      "/site-config",
      "/videos",
      "/video-categories",
      "/page-groups",
      "/content-pages",
      "/announcements",
      "/images",
      "/popups",
      "/floating-messages",
      "/form-fields",
      "/hero-slides",
      "/layout-settings",
      "/public",
      "/home-canaan",
      "/home-ministry",
      "/home-next-gen",
      "/home-worship",
    ];
    const WRITE_ALLOWED = ["/form-submissions"]; // 공개 신청폼 (메모리 저장)

    app.use((req: any, res: any, next: any) => {
      res.setHeader("X-Robots-Tag", "noindex, nofollow");
      if (!req.path.startsWith("/api/")) return next();
      const path = req.path.slice("/api".length);

      if (req.method === "POST" && WRITE_ALLOWED.includes(path)) return next();
      if (req.method !== "GET" && req.method !== "HEAD") {
        return res.status(405).json({ message: "읽기 전용 모드에서는 사용할 수 없습니다." });
      }
      // 공개 목록은 항상 발행된 항목만 보여 줍니다 (임시저장 노출 방지)
      const PUBLISHED_ONLY = ["/announcements", "/images", "/videos"];
      if (req.method === "GET" && PUBLISHED_ONLY.includes(path)) {
        req.query = { ...req.query, publishedOnly: "true" };
      }

      const allowed = READ_ALLOWED.some((p) => path === p || path.startsWith(p + "/"));
      if (!allowed) {
        return res.status(404).json({ message: "Not Found" });
      }
      next();
    });
  }

  // Serve local uploads (fallback before S3 integration)
  app.use("/uploads", express.static(join(process.cwd(), "uploads")));

  // Set global prefix for all routes
  app.setGlobalPrefix("api");

  // Development: Vite dev server integration
  if (process.env.NODE_ENV === "development") {
    const { createServer } = await import("http");
    const httpAdapter = app.getHttpAdapter();
    const expressApp = httpAdapter.getInstance();
    const httpServer = createServer(expressApp);

    const { setupVite } = await import("./vite");
    await setupVite(expressApp, httpServer);

    const preferredPort = parseInt(process.env.PORT || "4000");
    const port = await findAvailablePort(preferredPort);
    if (port !== preferredPort) {
      console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
    }

    await app.init();
    httpServer.listen(port, () => {
      console.log(`Server running on http://localhost:${port}/`);
    });
  } else {
    // Production: serve static files
    // const { serveStatic } = await import("./vite");
    const httpAdapter = app.getHttpAdapter();
    const expressApp = httpAdapter.getInstance();
    // serveStatic(expressApp);

    const publicPath = join(__dirname, "public");

    console.log("publicPath:", publicPath); // 디버깅

    expressApp.use(express.static(publicPath));

    expressApp.use("*", (req: any, res: any, next: any) => {
      if (req.originalUrl.startsWith("/api/")) return next();
      res.sendFile(join(publicPath, "index.html"));
    });

    const preferredPort = parseInt(process.env.PORT || "4000");
    const port = await findAvailablePort(preferredPort);

    await app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}/`);
    });
  }
}

bootstrap().catch(console.error);
