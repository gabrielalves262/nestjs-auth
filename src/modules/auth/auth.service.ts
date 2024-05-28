import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { User } from '../user/entities/user.entity';

import * as bcrypt from 'bcryptjs';
import { UserPayload } from './models/UserPayload';
import { UserToken } from './models/UserToken';
import { UnauthorizedError } from './errors/unauthorized.error';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { TokensService } from '../tokens/tokens.service';
import { ConfirmEmailDto } from './dto/confirm-email.dto';
import { ResetPassDto } from './dto/reset-pass.dto';
import { MailService } from '../mail/mail.service';
import { ChangePasswordDto } from './dto/change-pass.dto copy';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly tokensService: TokensService,
    private readonly sendEmailService: MailService,
  ) {}

  /**
   * Realiza o login do usuário e retorna o token de acesso
   * @param user - dados do usuário
   * @returns Token de acesso
   */
  async signin(user: User): Promise<UserToken> {
    const payload: UserPayload = {
      sub: user.id,
      name: user.name,
      email: user.email,
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  /**
   * Realiza o cadastro de um novo usuário
   * @param createUserDto - dados do usuário
   * @returns success: 'CREATED' | 'CONFIRM_EMAIL'
   */
  async signup(
    createUserDto: CreateUserDto,
  ): Promise<{ success: 'CREATED' | 'CONFIRM_EMAIL' }> {
    // Cadastra o usuário no banco de dados
    const createdUser = await this.userService.create(createUserDto);

    const verificationToken =
      await this.tokensService.generateVerificationToken(createdUser.email);

    // Envia um email de verificação
    await this.sendEmailService.sendVerificationEmail(
      {
        name: createUserDto.name,
        email: createUserDto.email,
      },
      verificationToken.token,
    );

    // Retorna success: 'CONFIRM_EMAIL' para o frontend
    return {
      success: 'CONFIRM_EMAIL',
    };
  }

  /**
   * Valida o login
   * @param email - email do usuário
   * @param password - senha do usuário
   * @param code - código de autênticação 2FA caso o usuário possua autênticação 2FA
   * @returns User - dados do usuário com a senha escondida
   */
  async validateUser(
    email: string,
    password: string,
    code?: string | null,
  ): Promise<User> {
    const user = await this.userService.findByEmail(email);

    // Verifica se o usuário existe
    if (!user) throw new UnauthorizedError('CREDENTIALS_INVALID');

    // Verifica se a senha é a correta
    const isPasswordValid = await bcrypt.compare(password, user.password);

    // Se a senha não é a correta, retornar um erro INVALID_PASSWORD
    if (!isPasswordValid) throw new UnauthorizedError('CREDENTIALS_INVALID');

    // Verifica se o email foi verificado
    // Se o email não foi verificado, envia o email de validação
    // e retornar um erro CONFIRM_EMAIL
    if (!user.emailVerified) {
      const verificationToken =
        await this.tokensService.generateVerificationToken(user.email);

      // Envia um email de verificação
      await this.sendEmailService.sendVerificationEmail(
        {
          name: user.name,
          email: user.email,
        },
        verificationToken.token,
      );

      throw new UnauthorizedError('CONFIRM_EMAIL');
    }

    // Verificar se o usuário possui autênticação 2FA
    if (user.isTwoFactorEnabled) {
      // Se não foi passado o código, retornar um erro 2FA_REQUIRED
      if (!code) {
        const twoFactorToken = await this.tokensService.generateTwoFactorToken(
          user.email,
        );

        // Envia um codigo 2FA para o email do usuário
        await this.sendEmailService.sendTwoFactorCodeEmail(
          {
            name: user.name,
            email: user.email,
          },
          twoFactorToken.token,
        );

        throw new UnauthorizedError('2FA_REQUIRED');
      }

      // Obtém o token 2FA do usuário do banco de dados
      const twoFactorToken = await this.tokensService.getTwoFactorTokenByEmail(
        user.email,
      );

      // Verifica se o token 2FA existe
      if (!twoFactorToken) throw new UnauthorizedError('2FA_INVALID_CODE');

      // Verifica se o código está correto
      // Se não estiver correto, retornar um erro 2FA_INVALID_CODE
      if (twoFactorToken.token !== code)
        throw new UnauthorizedError('2FA_INVALID_CODE');

      // Verifica se o token 2FA expirou
      const hasExpired = new Date(twoFactorToken.expires) < new Date();
      if (hasExpired) throw new UnauthorizedError('2FA_EXPIRED_CODE');

      // Após verificação bem sucessida, deleta o token 2FA do usuário
      await this.tokensService.deleteTwoFactorToken(twoFactorToken.id);

      // Obtém o token de confirmação do usuário do banco de dados
      const existingConfirmation =
        await this.tokensService.getTwoFactorConfirmationByUserId(user.id);

      // Verifica se o token de confirmação existe
      if (existingConfirmation) {
        // Se o token de confirmação existe, deleta o token de confirmação
        await this.tokensService.deleteTwoFactorConfirmation(
          existingConfirmation.id,
        );
      }

      // Cria um novo token de confirmação do usuário
      await this.tokensService.createTwoFactorConfirmation(user.id);
    }

    return {
      ...user,
      password: undefined,
    };
  }

  /**
   * Confirma o email do usuário
   * @param token  - token de confirmação
   * @returns success: 'EMAIL_CONFIRMED'
   */
  async confirmEmail({ token }: ConfirmEmailDto) {
    const existingToken = await this.tokensService.getVerificationToken(token);
    if (!existingToken) throw new BadRequestException('INVALID_TOKEN');

    const hasExpired = new Date(existingToken.expires) < new Date();
    if (hasExpired) throw new BadRequestException('EXPIRED_TOKEN');

    const existingUser = await this.userService.findByEmail(
      existingToken.email,
    );
    if (!existingUser) throw new BadRequestException('INVALID_USER');

    await this.userService.update(existingUser.id, {
      emailVerified: new Date(),
    });

    await this.tokensService.deleteVerificationToken(existingToken.id);

    return { success: 'EMAIL_CONFIRMED' };
  }

  /**
   * Envia um email para redefinir a senha com o código de validação
   * @param email - email do usuário
   * @returns success: 'EMAIL_SENT'
   */
  async resetPassword({ email }: ResetPassDto) {
    const existingUser = await this.userService.findByEmail(email);
    if (!existingUser) throw new NotFoundException('USER_NOT_FOUND');

    const passwordResetToken =
      await this.tokensService.generatePasswordResetToken(existingUser.email);

    // await sendPasswordResetEmail(passwordResetToken.email, passwordResetToken.token)
    // Envia um email de redefinição de senha com o código de validação
    await this.sendEmailService.sendResetPasswordEmail(
      {
        name: existingUser.name,
        email: existingUser.email,
      },
      passwordResetToken.token,
    );

    return { success: 'EMAIL_SENT' };
  }

  /**
   * Altera a senha do usuário
   * @param token - token de redefinição de senha
   * @param newPassword - nova senha
   * @returns success: 'PASSWORD_CHANGED'
   */
  async changePassword({ token, password }: ChangePasswordDto) {
    const existingToken =
      await this.tokensService.getPasswordResetTokenByToken(token);
    if (!existingToken) throw new BadRequestException('INVALID_TOKEN');

    const hasExpired = new Date(existingToken.expires) < new Date();
    if (hasExpired) throw new BadRequestException('EXPIRED_TOKEN');

    const existingUser = await this.userService.findByEmail(
      existingToken.email,
    );
    if (!existingUser) throw new BadRequestException('INVALID_USER');

    const hashedPassword = await bcrypt.hash(password, 10);
    await this.userService.update(existingUser.id, {
      password: hashedPassword,
    });

    await this.tokensService.deletePasswordResetToken(existingToken.id);

    return { success: 'PASSWORD_CHANGED' };
  }
}
