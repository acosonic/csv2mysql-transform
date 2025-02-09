const mysql = require('mysql2');
require('dotenv').config();
const fs = require("fs");
const csv = require('csv-parser');
const async = require('async');

// Parse the DATABASE_URL from .env
const dbUrl = new URL(process.env.DATABASE_URL);

const args = process.argv.slice(2); // Skip the first two arguments (node and script path)
if (args.length < 4) {
  console.error("Please provide the table name, CSV file path, number of rows to read at once, and the path to the transformation file as arguments.");
  console.error("Usage: node csvmysqltload.js <table_name> <csv_file_path> <rows_to_read_at_once> <transform_file_path>");
  process.exit(1);
}

const tableName = args[0];
const csvFilePath = args[1];
const rowsToReadAtOnce = parseInt(args[2], 10);
const transformFilePath = args[3];

if (isNaN(rowsToReadAtOnce) || rowsToReadAtOnce <= 0) {
  console.error("Please provide a valid number of rows to read at once.");
  process.exit(1);
}

// Load the transformRow function from the external file
let transformRow;
try {
  transformRow = require(transformFilePath).transformRow;
  if (typeof transformRow !== 'function') {
    throw new Error('transformRow is not a function in the provided file.');
  }
} catch (error) {
  console.error('Error loading transformation file:', error.message);
  process.exit(1);
}

// Create a connection to the database
const pool = mysql.createPool({
  connectionLimit: 10,
  host: dbUrl.hostname,
  user: dbUrl.username,
  password: dbUrl.password,
  database: dbUrl.pathname.substring(1), // Remove the leading '/'
  port: dbUrl.port || 3306
});

const insertRows = (rows, callback) => {
  pool.query(`INSERT INTO ${tableName} SET ?`, [rows], (error, results) => {
    if (error) {
      return callback(error);
    }
    callback();
  });
};

const q = async.queue((task, done) => {
  insertRows(task, done);
}, 20); // Adjust concurrency according to your app's and DB's capability

let rowsBuffer = [];
let rowCount = 0;

fs.createReadStream(csvFilePath)
  .pipe(csv())
  .on('data', (row) => {
    // Transform the row before adding it to the buffer
    const transformedRow = transformRow(row);
    rowsBuffer.push(transformedRow);
    rowCount++;

    if (rowsBuffer.length >= rowsToReadAtOnce) {
      q.push([...rowsBuffer], (err) => {
        if (err) {
          console.error('Insert error:', err);
        }
      });
      rowsBuffer = []; // Clear the buffer after pushing
    }
  })
  .on('end', () => {
    // Insert any remaining rows in the buffer
    if (rowsBuffer.length > 0) {
      q.push([...rowsBuffer], (err) => {
        if (err) {
          console.error('Insert error:', err);
        }
      });
    }
    console.log('CSV file has been processed successfully');
  });

q.drain(() => {
  console.log('All data has been inserted');
  pool.end();
});
