import { Injectable } from "@nestjs/common";

export type NotificationPayload = {
  title: string;
  content: string;
};

@Injectable()
export class NotificationsService {
  private buildEndpointUrl(baseUrl: string): string {
    const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
    return new URL(
      "webdevtoken.v1.WebDevService/SendNotification",
      normalizedBase
    ).toString();
  }

  async notifyOwner(payload: NotificationPayload): Promise<boolean> {
    const { title, content } = payload;

    const forgeApiUrl = process.env.BUILT_IN_FORGE_API_URL;
    const forgeApiKey = process.env.BUILT_IN_FORGE_API_KEY;

    if (!forgeApiUrl || !forgeApiKey) {
      console.warn("[Notification] Service not configured");
      return false;
    }

    const endpoint = this.buildEndpointUrl(forgeApiUrl);

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          accept: "application/json",
          authorization: `Bearer ${forgeApiKey}`,
          "content-type": "application/json",
          "connect-protocol-version": "1",
        },
        body: JSON.stringify({ title, content }),
      });

      if (!response.ok) {
        console.warn(`[Notification] Failed (${response.status})`);
        return false;
      }

      return true;
    } catch (error) {
      console.warn("[Notification] Error:", error);
      return false;
    }
  }
}
