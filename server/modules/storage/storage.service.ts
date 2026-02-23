import { Injectable } from "@nestjs/common";

type StorageConfig = { baseUrl: string; apiKey: string };

@Injectable()
export class StorageService {
  private getConfig(): StorageConfig {
    const baseUrl = process.env.BUILT_IN_FORGE_API_URL ?? "";
    const apiKey = process.env.BUILT_IN_FORGE_API_KEY ?? "";

    if (!baseUrl || !apiKey) {
      throw new Error(
        "Storage proxy credentials missing: set BUILT_IN_FORGE_API_URL and BUILT_IN_FORGE_API_KEY"
      );
    }

    return { baseUrl: baseUrl.replace(/\/+$/, ""), apiKey };
  }

  private ensureTrailingSlash(value: string): string {
    return value.endsWith("/") ? value : `${value}/`;
  }

  private normalizeKey(relKey: string): string {
    return relKey.replace(/^\/+/, "");
  }

  private buildAuthHeaders(apiKey: string): HeadersInit {
    return { Authorization: `Bearer ${apiKey}` };
  }

  private toFormData(
    data: Buffer | Uint8Array | string,
    contentType: string,
    fileName: string
  ): FormData {
    const blob =
      typeof data === "string"
        ? new Blob([data], { type: contentType })
        : new Blob([data as unknown as BlobPart], { type: contentType });
    const form = new FormData();
    form.append("file", blob, fileName || "file");
    return form;
  }

  async put(
    relKey: string,
    data: Buffer | Uint8Array | string,
    contentType = "application/octet-stream"
  ): Promise<{ key: string; url: string }> {
    const { baseUrl, apiKey } = this.getConfig();
    const key = this.normalizeKey(relKey);

    const uploadUrl = new URL(
      "v1/storage/upload",
      this.ensureTrailingSlash(baseUrl)
    );
    uploadUrl.searchParams.set("path", key);

    const formData = this.toFormData(
      data,
      contentType,
      key.split("/").pop() ?? key
    );

    const response = await fetch(uploadUrl.toString(), {
      method: "POST",
      headers: this.buildAuthHeaders(apiKey),
      body: formData,
    });

    if (!response.ok) {
      const message = await response.text().catch(() => response.statusText);
      throw new Error(
        `Storage upload failed (${response.status} ${response.statusText}): ${message}`
      );
    }

    const url = (await response.json()).url;
    return { key, url };
  }
}
