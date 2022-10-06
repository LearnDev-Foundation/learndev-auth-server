const duration = (date, minute) => {
  return new Date(date.getTime() + minute * 60000);
};
const generateOtp = (user) => {
  const now = new Date();
  const otpLife = duration(now, 10);

  const otpToken = JSON.stringify(
    Math.floor(1000 + Math.random() * 9000 + Math.random() * 3000)
  );
  const otpObject = {
    otpToken,
    otpLife,
    user: user._id,
  };
  return otpObject;
};

export default generateOtp;
