import {
  Injectable,
  Logger,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { readFileSync } from 'fs';
import { compile } from 'handlebars';
import { Attachment, CreateEmailResponse, Resend } from 'resend';
@Injectable()
export class MailingService {
  private readonly logger = new Logger(MailingService.name);
  constructor(private readonly configService: ConfigService) {}

  private getKey(appName: string): string {
    return this.configService.get(
      `RESEND_API_TOKEN_${appName.toUpperCase()}`,
    ) as string;
  }

  sendEmail({
    from,
    to,
    subject,
    templeteName,
    data = {},
    appName,
  }: {
    from: string;
    to: string;
    subject: string;
    templeteName: string;
    data?: any;
    appName: string;
  }): Promise<CreateEmailResponse> {
    const resendApiKey = this.getKey(appName);
    if (!resendApiKey)
      throw new UnprocessableEntityException('No token for that app name');
    const resend = new Resend(resendApiKey);
    const templeteUri = `${__dirname}/../../../../assets/templetes/mail/${templeteName}.hbs`;
    const html = readFileSync(templeteUri).toString();
    const content = compile(html.toString())(data);
    return resend.emails.send({
      from,
      to,
      subject,
      html: content,
    });
  }

  sendHtmlEmail({
    from,
    to,
    subject,
    html,
    appName,
  }: {
    from: string;
    to: string;
    subject: string;
    html: string;
    appName: string;
  }): Promise<CreateEmailResponse> {
    const resendApiKey = this.getKey(appName);
    if (!resendApiKey)
      throw new UnprocessableEntityException('No token for that app name');
    const resend = new Resend(resendApiKey);
    return resend.emails.send({
      from,
      to,
      subject,
      html,
    });
  }

  sendEmailAttachment({
    from,
    to,
    subject,
    templete,
    appName,
    data,
    attachments,
  }: {
    from: string;
    to: string;
    subject: string;
    templete?: string;
    appName: string;
    data?: any;
    attachments?: Attachment[];
  }): Promise<CreateEmailResponse> {
    const resendApiKey = this.getKey(appName);
    if (!resendApiKey)
      throw new UnprocessableEntityException('No token for that app name');
    const resend = new Resend(resendApiKey);
    let content = '';
    try {
      const serverUrl = this.configService.get(`SERVER_URL`);
      const templeteUri = `${__dirname}/../../../../assets/templetes/mail/${templete}.hbs`;
      const html = readFileSync(templeteUri).toString();
      content = compile(html.toString())({ ...data, serverUrl }) || '';
    } catch (error) {
      this.logger.error(`Error compiling email template ${templete}: ${error}`);
    }

    return resend.emails.send({
      from,
      to,
      subject,
      html: content,
      attachments: attachments || [],
    });
  }

  getTemplates({
    appName,
    after,
    limit = 20,
  }: {
    appName: string;
    after?: string;
    limit?: number;
  }) {
    const resendApiKey = this.getKey(appName);
    if (!resendApiKey)
      throw new UnprocessableEntityException('No token for that app name');
    const resend = new Resend(resendApiKey);
    return resend.templates.list({ after, limit });
  }

  getTemplate({
    appName,
    templeteId,
  }: {
    appName: string;
    templeteId: string;
  }) {
    const resendApiKey = this.getKey(appName);
    if (!resendApiKey)
      throw new UnprocessableEntityException('No token for that app name');
    const resend = new Resend(resendApiKey);
    return resend.templates.get(templeteId);
  }

  async updateTemplate({
    templeteId,
    data,
    appName,
  }: {
    templeteId: string;
    data: any;
    appName: string;
  }) {
    const resendApiKey = this.getKey(appName);
    if (!resendApiKey)
      throw new UnprocessableEntityException('No token for that app name');
    const resend = new Resend(resendApiKey);
    await resend.templates.update(templeteId, data);
    return await resend.templates.publish(templeteId);
  }

  async createTemplate({ data, appName }: { data: any; appName: string }) {
    const resendApiKey = this.getKey(appName);
    if (!resendApiKey)
      throw new UnprocessableEntityException('No token for that app name');
    const resend = new Resend(resendApiKey);
    return resend.templates.create(data).publish();
  }

  async sendTemplate({ data, appName }: { data: any; appName: string }) {
    const resendApiKey = this.getKey(appName);
    if (!resendApiKey)
      throw new UnprocessableEntityException('No token for that app name');
    const resend = new Resend(resendApiKey);
    const defaultCC =
      this.configService
        .get(`RESEND_CC_EMAILS_${appName.toUpperCase()}`)
        ?.split(',') || [];
    return resend.emails.send({
      ...data,
      cc: [...(data?.cc || []), ...defaultCC],
    });
  }
}
