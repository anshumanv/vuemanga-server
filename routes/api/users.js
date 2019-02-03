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

const userData = ['_id', 'email', 'name', 'username', 'mangas', 'favorites'];
const mangaData = ['_id', 'name', 'mangaId', 'progress', 'status'];

// GET

// Get user data by username
router.get('/:username', (req, res) => {
  const { username } = req.params
  User.findOne({ username })
    .populate('mangas', mangaData)
    .then(currentUser => {
      console.log(currentUser)
      const user = _.pick(currentUser, userData);
      res.json({ user });
    })
    .catch(err => res.status(404).json({ error: 'No profile found', errorMsg: err}));
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
      res.status(400).json({ error: 'User with this email or username already exists.' })
    } else {
      const newUser = new User({
        name, username, password, email
      });

      newUser.save()
        .then(newUser => {
          const user = _.pick(newUser, userData);
          const jwtPayload = {
            _id: newUser._id,
            email: newUser.email,
            username: newUser.username,
            name: newUser.name
          }
          jwt.sign(jwtPayload, secretOrKey, { expiresIn: 12 * 60 * 60 * 60 }, (err, token) => {
            res.status(201).json({ user, token: `Bearer ${token}`})
          })
        })
        .catch(err => res.status(500).json({ error: 'Failed to save the user', errorMsg: err}));
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
              _id: user._id,
              email: user.email,
              username: user.username,
              name: user.name
            };

            jwt.sign(payload, secretOrKey, { expiresIn: 12 * 60 * 60 * 60 }, (err, token) => {
              res.json({ success: true, token: `Bearer ${token}`})
            })
          } else {
            return res.status(404).json({ error: 'Incorrect Password'});
          }
        })
      }
    })
})


// PUT

// Update the profile of the user
router.put('/profile', passport.authenticate('jwt', {session: false}), (req, res) => {
  const { name, username } = req.body
  User.findByIdAndUpdate(
    req.user._id,
    { $set: { username, name }},
    { new: true }
  ).then(user => res.json(user))
  .catch(err => res.status(400).json({ error: 'Username is already taken', errorMsg: err}));
});

module.exports = router;
