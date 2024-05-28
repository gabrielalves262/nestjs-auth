import { ConflictException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import { User } from './entities/user.entity';
import { Prisma, UserAccountProvider } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Verifica se o email já está cadastrado
    const existingUser = await this.findByEmail(createUserDto.email);
    if (existingUser) throw new ConflictException('EMAIL_ALREADY_EXISTS');

    // Cadastra o usuário no banco de dados
    const createdUser = await this.prisma.user.create({
      data: {
        email: createUserDto.email,
        name: createUserDto.name,
        password: await bcrypt.hash(createUserDto.password, 10),
        accountProvider: UserAccountProvider.CREDENTIALS,
        picture: createUserDto.picture,
      },
    });

    // Retorna o usuário criado com a senha escondida
    return {
      ...createdUser,
      password: undefined,
    };
  }

  findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async update(id: string, data: Prisma.UserUpdateInput) {
    const updatedUser = await this.prisma.user.update({
      where: { id },
      data,
    });

    return {
      ...updatedUser,
      password: undefined,
    };
  }
}
