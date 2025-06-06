const pool = require('../services/db');

async function upsertProduct(product) {
  const { name, image, price, qty, out_of_stock } = product;

  await pool.query(`
    INSERT INTO products (name, image, price, qty, out_of_stock)
    VALUES ($1, $2, $3, $4, $5)
    ON CONFLICT (name) DO UPDATE
    SET image = EXCLUDED.image,
        price = EXCLUDED.price,
        qty = EXCLUDED.qty,
        out_of_stock = EXCLUDED.out_of_stock
  `, [name, image, price, qty, out_of_stock]);
}

async function getAllProductsFromDB() {
  const { rows } = await pool.query('SELECT * FROM products ORDER BY id ASC');
  return rows;
}

module.exports = {
  upsertProduct,
  getAllProductsFromDB
};
