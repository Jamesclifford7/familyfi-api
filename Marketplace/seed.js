const mysql = require('mysql2');
const businesses = require('./MarketplaceData')
require('dotenv').config()
  
// Create a MySQL connection
const connection = mysql.createConnection({
    host: process.env.CLEARDB_HOST,
    user: process.env.CLEARDB_USERNAME,
    password: process.env.CLEARDB_PASSWORD, 
    database: process.env.CLEARDB_DATABASE, 
});

// Connect to the database
connection.connect();

// Insert data into the database
businesses.forEach((item) => {
    const { id, category, name, url, logo } = item;
    const query = `INSERT INTO businesses (id, category, name, url, logo) VALUES (?, ?, ?, ?, ?)`;
    connection.query(query, [id, category, name, url, logo], (error, results, fields) => {
      if (error) {
        console.error('Error inserting data:', error);
      } else {
        console.log('Data inserted successfully:', results);
      }
    });
});

// Close the connection
connection.end();