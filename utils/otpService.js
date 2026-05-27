const crypto = require('crypto');

/**
 * Generates a highly secure 6-digit numeric OTP.
 * @returns {string} 6-digit string
 */
const generateOTP = () => {
  return Math.floor(100000 + crypto.randomInt(900000)).toString();
};

/**
 * Generates a SHA-256 hash of the plain OTP string.
 * @param {string} otp 
 * @returns {string} hashed OTP
 */
const hashOTP = (otp) => {
  return crypto.createHash('sha256').update(otp).digest('hex');
};

/**
 * Securely verifies the OTP against its hashed counterpart and handles expiration checks.
 * @param {string} enteredOtp 
 * @param {string} hashedOtp 
 * @param {Date} expiryDate 
 * @returns {boolean} true if valid, false otherwise
 */
const verifyOTP = (enteredOtp, hashedOtp, expiryDate) => {
  if (!enteredOtp || !hashedOtp || !expiryDate) return false;
  
  // Check if expired
  if (new Date() > new Date(expiryDate)) return false;
  
  const enteredHash = hashOTP(enteredOtp);
  
  // Use timingSafeEqual to avoid timing side-channel attacks
  try {
    return crypto.timingSafeEqual(
      Buffer.from(enteredHash, 'hex'),
      Buffer.from(hashedOtp, 'hex')
    );
  } catch (err) {
    return false;
  }
};

module.exports = {
  generateOTP,
  hashOTP,
  verifyOTP
};
