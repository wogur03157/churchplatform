import { Injectable } from "@nestjs/common";

export type Role = "system" | "user" | "assistant";

export type Message = {
  role: Role;
  content: string;
};

@Injectable()
export class AiAssistantService {
  private resolveApiUrl(): string {
    const forgeApiUrl = process.env.BUILT_IN_FORGE_API_URL;
    return forgeApiUrl && forgeApiUrl.trim().length > 0
      ? `${forgeApiUrl.replace(/\/$/, "")}/v1/chat/completions`
      : "https://forge.manus.im/v1/chat/completions";
  }

  async invokeLLM(messages: Message[]): Promise<string> {
    const forgeApiKey = process.env.BUILT_IN_FORGE_API_KEY;
    if (!forgeApiKey) {
      throw new Error("BUILT_IN_FORGE_API_KEY is not configured");
    }

    const payload = {
      model: "gemini-2.5-flash",
      messages,
      max_tokens: 32768,
      thinking: { budget_tokens: 128 },
    };

    const response = await fetch(this.resolveApiUrl(), {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${forgeApiKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `LLM invoke failed: ${response.status} ${response.statusText} – ${errorText}`
      );
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || "";
  }
}
