import Vonage from '@vonage/server-sdk';
import { config } from 'dotenv';
import log from './logger.js';
config();

const vonage = new Vonage({
  apiKey: process.env.SMS_API_KEY,
  apiSecret: process.env.SMS_API_SECRET,
});
const sendSms = async ({ to, otp }) => {
  const from = 'Vonage APIs';
  const text = otp;

  vonage.message.sendSms(from, to, text, (err, responseData) => {
    if (err) {
      console.log(err);
    } else {
      if (responseData.message[0]['status'] === '0') {
        log.info(`Message sent successfully to ${to}`);
      } else {
        log.info(
          `Message failed with error: ${responseData.message[0]['error-text']}`
        );
      }
    }
  });
};

export default sendSms;
