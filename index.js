const express = require('express');
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
require('dotenv').config()
const bodyParser = require('body-parser');
const userregisteration = require('./modules/user-registration/main-router');
const connectDB = require('./db');




app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

app.use('/api/auth', userregisteration)
app.get('/', (req, res) => {
  res.send('Hello from Express!');
});

const PORT =5000;






  app.listen(PORT, () => {
    console.log(`Server running on PORT ${PORT}`);
    
  });
