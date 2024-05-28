import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { User } from '../../entities/user.entity';
import { MailService } from '../../mail.service';

type SendVerificationEmailConsumer = {
  user: User;
  token: string;
};

@Processor('SEND_EMAIL_VERIFICATION_QUEUE')
export class SendEmailConsumerService {
  constructor(private readonly mailService: MailService) {}

  @Process('SEND_EMAIL_VERIFICATION_QUEUE')
  async sendVerificationEmail({ data }: Job<SendVerificationEmailConsumer>) {
    await this.mailService.sendVerificationEmail(data.user, data.token);
  }
}
