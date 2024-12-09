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
const securityOptions = require("./modules/user-change-password/main-router")
const filteredAds = require("./modules/user-filtered-ads-and-cart-item/main-router")




app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors({
  origin: 'https://buy-sell-product-client.vercel.app', // Replace with your client's URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Add methods you need
  credentials: true // Include if using cookies or authentication headers
}));

app.use('/api/auth', userregisteration)
app.use('/api/userlogin', userlogin )
app.use('/api/user-ads',userads  )
app.use('/api/product/details',adsdetails  )
app.use('/api/updated/user', user_updated_ad)
app.use('/api/security/options', securityOptions)
app.use('/api/filtering', filteredAds)





app.get('/', (req, res) => {
  res.send('Hello from Express! Mera ywr pindi da mera dildar pindi da');
});

const PORT =5000;






  app.listen(PORT, () => {
    console.log(`Server running on PORT ${PORT}`);
    
  });
