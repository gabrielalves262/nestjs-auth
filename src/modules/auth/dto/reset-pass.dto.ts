import { IsEmail } from 'class-validator';

export class ResetPassDto {
  @IsEmail({}, { message: 'Email inválido' })
  email: string;
}
