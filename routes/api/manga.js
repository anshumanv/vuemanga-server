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
  Manga.find({forUser: req.user._id})
    .then(usr => res.json(usr))
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
// DESC -       Add a new manga/update to the user profile
router.post('/', passport.authenticate('jwt', {session: false}), (req, res) => {
  // Get manga details from the request body
  const { mangaId, status, name } = req.body;
  
  
  Manga.find({ mangaId, forUser: req.user._id }, (err, count) => {
    if(count.length > 0) {
      // Manga exists in the db, don't create a new object
      res.status(500).json({ error: 'Manga already exists' })
    }
    else {
      // Create a new Manga obejct with the given data
      const manga = new Manga({
        name,
        mangaId,
        status,
        forUser: req.user._id
      })

      // 1. Save the manga
      // 2. Find the authenticated user and update the manga array by adding ID of the saved tutorial
      // 3 - Return the newly created manga
      manga
        .save()
        .then(data => {
          // console.log(data, req.user)
          User.findByIdAndUpdate(
            req.user._id,
            { $push: { mangas: data._id } },
            { new : true, upsert: true }
          )
          .then(user => res.json(user.mangas))
          .catch(err => res.status(500).json({ error: 'Not able to update the user data with the new manga', errorMsg: err}));
        })
        .catch(err => res.status(500).json({ error: 'Not able to save the new manga', errorMsg: err}));
    }
  })

});



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
    req.user._id,
    { $pull: { mangas: mangaId } },
    { multi: true, new: true }
    ).then(user => {
      console.log(user)
      Manga.findByIdAndRemove(
        mangaId, (err) => {
          console.log(err)
          if(err) {
            res.send(err)
          }
        })
        // .then(mangas => res.json(mangas))
        // .catch(err => res.status(500).json({ error: 'Not able to delete the manga', errorMsg: err}));
      res.json(user.mangas)
    })
    .catch(err => res.status(500).json({ error: 'Not able to remove the manga from the user', errorMsg: err}));
    
  });
  
  module.exports = router;
