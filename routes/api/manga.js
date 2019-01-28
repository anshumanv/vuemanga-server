const router = require('express').Router();
const passport = require('passport');
const mongoose = require('mongoose');
const _ = require('lodash');


// Models
const Manga = require('../../models/Manga');
const User = require('../../models/User');

// Routes for /api/manga

// Data used
const mangaData = ['_id', 'mangaId', 'name', 'status', 'progress'];


// GET

// Get all of the user manga
// ROUTE -    /api/manga
// DESC -     Get all mangas of the user 
router.get('/', passport.authenticate('jwt', { session: false }), (req, res) => {
  User.findById(req.user._id)
    .then(usr => res.json({ mangas: usr.mangas }))
});

// ROUTE -    /api/manga/favourites
// DESC -     Get all favourites of the user 
router.get('/favourites', passport.authenticate('jwt', { session: false }), (req, res) => {
  User.findById(req.user._id)
    .then(usr => res.json({ favourites: usr.favourites }))
});


// <--------------------------------->


// POST

// ROUTE -      /api/manga
// DESC -       Add a new manga to the user profile
router.post('/', passport.authenticate('jwt', {session: false}), async (req, res) => {
  // Get manga details from the request body
  const { mangaId, status, name } = req.body;
  
  // Create a new Manga obejct with the given data
  const manga = new Manga({
    name,
    mangaId
  })

  // 1. Save the manga
  // 2. Find the authenticated user and update the manga array by adding ID of the saved tutorial
  // 3 - Return the newly created manga
  manga
    .save()
    .then(data => {
      console.log(data, req.user)
      User.findByIdAndUpdate(
        req.user._id,
        { $push: { mangas: { _id: data._id, progress: 0, status } } },
        { new : true, upsert: true }
      )
      .then(user => res.json(user.mangas))
      .catch(err => res.status(500).json({ error: 'Not able to update the user data with the new manga', errorMsg: err}));
    })
    .catch(err => res.status(500).json({ error: 'Not able to save the new manga', errorMsg: err}));
});

module.exports = router;


// <--------------------------------->

// DELETE

// ROUTE -      /api/manga/:mangaId
// DESC -       Delete a manga from the user profile
router.delete('/:mangaId', passport.authenticate('jwt', {session: false}), (req, res) => {
  // Reject if the manga id is not valid
  const { mangaId } = req.params
  
  if(!mongoose.Types.ObjectId.isValid(mangaId))
    return res.status(400).json({ error: 'Invalid mangaId' });
  
  User.findByIdAndUpdate(
    req.user.id,
    { $pull: { mangas: { mangaId }} },
    { multi: true }
  ).then(user => res.json(user.mangas))
  .catch(err => res.status(500).json({ error: 'Not able to delete the manga', errorMsg: err}));
  
});

module.exports = router;

