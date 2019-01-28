const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcryptjs');

const UserSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  username: {
    type: String,
    trim: true
  },
  mangas: [
    {
      manga: {
        type: Schema.Types.ObjectId,
        ref: 'manga'
      },
      progress: {
        type: Number,
        default: 0
      },
      status: {
        type: String,
        enum: ['READING', 'DROPPED', 'ONHOLD', 'COMPLETED', 'PLANNED']},
        required: true
      },
    }
  ],
  favourites: [
    {
      type: Schema.Types.ObjectId,
      ref: 'manga'
    }
  ]
});

// Pre save hook on User model
UserSchema.pre('save', function(next) {
  let user = this;

  if(user.isModified('password')) {
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(user.password, salt, (err, hash) => {
        if(err) throw err;
        user.password = hash;
        next();
      })
    })
  } else {
    next();
  }
})

const User = mongoose.model('user', UserSchema);

module.exports = User;
