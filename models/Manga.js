const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const MangaSchema = new Schema({
  mangaId: {
    type: String,
    required: true,
    trim: true
  },
  forUser: {
    type: Schema.Types.ObjectId,
    ref: 'user'
  },
  name: {
    type: 'String',
    required: true,
    trim: true
  },
  progress: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['READING', 'DROPPED', 'ONHOLD', 'COMPLETED', 'PLANNED'],
    required: true
  }
})


const Manga = mongoose.model('manga', MangaSchema)

module.exports = Manga;
