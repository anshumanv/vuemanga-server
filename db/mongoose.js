const mongoose = require('mongoose');
const { mongoURI } = require('../config/keys');

mongoose.Promise = global.Promise;

mongoose.set('useFindAndModify', false);

mongoose
	.connect(
		mongoURI,
		{ useNewUrlParser: true }
	)
	.then(() => {
		console.log('MongoDB Connected');
	})
	.catch(err => console.log(err));

module.exports = mongoose;
