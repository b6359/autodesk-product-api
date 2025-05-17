jest.mock('lambda-multipart-parser', () => ({
  parse: jest.fn()
}));

jest.mock('../services/manipulateCSV', () => ({
  manipulateCSVBuffer: jest.fn()
}));

jest.mock('../models/productModel', () => ({
  upsertProduct: jest.fn(),
  getAllProductsFromDB: jest.fn()
}));

jest.mock('../services/redis', () => ({
  set: jest.fn()
}));

const multipart = require('lambda-multipart-parser');
const { manipulateCSVBuffer } = require('../services/manipulateCSV');
const { upsertProduct, getAllProductsFromDB } = require('../models/productModel');
const redis = require('../services/redis');
const { uploadProduct } = require('../functions/uploadProduct');
describe('uploadProduct Lambda handler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 200 for valid CSV input', async () => {
    // Simulate parsed file with CSV content as Buffer
    const mockCSVBuffer = Buffer.from('name,image,price,qty,out_of_stock\nApple,apple.jpg,1.2,100,false');

    multipart.parse.mockResolvedValue({
      files: [
        {
          content: mockCSVBuffer
        }
      ]
    });

    const mockProducts = [
      {
        name: 'Apple',
        image: 'apple.jpg',
        price: 1.2,
        qty: 100,
        out_of_stock: false
      }
    ];

    manipulateCSVBuffer.mockResolvedValue(mockProducts);
    getAllProductsFromDB.mockResolvedValue(mockProducts);
    upsertProduct.mockResolvedValue(undefined);
    redis.set.mockResolvedValue(undefined);

    const result = await uploadProduct({});

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body).message).toMatch(/uploaded/i);

    expect(manipulateCSVBuffer).toHaveBeenCalledWith(mockCSVBuffer);
    expect(upsertProduct).toHaveBeenCalledWith(expect.objectContaining({ name: 'Apple' }));
    expect(redis.set).toHaveBeenCalledWith('products', JSON.stringify(mockProducts));
  });
});
