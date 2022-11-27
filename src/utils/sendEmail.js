import nodemailer from 'nodemailer';
// import { transport } from 'pino';

const sendEmail = async ({ subject, to, html }) => {
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

  var mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    html,
  };
  await transporter.sendMail(mailOptions);
};

export default sendEmail;
