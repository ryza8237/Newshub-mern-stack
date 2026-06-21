const express = require('express');
const router = express.Router();
const Article = require('../models/Article');
const User = require('../models/User');
const Comment = require('../models/Comment');
const { protect } = require('../middleware/auth');

// @desc    Like/Unlike an article
// @route   PUT /api/social/like/:id
router.put('/like/:id', protect, async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) {
      return res.status(404).json({ success: false, message: 'Article not found' });
    }

    const user = await User.findById(req.user.id);
    if (!user.likes) user.likes = [];

    // Check if already liked
    const index = article.likes.indexOf(req.user.id);
    const userLikeIndex = user.likes.indexOf(article._id);

    if (index === -1) {
      article.likes.push(req.user.id);
      if (userLikeIndex === -1) {
        user.likes.push(article._id);
      }
    } else {
      article.likes.splice(index, 1);
      if (userLikeIndex !== -1) {
        user.likes.splice(userLikeIndex, 1);
      }
    }

    await article.save();
    await user.save();
    res.status(200).json({ 
      success: true, 
      likes: article.likes.length, 
      isLiked: article.likes.includes(req.user.id),
      userLikes: user.likes
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @desc    Add comment to article
// @route   POST /api/social/comment/:id
router.post('/comment/:id', protect, async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) {
      return res.status(404).json({ success: false, message: 'Article not found' });
    }

    const comment = await Comment.create({
      user: req.user.id,
      article: req.params.id,
      content: req.body.content
    });

    const populatedComment = await Comment.findById(comment._id).populate('user', 'name');

    res.status(201).json({ success: true, data: populatedComment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @desc    Get comments for an article
// @route   GET /api/social/comment/:id
router.get('/comment/:id', async (req, res) => {
  try {
    const comments = await Comment.find({ article: req.params.id })
      .populate('user', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: comments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @desc    Toggle bookmark for an article
// @route   PUT /api/social/bookmark/:id
router.put('/bookmark/:id', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const articleId = req.params.id;

    if (!user.bookmarks) user.bookmarks = [];

    const bookmarkIndex = user.bookmarks.findIndex(id => id.toString() === articleId);
    
    if (bookmarkIndex === -1) {
      user.bookmarks.push(articleId);
    } else {
      user.bookmarks.splice(bookmarkIndex, 1);
    }

    await user.save();
    res.status(200).json({ success: true, bookmarks: user.bookmarks });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
