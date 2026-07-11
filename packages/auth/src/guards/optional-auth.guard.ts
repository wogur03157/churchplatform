import { CanActivate, ExecutionContext, Inject, Injectable } from "@nestjs/common";
import { AuthService } from "../auth.service";

@Injectable()
export class OptionalAuthGuard implements CanActivate {
  constructor(
    @Inject(AuthService)
    private readonly authService: AuthService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    try {
      const user = await this.authService.authenticateRequest(request);
      request.user = user;
    } catch {
      request.user = null;
    }
    return true;
  }
}
