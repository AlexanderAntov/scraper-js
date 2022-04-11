import nodemailer from 'nodemailer';
import { apiConstants } from './api-constants.js';

class MailOptions {
    public from: string = '';
    public to: string = '';
    public subject: string = '';
    public html: string = '';
    public text: string = '';
}

export class MailerService {
    static send(subject: string, body: string, isHtml: boolean) {
        const options = new MailOptions();
        options.from = apiConstants.emailConfig.username;
        options.to = apiConstants.emailConfig.receiver;
        options.subject = subject;

        if (isHtml) {
            options.html = body;
        } else {
            options.text = body;
        }

        nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: apiConstants.emailConfig.username,
                pass: apiConstants.emailConfig.password
            }
        })
        .sendMail(options, (error: Error | null, info: any) => {
            if (error) {
                throw error;
            }
        });
    }
}