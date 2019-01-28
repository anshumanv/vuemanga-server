const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const MangaSchema = new Schema({
  mangaId: {
    type: String,
    required: true,
    trim: true
  },
  name: {
    type: 'String',
    required: true,
    trim: true
  },
  ratings: [
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: 'user'
      },
      score: {
        type: Number,
      }
    }
  ],
  favouritedBy: [
    {
      type: Schema.Types.ObjectId,
      ref: 'user'
    }
  ]
})


const Manga = mongoose.model('manga', MangaSchema)

module.exports = Manga;
