import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from "@nestjs/common";
import { UNAUTHED_ERR_MSG, NOT_ADMIN_ERR_MSG } from "@shared/const";
import { AuthService } from "../auth.service";

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(
    @Inject(AuthService)
    private readonly authService: AuthService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const user = await this.authService.authenticateRequest(request);
    if (!user) {
      throw new UnauthorizedException(UNAUTHED_ERR_MSG);
    }

    if (user.role !== "admin") {
      throw new ForbiddenException(NOT_ADMIN_ERR_MSG);
    }

    request.user = user;
    return true;
  }
}
