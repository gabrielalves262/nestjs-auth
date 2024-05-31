import { Controller, Get, Request } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthRequest } from './modules/auth/models/AuthRequest';
import { UserService } from './modules/user/user.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly usersService: UserService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('me')
  getMe(@Request() req: AuthRequest) {
    return this.usersService.findById(req.user.id);
  }
}
