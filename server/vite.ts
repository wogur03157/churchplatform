import express, { type Express } from "express";
import fs from "fs";
import { type Server } from "http";
import { nanoid } from "nanoid";
import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";
import { createServer as createViteServer } from "vite";
import viteConfig from "../vite.config";

// crypto.hash was added in Node 20.12.0 / 21.7.0 — polyfill for Node 18
{
  const _require = createRequire(import.meta.url);
  const _crypto = _require("node:crypto") as typeof import("node:crypto") & { hash?: unknown };
  if (!_crypto.hash) {
    (_crypto as any).hash = (algorithm: string, data: any, outputEncoding: "hex" | "base64" | "base64url" = "hex") =>
      _crypto.createHash(algorithm).update(data).digest(outputEncoding);
  }
}

// import.meta.dirname is available in Node 20+; fallback for Node 18
const __moduleDir =
  import.meta.dirname ?? fileURLToPath(new URL(".", import.meta.url));

export async function setupVite(app: Express, server: Server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    // Skip API routes
    if (url.startsWith("/api/")) {
      return next();
    }

    try {
      const clientTemplate = path.resolve(
        __moduleDir,
        "..",
        "client",
        "index.html"
      );

      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  const distPath =
    process.env.NODE_ENV === "development"
      ? path.resolve(__moduleDir, "..", "dist", "public")
      : path.resolve(__moduleDir, "..", "public");

  if (!fs.existsSync(distPath)) {
    console.error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }

  app.use(express.static(distPath));

  app.use("*", (_req, res, next) => {
    if (_req.originalUrl.startsWith("/api/")) return next();
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
