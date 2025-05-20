const redis = require('../services/redis');

module.exports.getAllProducts = async () => {
  try {
    debugger
    const cachedData = await redis.get('products');
    if (cachedData) {
      return {
        statusCode: 200,
        headers: { 'Cache-Control': 'max-age=60' },
        body: cachedData
      };
    } else {
      return { statusCode: 404, body: JSON.stringify({ error: 'Cache miss' }) };
    }
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Redis unavailable' }) };
  }
};
