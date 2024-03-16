const express = require('express')
const app = express()
const cors = require('cors')
const mysql = require('mysql2');
require('dotenv').config()
const validator = require('email-validator')

app.use(express.json());
app.use(cors()); 

const PORT = process.env.PORT || 8000;

// Define your routes here

app.get('/', (req, res) => {
    res.send('FamilyFi Server is running')
})

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});