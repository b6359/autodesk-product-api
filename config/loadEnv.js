const path = require('path');
const dotenv = require('dotenv');

const ENV = process.env.NODE_ENV || 'development';

dotenv.config({
  path: path.resolve(__dirname, `../.env.${ENV}`),
});

console.log(`Environment: ${ENV}`);