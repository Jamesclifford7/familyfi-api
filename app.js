const express = require('express')
const app = express()
const cors = require('cors')
const mysql = require('mysql2');
require('dotenv').config()
const validator = require('email-validator')

app.use(express.json());
app.use(cors()); 

const pool = mysql.createPool({
    host: process.env.HOST,
    user: process.env.USERNAME,
    password: process.env.PASSWORD, 
    database: process.env.DATABASE, 
    connectionLimit: 10, 
    connectTimeout: 60000, 
});
  
pool.getConnection((error)=> {
    if (error) {
        console.log('Connection Failed', error.message);
    } else {
        console.log('Connection Established Successfully'); 
    }; 
});

// routes
app.get('/', (req, res) => {
    res.send('FamilyFi Server is running')
})

// get all users
app.get('/users', async (req, res) => {
    pool.query(`SELECT * FROM ${process.env.DATABASE}.users;`, (error, result) => {
        if (error) {
        console.log(error)
        }

        res.json(result); 
    })
})

const PORT = process.env.PORT || 8000;


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});