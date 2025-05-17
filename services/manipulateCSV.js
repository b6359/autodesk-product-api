const csv = require('csv-parser');
const stream = require('stream');

function isBooleanString(value) {
  return value === 'true' || value === 'false';
}

function validateProductRow(row, lineNumber) {
  const errors = [];

  if (!row.name || row.name.trim() === '') {
    errors.push(`Missing 'name' at line ${lineNumber}`);
  }
  if (!row.price || isNaN(parseFloat(row.price))) {
    errors.push(`Invalid or missing 'price' at line ${lineNumber}`);
  }
  if (row.qty && isNaN(parseInt(row.qty))) {
    errors.push(`Invalid 'qty' at line ${lineNumber}`);
  }
  if (row.out_of_stock && !isBooleanString(row.out_of_stock)) {
    errors.push(`Invalid 'out_of_stock' at line ${lineNumber}`);
  }

  if (errors.length) {
    throw new Error(errors.join('; '));
  }
}

exports.manipulateCSVBuffer = (buffer) => {
  return new Promise((resolve, reject) => {
    const readable = new stream.PassThrough();
    readable.end(buffer);

    const products = [];
    let lineNumber = 1;

    readable
      .pipe(csv())
      .on('data', (row) => {
        try {
          validateProductRow(row, lineNumber);
          products.push({
            name: row.name.trim(),
            image: row.image ? row.image.trim() : null,
            price: parseFloat(row.price),
            qty: row.qty ? parseInt(row.qty) : 0,
            out_of_stock: row.out_of_stock === 'true',
          });
          lineNumber++;
        } catch (err) {
          reject(new Error(`CSV validation error: ${err.message}`));
        }
      })
      .on('end', () => resolve(products))
      .on('error', (err) => reject(new Error(`CSV parsing error: ${err.message}`)));
  });
};
