const express = require('express')
const app = express()
const cors = require('cors')
const mysql = require('mysql2');
require('dotenv').config()
const validator = require('email-validator')
const jwt = require('jsonwebtoken');

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

// handle login
app.post('/login', (req, res) => {
    const {email, password} = req.body
    
    pool.query(`SELECT * FROM ${process.env.DATABASE}.users WHERE email = '${email}' AND password = '${password}';`, (error, result) => {
      if (error) {
        console.log(error)
      } else if (result.length === 0) {
        res.send('User not found')
      } else {
        // Generate JWT token
        const token = jwt.sign(result[0], process.env.JWT_SECRET_KEY, { expiresIn: '1h' });
        
        res.json({token})
      }
    })
})

// verify JSON web token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]; // Extract token from request headers

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }

  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
    if (err) {
        return res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }

    req.user = decoded; // Attach decoded user information to request object
    next();
  });
}

// get user 
app.get('/user', verifyToken, (req, res) => {
  res.json(req.user);
})

// get marketplace data
app.get('/marketplace', verifyToken, (req, res) => {
  
    pool.query(`SELECT * FROM ${process.env.DATABASE}.businesses;`, (error, result) => {
      if (error) {
        console.log(error)
      }

      res.json(result); 
  })
})

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});