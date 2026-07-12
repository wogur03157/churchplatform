import type { Request, RequestHandler, Response } from "express";

/**
 * members/finance 서비스로의 경로 프록시.
 *
 * 운영에서는 nginx가 /api/members, /api/finance를 각 컨테이너로 직접 라우팅하므로
 * 이 프록시는 주로 로컬 개발(단일 오리진 :4000)과 nginx 없는 단일 서버 배포용이다.
 * body parser보다 먼저 등록해야 원본 바디를 그대로 전달할 수 있다.
 */
export function serviceProxy(target: string): RequestHandler {
  return async (req: Request, res: Response) => {
    try {
      const chunks: Buffer[] = [];
      for await (const chunk of req) chunks.push(chunk as Buffer);
      const body = Buffer.concat(chunks);

      const headers: Record<string, string> = {};
      for (const [key, value] of Object.entries(req.headers)) {
        if (typeof value !== "string") continue;
        if (["host", "connection", "content-length"].includes(key)) continue;
        headers[key] = value;
      }
      // 대상 앱의 테넌트 식별용 — 원래 요청의 Host 전달
      headers["x-forwarded-host"] = req.headers.host ?? "";

      const response = await fetch(`${target}${req.originalUrl}`, {
        method: req.method,
        headers,
        body: ["GET", "HEAD"].includes(req.method) ? undefined : body,
      });

      res.status(response.status);
      for (const name of ["content-type", "content-disposition"]) {
        const value = response.headers.get(name);
        if (value) res.setHeader(name, value);
      }
      res.send(Buffer.from(await response.arrayBuffer()));
    } catch (err) {
      res.status(502).json({ message: `업스트림 서비스에 연결할 수 없습니다: ${err}` });
    }
  };
}
