import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const OtpSchema = new mongoose.Schema({
  otpToken: {
    type: String,
  },
  otpLife: {
    type: Date,
  },
  isValid: {
    type: Boolean,
    default: false,
  },
});

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  phone: {
    type: String,
  },
  email: {
    type: String,
    unique: true,
  },
  password: {
    type: String,
  },
  image: {
    type: String,
  },
  verificationToken: {
    type: String,
    default: '',
  },
  role: {
    type: String,
    default: 'user',
  },
  googleId: {
    type: String,
    default: '',
  }
});

OtpSchema.pre('save', async function () {
  const salt = await bcrypt.genSalt(12);
  this.otpToken = await bcrypt.hash(this.otpToken, salt);
});

OtpSchema.methods.compareOtp = async function (otp) {
  const isMatch = await bcrypt.compare(otp, this.otpToken);
  return isMatch;
};

UserSchema.pre('save', async function () {
  const salt = await bcrypt.genSalt(12);
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, salt);
  }
});

UserSchema.methods.comparePassword = async function (password) {
  const isMatch = await bcrypt.compare(password, this.password);
  return isMatch;
};

export default mongoose.model('User', UserSchema);
