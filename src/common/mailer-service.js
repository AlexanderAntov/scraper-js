import nodemailer from 'nodemailer';
import apiConstants from './api-constants.js';

export default class MailerService {
    static send(subject, body) {
        const mailOptions = {
            from: apiConstants.email.username,
            to: apiConstants.email.receiver,
            subject: subject,
            text: body
        };

        nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: apiConstants.email.username,
                pass: apiConstants.email.password
            }
        })
        .sendMail(mailOptions, (error, info) => {
            if (error) {
                throw new Error(error);
            }
        });
    }
}