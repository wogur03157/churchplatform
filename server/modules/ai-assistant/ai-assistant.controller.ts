import {
  Body,
  Controller,
  HttpCode,
  HttpException,
  HttpStatus,
  Inject,
  Post,
  UseGuards,
} from "@nestjs/common";
import { AdminGuard } from "../auth/guards/admin.guard";
import { AiAssistantService } from "./ai-assistant.service";

@Controller("ai-assistant")
@UseGuards(AdminGuard)
export class AiAssistantController {
  constructor(
    @Inject(AiAssistantService)
    private readonly aiAssistantService: AiAssistantService
  ) {}

  @Post("improve-text")
  @HttpCode(200)
  async improveText(
    @Body() body: { text: string; action: "improve" | "summarize" | "translate_en" | "translate_ko" }
  ) {
    if (!body.text?.trim()) {
      throw new HttpException("text is required", HttpStatus.BAD_REQUEST);
    }

    let systemPrompt = "";
    switch (body.action) {
      case "improve":
        systemPrompt =
          "당신은 전문 작가입니다. 주어진 텍스트를 더 명확하고 우아하게 개선해주세요. 원래의 의미를 유지하면서 문장을 다듬고 가독성을 높여주세요.";
        break;
      case "summarize":
        systemPrompt =
          "주어진 텍스트를 핵심 내용만 간결하게 요약해주세요. 중요한 정보는 모두 포함하되 불필요한 부분은 제거해주세요.";
        break;
      case "translate_en":
        systemPrompt = "주어진 한국어 텍스트를 자연스러운 영어로 번역해주세요.";
        break;
      case "translate_ko":
        systemPrompt = "주어진 영어 텍스트를 자연스러운 한국어로 번역해주세요.";
        break;
      default:
        throw new HttpException("Invalid action", HttpStatus.BAD_REQUEST);
    }

    const result = await this.aiAssistantService.invokeLLM([
      { role: "system", content: systemPrompt },
      { role: "user", content: body.text },
    ]);

    return { result };
  }
}
