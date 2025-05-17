const multipart = require('lambda-multipart-parser');
const { manipulateCSVBuffer } = require('../services/manipulateCSV');
const { upsertProduct, getAllProductsFromDB } = require('../models/productModel');
const redis = require('../services/redis');

module.exports.uploadProduct = async (event) => {
  try {
    const result = await multipart.parse(event);
    const file = result.files[0];

    if (!file || !file.content || file.content.length === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'CSV file is required.' }),
      };
    }

    const products = await manipulateCSVBuffer(file.content);

    for (let product of products) {
      product.out_of_stock = product.out_of_stock === true;
      await upsertProduct(product);
    }

    const updated = await getAllProductsFromDB();
    await redis.set('products', JSON.stringify(updated));

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Products uploaded successfully' }),
    };
  } catch (error) {
    return {
      statusCode: 500, body: JSON.stringify({ error: 'Internal Server Error',details: error.message }) 
    };
  }
};
