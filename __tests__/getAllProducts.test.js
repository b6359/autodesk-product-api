jest.mock('../models/productModel', () => ({
  getAllProductsFromDB: jest.fn()
}));

jest.mock('../services/redis', () => ({
  get: jest.fn(),
  set: jest.fn()
}));

const { getAllProductsFromDB } = require('../models/productModel');
const redis = require('../services/redis');
const { getAllProducts } = require('../functions/getAllProducts');

describe('getAllProducts Lambda handler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return products from Redis cache if available', async () => {
    const cached = JSON.stringify([{ id: 1, name: 'Apple', price: 1.2, qty: 100, out_of_stock: false }]);
    redis.get.mockResolvedValue(cached);

    const response = await getAllProducts();

    expect(redis.get).toHaveBeenCalledWith('products');
    expect(getAllProductsFromDB).not.toHaveBeenCalled();
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toEqual(JSON.parse(cached));
  });

  it('should return 404 if Redis cache is empty', async () => {
    redis.get.mockResolvedValue(null);

    const response = await getAllProducts();

    expect(redis.get).toHaveBeenCalledWith('products');
    expect(getAllProductsFromDB).not.toHaveBeenCalled();
    expect(response.statusCode).toBe(404);
    expect(JSON.parse(response.body)).toEqual({ error: 'Cache miss' });
  });

  it('should return 500 if Redis throws an error', async () => {
    redis.get.mockRejectedValue(new Error('Redis failure'));

    const response = await getAllProducts();

    expect(response.statusCode).toBe(500);
    expect(JSON.parse(response.body)).toEqual({ error: 'Redis unavailable' });
  });
});
