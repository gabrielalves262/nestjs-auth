import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';

import { AuthService } from './auth.service';
import { AuthRequest } from './models/AuthRequest';
import { IsPublic } from './decorators/is-public.decorator';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { ConfirmEmailDto } from './dto/confirm-email.dto';
import { ResetPassDto } from './dto/reset-pass.dto';
import { ChangePasswordDto } from './dto/change-pass.dto copy';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @IsPublic()
  @UseGuards(LocalAuthGuard)
  @Post('signin')
  @HttpCode(HttpStatus.OK)
  async signin(@Request() req: AuthRequest) {
    return this.authService.signin(req.user);
  }

  @IsPublic()
  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  async signup(@Body() createUserDto: CreateUserDto) {
    return this.authService.signup(createUserDto);
  }

  @IsPublic()
  @Post('confirm')
  @HttpCode(HttpStatus.OK)
  async confirmEmail(@Body() confirmEmailDto: ConfirmEmailDto) {
    return this.authService.confirmEmail(confirmEmailDto);
  }

  @IsPublic()
  @Post('reset')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() resetPassDto: ResetPassDto) {
    return this.authService.resetPassword(resetPassDto);
  }

  @IsPublic()
  @Post('change')
  @HttpCode(HttpStatus.OK)
  async changePassword(@Body() changePassDto: ChangePasswordDto) {
    return this.authService.changePassword(changePassDto);
  }
}
