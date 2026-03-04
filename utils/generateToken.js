const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET is missing in .env file!');
  }
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret_if_env_fails', {
    expiresIn: '30d',
  });
};

module.exports = generateToken;
