import { IsString } from 'class-validator';

export class ConfirmEmailDto {
  @IsString({ message: 'O token de verificação deve ser uma string' })
  token: string;
}
