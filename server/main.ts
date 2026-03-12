import "reflect-metadata";
import "dotenv/config";
import { webcrypto } from "crypto";
if (!globalThis.crypto) (globalThis as any).crypto = webcrypto;
import { NestFactory } from "@nestjs/core";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { AppModule } from "./app.module";
import cookieParser from "cookie-parser";
import net from "net";
import { join } from "path";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise((resolve) => {
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
    const { serveStatic } = await import("./vite");
    const httpAdapter = app.getHttpAdapter();
    const expressApp = httpAdapter.getInstance();
    serveStatic(expressApp);

    const preferredPort = parseInt(process.env.PORT || "4000");
    const port = await findAvailablePort(preferredPort);

    await app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}/`);
    });
  }
}

bootstrap().catch(console.error);
