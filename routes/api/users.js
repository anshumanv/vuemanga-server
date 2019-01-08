const router = require('express').Router();
const passport = require('passport');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const { userRegistrationValidation, userLoginValidation } = require('../../utils/userValidation');


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
  const { error, valid } = userRegistrationValidation(req.body);

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
          const user = _.pick(newUser, userData);
          res.json({ user });
        })
        .catch(err => console.log(err));
    }   
  })
})


// Login API
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  const { error, valid } = userLoginValidation(req.body);
  
  User.findOne({ email })
    .then(user => {
      if(!user) {
        return res.status(404).json({ error: 'User not found' });
      } else {
        bcrypt.compare(password, user.password).then(isMatch => {
          if(isMatch) {
            const payload = {
              id: user.id,
              email: user.email,
              username: user.username,
              name: user.name
            };

            jwt.sign(payload, secretOrKey, { expiresIn: 12 * 60 * 60 }, (err, token) => {
              res.json({ token: `Bearer ${token}`})
            })
          } else {
            return res.status(404).json({ error: 'Incorrect Password'});
          }
        })
      }
    })
})

module.exports = router;
