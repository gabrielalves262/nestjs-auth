import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { VerificationToken } from './entities/verification-token.entity';
import { v4 } from 'uuid';

const randomToken = (
  size: number,
  type: 'number' | 'letters' | 'alphanumeric',
): string => {
  const chars =
    type === 'number'
      ? '0123456789'
      : type === 'letters'
        ? 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
        : 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

  let token = '';

  for (let i = 0; i < size; i++) {
    // obtém um caractere aleatório de caracteres e concatena-o ao token
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return token;
};

@Injectable()
export class TokensService {
  constructor(private readonly prisma: PrismaService) {}

  async getVerificationTokenByEmail(
    email: string,
  ): Promise<VerificationToken | null> {
    try {
      const verificationToken = await this.prisma.verificationToken.findFirst({
        where: { email },
      });

      return verificationToken;
    } catch {
      return null;
    }
  }

  async getVerificationToken(token: string): Promise<any> {
    try {
      const verificationToken = await this.prisma.verificationToken.findUnique({
        where: { token },
      });

      return verificationToken;
    } catch {
      return null;
    }
  }

  async getTwoFactorTokenByEmail(
    email: string,
  ): Promise<VerificationToken | null> {
    try {
      const twoFactorToken = await this.prisma.twoFactorToken.findFirst({
        where: { email },
      });

      return twoFactorToken;
    } catch {
      return null;
    }
  }

  async getTwoFactorConfirmationByUserId(userId: string) {
    try {
      const twoFactorConfirmation =
        await this.prisma.twoFactorConfirmation.findUnique({
          where: { userId },
        });

      return twoFactorConfirmation;
    } catch {
      return null;
    }
  }

  async deleteTwoFactorConfirmation(id: string) {
    await this.prisma.twoFactorConfirmation.delete({
      where: { id },
    });
  }

  async createTwoFactorConfirmation(userId: string) {
    await this.prisma.twoFactorConfirmation.create({
      data: { userId },
    });
  }

  async deleteTwoFactorToken(id: string): Promise<void> {
    await this.prisma.twoFactorToken.delete({
      where: { id },
    });
  }

  async generateVerificationToken(email: string): Promise<VerificationToken> {
    const token = v4();
    const expires = new Date(new Date().getTime() + 15 * 60 * 1000); // 15 minutes

    const existingToken = await this.getVerificationTokenByEmail(email);

    if (existingToken) {
      await this.prisma.verificationToken.delete({
        where: {
          id: existingToken.id,
        },
      });
    }

    const verificationToken = await this.prisma.verificationToken.create({
      data: {
        email,
        token,
        expires,
      },
    });

    return verificationToken;
  }

  async generatePasswordResetToken(email: string): Promise<VerificationToken> {
    const token = randomToken(8, 'alphanumeric');
    const expires = new Date(new Date().getTime() + 3600 * 1000); // 1 hour

    const existingToken = await this.getPasswordResetTokenByEmail(email);

    if (existingToken) {
      await this.prisma.passwordResetToken.delete({
        where: { id: existingToken.id },
      });
    }

    const passwordResetToken = await this.prisma.passwordResetToken.create({
      data: {
        email,
        token,
        expires,
      },
    });

    return passwordResetToken;
  }

  async generateTwoFactorToken(email: string): Promise<VerificationToken> {
    const token = randomToken(6, 'number');
    const expires = new Date(new Date().getTime() + 15 * 60 * 1000); // 15 minutes

    const existingToken = await this.getTwoFactorTokenByEmail(email);
    if (existingToken) {
      await this.prisma.twoFactorToken.delete({
        where: { id: existingToken.id },
      });
    }

    const twoFactorToken = await this.prisma.twoFactorToken.create({
      data: {
        email,
        token,
        expires,
      },
    });

    return twoFactorToken;
  }

  async getPasswordResetTokenByEmail(email: string) {
    try {
      const passwordResetToken = await this.prisma.passwordResetToken.findFirst(
        { where: { email } },
      );

      return passwordResetToken;
    } catch {
      return null;
    }
  }

  async getPasswordResetTokenByToken(token: string) {
    try {
      const passwordResetToken =
        await this.prisma.passwordResetToken.findUnique({ where: { token } });

      return passwordResetToken;
    } catch {
      return null;
    }
  }

  async deleteVerificationToken(id: string) {
    await this.prisma.verificationToken.delete({
      where: { id },
    });
  }

  async deletePasswordResetToken(id: string) {
    await this.prisma.passwordResetToken.delete({
      where: { id },
    });
  }
}
