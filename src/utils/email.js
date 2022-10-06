import { config } from 'dotenv';
import ejs from 'ejs';
//resolved path issue
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log(__dirname);
import nodemailer from 'nodemailer';
import { SendMailError } from '../errors/index.js';
import logger from './logger.js';

config();

//setting up nodemailer account
// const {EMAIL_USER, EMAIL_PASS, SMTP_PORT, SECURE} = process.env;
// const secure = SECURE === 'false' ? false : true;
// const PORT = parseInt(SMTP_PORT)

// const transporter = nodemailer.createTransport({
//     service: "gmail",
//     auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS
//     }
// })

const testAccount = await nodemailer.createTestAccount();

let transporter = nodemailer.createTransport({
  host: 'smtp.ethereal.email',
  port: 587,
  secure: false,
  auth: {
    user: testAccount.user,
    pass: testAccount.pass,
  },
});

export async function mailService(object) {
  const data = await ejs.renderFile(__dirname + `../../view/${object.view}`, {
    name: object.name,
    url: object.link,
    token: object.token,
  });

  const mailOptions = {
    from: `"Easyloan" <${process.env.EMAIL_USER}>`, //sender address
    to: object.email, //recipent(s) list of receivers
    subject: 'Easy Loan - ' + object.subject,
    html: data, //
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      logger.info(
        `Error! sending Easyloan ${object.subject} to ${object.email}`
      );
      throw new SendMailError(err.message);
    } else {
      logger.info(`Easyloan ${object.subject} sent to ${object.email}`);
    }
  });
}
