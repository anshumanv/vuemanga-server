const express = require('express');
const passport = require('passport');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');

const mongoose = require('./db/mongoose');
const userRoutes = require('./routes/api/users');
const mangaRoutes = require('./routes/api/manga');

dotenv.config()

const app = express();

app.use(bodyParser.urlencoded({ extended: false}));
app.use(bodyParser.json());

app.use(passport.initialize());

require('./config/passport')(passport);

app.use(function(req, res, next) {  
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, Access-Control-Allow-Credentials");
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});

app.use('/api/users', userRoutes);
app.use('/api/manga', mangaRoutes);


const port = process.env.PORT || 5000;

app.listen(port, () => {
	console.log(`Server running on port ${port}`);
});
