// transform.js
module.exports.transformRow = (row) => {
  // Example: Convert date from 'MM/DD/YYYY' to 'YYYY-MM-DD'
  if (row.date_column) {
    const [month, day, year] = row.date_column.split('/');
    row.date_column = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  // Add other transformations here if needed
  return row;
};
