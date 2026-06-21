const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  url: {
    type: String,
    required: true,
    unique: true
  },
  imageUrl: {
    type: String
  },
  source: {
    type: String,
    required: true
  },
  provider: {
    type: String,
    enum: ['The Guardian', 'NewsAPI', 'New York Times'],
    required: true
  },
  publishedAt: {
    type: Date,
    required: true
  },
  content: {
    type: String
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, { timestamps: true });

module.exports = mongoose.model('Article', articleSchema);
