const dotenv = require('dotenv');
const path = require('path');

const ENV = process.env.NODE_ENV || 'development';

dotenv.config({
  path: path.resolve(__dirname, `../.env.${ENV}`)
});
