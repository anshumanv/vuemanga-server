const express = require('express');
const passport = require('passport');
const bodyParser = require('body-parser');

const mongoose = require('./db/mongoose');
const userRoutes = require('./routes/api/users');

const app = express();

app.use(bodyParser.urlencoded({ extended: false}));
app.use(bodyParser.json());

app.use(passport.initialize());

require('./config/passport')(passport);

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use('/api/users', userRoutes);

const port = process.env.PORT || 5000;

app.listen(port, () => {
	console.log(`Server running on port ${port}`);
});
