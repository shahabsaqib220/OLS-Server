const express = require('express');
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
require('dotenv').config()
const bodyParser = require('body-parser');
const userregisteration = require('./modules/user-registration/user-registration-model')




app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

app.use('/api/auth', userregisteration)
app.get('/', (req, res) => {
  res.send('Hello from Express!');
});

const PORT =5000;






const connectDB = async () => {
    try {
      await mongoose.connect(process.env.MONGO_DB_URL, {});
      console.log('MongoDB Connected');
    } catch (error) {
      console.error('Error while connecting:', error);
    }
  };
  app.listen(PORT, () => {
    console.log(`Server running on PORT ${PORT}`);
    connectDB();
  });
