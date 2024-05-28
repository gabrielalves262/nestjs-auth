import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { User } from './entities/user.entity';

@Injectable()
export class MailService {
  domain = process.env.DOMAIN || '';
  constructor(private readonly mailerService: MailerService) {}

  async sendVerificationEmail(user: User, token: string) {
    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Confirmação de email',
      template: './confirmation',
      context: {
        name: user.name,
        code: token,
      },
      text: `Olá, ${user.name}!\n\nObrigado por se registrar no NestJs Auth.\n\nUtilize o código abaixo para confirmar o seu cadastro:\n\n${token}\n\nCaso você não tenha feito o cadastro em nosso sistema, ignore esta mensagem.\n\nAtenciosamente, Equipe NestJs Auth`,
    });
  }

  async sendResetPasswordEmail(user: User, token: string) {
    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Redefinir senha',
      template: './reset',
      context: {
        name: user.name,
        code: token,
      },
      text: `Olá, ${user.name}!\n\nUtilize o código abaixo para redefinir sua senha.\n\n${token}\n\nCaso você não tenha solicitado a redefinição de sua senha, ignore esta mensagem.\n\nAtenciosamente, Equipe NestJs Auth`,
    });
  }

  async sendTwoFactorCodeEmail(user: User, token: string) {
    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Autênticação 2FA',
      template: './two-factor',
      context: {
        name: user.name,
        code: token,
      },
      text: `Olá, ${user.name}!\n\nUtilize o código abaixo para acessar sua conta.\n\n${token}\n\nAtenciosamente, Equipe NestJs Auth`,
    });
  }
}
