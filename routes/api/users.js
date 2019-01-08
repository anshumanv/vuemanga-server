const router = require('express').Router();
const passport = require('passport');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const _ = require('lodash');

// Models
const User = require('../../models/User');
const { secretOrKey } = require('../../config/keys');

// Routes for /api/users

const userData = ['_id', 'name', 'password', 'username'];

// GET

// Get user profile
router.get('/me', passport.authenticate('jwt', {session: false}), (req, res) => {
  User.findById(req.user._id)
    .then(currentUser => {
      const user = _.pick(currentUser, userData);
      res.json({ user });
    })
    .catch(err => console.log(err))
});


// POST

// Signup API
router.post('/signup', (req,res) => {
  const { email, username, password, name } = req.body;
  
  User.findOne({
    $or: [
      {email},
      {username}
    ]
  }).then(currentUser => {
    if(currentUser) {
      throw new Error('User with this email or username exists!');
    } else {
      const newUser = new User({
        name, username, password, email
      });

      newUser.save()
        .then(newUser => {
          const user = _.pick(currentUser, userData);
          res.json({ user });
        })
        .catch(err => console.log(err));
    }   
  })
})

module.exports = router;
