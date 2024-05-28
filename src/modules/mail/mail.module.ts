import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';
import { SendEmailQueueService } from './job/send-email-queue/send-email-queue.service';
import { SendEmailConsumerService } from './job/send-email-consumer/send-email-consumer.service';
import { BullModule } from '@nestjs/bull';

@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        host: process.env.EMAIL_HOST,
        port: Number(process.env.EMAIL_PORT),
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD,
        },
      },
      defaults: {
        from: 'NestJs Auth <no-reply@nestjs-auth.com',
      },
      template: {
        dir: join(__dirname, 'templates'),
        adapter: new HandlebarsAdapter(),
        options: {
          strict: false, // set to true to fail on error
        },
      },
    }),
    BullModule.registerQueue({
      name: 'SEND_EMAIL_VERIFICATION_QUEUE',
    }),
  ],
  providers: [MailService, SendEmailQueueService, SendEmailConsumerService],
  exports: [MailService, SendEmailQueueService],
})
export class MailModule {}
