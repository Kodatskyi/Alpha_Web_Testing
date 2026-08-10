require('dotenv').config();

function required(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable "${name}". Copy .env.example to .env and fill in real credentials.`);
  }
  return value;
}

module.exports = {
  testEmail: required('ALPHANOVEL_TEST_EMAIL'),
  testPassword: required('ALPHANOVEL_TEST_PASSWORD'),
};
