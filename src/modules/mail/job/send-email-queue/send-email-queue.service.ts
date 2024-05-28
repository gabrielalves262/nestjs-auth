import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import { User } from '../../entities/user.entity';

type SendVerificationEmailQueue = {
  user: User;
  token: string;
};

@Injectable()
export class SendEmailQueueService {
  constructor(
    @InjectQueue('SEND_EMAIL_VERIFICATION_QUEUE')
    private readonly sendEmailQueue: Queue,
  ) {}

  async sendVerificationEmail({ user, token }: SendVerificationEmailQueue) {
    await this.sendEmailQueue.add('SEND_EMAIL_VERIFICATION_QUEUE', {
      user,
      token,
    });
  }
}
