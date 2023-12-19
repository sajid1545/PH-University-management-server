import nodemailer from 'nodemailer';
import config from '../config';

export const sendEmail = async (to: string, html: string) => {
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: config.NODE_ENV === 'production' ? true : false,
        auth: {
            // TODO: replace `user` and `pass` values from <https://forwardemail.net>
            user: 'sajidabdullah9962@gmail.com',
            pass: 'tcpm vpds qrtv dcyf',
        },
    });

    await transporter.sendMail({
        from: 'sajidabdullah9962@gmail.com', // sender address
        to, // list of receivers
        subject: 'Change your password 🔐🔐', // Subject line
        text: 'Reset your password within 10 minutes', // plain text body
        html, // html body
    });
};
