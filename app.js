const express = require('express')
const app = express()
const cors = require('cors')
const mysql = require('mysql2');
require('dotenv').config()
const validator = require('email-validator')
const jwt = require('jsonwebtoken');
const axios = require('axios');

app.use(express.json());
app.use(cors()); 


const pool = mysql.createPool({
    host: process.env.CLEARDB_HOST,
    user: process.env.CLEARDB_USERNAME,
    password: process.env.CLEARDB_PASSWORD, 
    database: process.env.CLEARDB_DATABASE, 
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
    pool.query(`SELECT * FROM ${process.env.CLEARDB_DATABASE}.users;`, (error, result) => {
        if (error) {
        console.log(error)
        }

        res.json(result); 
    })
})

// handle login
app.post('/login', (req, res) => {
    const {email, password} = req.body
    
    pool.query(`SELECT * FROM ${process.env.CLEARDB_DATABASE}.users WHERE email = '${email}' AND password = '${password}';`, (error, result) => {
      if (error) {
        console.log(error)
      } else if (result.length === 0) {
        res.send('User not found')
      } else {
        // Generate JWT token
        const token = jwt.sign(result[0], process.env.JWT_SECRET_KEY, { expiresIn: '1h' });
        
        res.json({
          token: token, 
          user: result[0], 
        })
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
  
    pool.query(`SELECT * FROM ${process.env.CLEARDB_DATABASE}.businesses;`, (error, result) => {
      if (error) {
        console.log(error)
      }

      res.json(result); 
  })
})

// get deals for all categories and put into one object
app.get('/deals', (req, res) => {

  axios.all([ 
    axios.get(`https://serpapi.com/search.json?engine=google_shopping&q=baby&api_key=${process.env.SERP_API_KEY}&tbs=sales:1`), 
    axios.get(`https://serpapi.com/search.json?engine=google_shopping&q=children's%20clothes&api_key=${process.env.SERP_API_KEY}&tbs=sales:1`), 
    axios.get(`https://serpapi.com/search.json?engine=google_shopping&q=school%20supplies&api_key=${process.env.SERP_API_KEY}&tbs=sales:1`), 
    axios.get(`https://serpapi.com/search.json?engine=google_shopping&q=sports%20equipment&api_key=${process.env.SERP_API_KEY}&tbs=sales:1`), 
    axios.get(`https://serpapi.com/search.json?engine=google_shopping&q=home%20and%20bath&api_key=${process.env.SERP_API_KEY}&tbs=sales:1`), 
    axios.get(`https://serpapi.com/search.json?engine=google_shopping&q=toys&api_key=${process.env.SERP_API_KEY}&tbs=sales:1`), 
  ])  
  .then(axios.spread((obj1, obj2, obj3, obj4, obj5, obj6) => {
    const babyObj = {category: "Baby", ...obj1.shopping_results}
    const clothesObj = {category: "Clothes", ...obj2.shopping_results}
    const schoolObj = {category: "Education", ...obj3.shopping_results}
    const sportsObj = {category: "Extracurricular", ...obj4.shopping_results}
    const homeObj = {category: "Home", ...obj5.shopping_results}
    const toysObj = {category: "Miscellaneous", ...obj6.shopping_results}

    const resObject = {
      ...babyObj, 
      ...clothesObj, 
      ...schoolObj, 
      ...sportsObj, 
      ...homeObj, 
      ...toysObj, 
    }; 

    res.json(resObject); 
  }))
  .catch((error) => {
    console.log(error)
  })
})

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
