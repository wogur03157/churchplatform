import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAdminContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "admin-test-user",
    email: "admin@example.com",
    name: "Admin User",
    loginMethod: "manus",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return { ctx };
}

describe("announcements router", () => {
  it("should list announcements", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.announcements.list();
    
    expect(Array.isArray(result)).toBe(true);
  });

  // Note: Create test requires actual user in database due to foreign key constraints

  it("should filter published announcements", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const allAnnouncements = await caller.announcements.list({ publishedOnly: false });
    const publishedAnnouncements = await caller.announcements.list({ publishedOnly: true });
    
    expect(allAnnouncements.length).toBeGreaterThanOrEqual(publishedAnnouncements.length);
  });
});

describe("layout settings router", () => {
  it("should list layout settings", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.layoutSettings.list();
    
    expect(Array.isArray(result)).toBe(true);
  });
});
