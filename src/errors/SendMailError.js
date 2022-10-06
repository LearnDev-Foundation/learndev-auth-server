import CustomError from './CustomError.js';

class SendMailError extends CustomError {
  constructor(message) {
    super(message);
    this.statusCode = 404;
  }
}

export default SendMailError;
