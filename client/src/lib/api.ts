class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// 로컬 개발에서 특정 교회로 접속할 때 사용 (운영에서는 도메인으로 교회를 식별)
const CHURCH_SLUG = import.meta.env.VITE_CHURCH_SLUG as string | undefined;

async function request<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`/api${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(CHURCH_SLUG ? { "x-church-slug": CHURCH_SLUG } : {}),
      ...(options?.headers ?? {}),
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: res.statusText }));
    throw new ApiError(res.status, body?.message ?? res.statusText);
  }

  // 204 No Content 또는 빈 바디
  if (res.status === 204) return undefined as T;

  const text = await res.text();
  return text ? JSON.parse(text) : (undefined as T);
}

export const api = {
  get: <T>(path: string) => request<T>(path, { method: "GET" }),
  post: <T>(path: string, data?: unknown) =>
    request<T>(path, {
      method: "POST",
      body: data !== undefined ? JSON.stringify(data) : undefined,
    }),
  patch: <T>(path: string, data?: unknown) =>
    request<T>(path, {
      method: "PATCH",
      body: data !== undefined ? JSON.stringify(data) : undefined,
    }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};

export { ApiError };
