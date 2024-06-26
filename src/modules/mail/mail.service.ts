import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { User } from './entities/user.entity';

@Injectable()
export class MailService {
  BASE_URL = process.env.REDIRECT_FRONTEND_URL || '';
  PATHNAMES = {
    confirmEmail: '/auth/confirm-email',
    resetPassword: '/auth/reset-password',
  };

  constructor(private readonly mailerService: MailerService) {}

  async sendVerificationEmail(user: User, token: string) {
    const url = `${this.BASE_URL}${this.PATHNAMES.confirmEmail}?token=${token}`;
    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Confirme seu email',
      template: './confirmation',
      context: {
        name: user.name.split(' ')[0],
        url,
      },
      text: `Olá, ${user.name}!\n\nObrigado por se juntar a nós!.\n\nPara verificar sua conta, confirme seu email copiando o link abaixo e colando em uma nova aba do seu navegador:\n\n${url}\n\nCaso você não tenha feito o cadastro em nosso sistema, ignore esta mensagem.\n\nAtenciosamente, Equipe NestJs Auth`,
    });
  }

  async sendResetPasswordEmail(user: User, token: string) {
    const url = `${this.BASE_URL}${this.PATHNAMES.resetPassword}?token=${token}`;
    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Redefinir senha',
      template: './reset',
      context: {
        name: user.name.split(' ')[0],
        url,
      },
      text: `Olá, ${user.name}!\n\nPara redefinir sua senha, copie o link abaixo e cole em uma nova aba do seu navegador.\n\n${url}\n\nCaso você não tenha solicitado a redefinição de sua senha, ignore esta mensagem.\n\nAtenciosamente, Equipe NestJs Auth`,
    });
  }

  async sendTwoFactorCodeEmail(user: User, token: string) {
    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Autênticação 2FA',
      template: './two-factor',
      context: {
        name: user.name.split(' ')[0],
        code: token,
      },
      text: `Olá, ${user.name}!\n\nUtilize o código abaixo para acessar sua conta.\n\n${token}\n\nAtenciosamente, Equipe NestJs Auth`,
    });
  }
}
