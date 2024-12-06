const express = require('express');
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
require('dotenv').config()
const bodyParser = require('body-parser');
const userregisteration = require('./modules/user-registration/main-router');
const userlogin = require("./modules/user-login/main-router")
const userads = require('./modules/user-ads/main-router')
const connectDB = require('./db');
const user_updated_ad = require("./modules/user-existing-edited-ad/main-router")
const adsdetails = require("./modules/details-of-product/main-router")




app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

app.use('/api/auth', userregisteration)
app.use('/api/userlogin', userlogin )
app.use('/api/user-ads',userads  )
app.use('/api/product/details',adsdetails  )
app.use('/api/updated/user', user_updated_ad)





app.get('/', (req, res) => {
  res.send('Hello from Express! Mera ywr pindi da mera dildar pindi da');
});

const PORT =5000;






  app.listen(PORT, () => {
    console.log(`Server running on PORT ${PORT}`);
    
  });
