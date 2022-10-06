import CustomError from './CustomError.js';

class UnauthorisedError extends CustomError {
  constructor(message) {
    super(message);
    this.statusCode = 401;
  }
}

export default UnauthorisedError;
