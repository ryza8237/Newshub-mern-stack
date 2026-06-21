const express = require('express');
const router = express.Router();
const newsService = require('../services/newsService');
const Article = require('../models/Article');

// Get aggregated news (fetches from APIs, saves to DB, then returns from DB)
router.get('/', async (req, res) => {
  console.log('GET /api/news request received');
  try {
    const { sources, search, refresh } = req.query;
    
    // Check if we have articles in the DB
    const dbCount = await Article.countDocuments();

    // 1. Fetch fresh news if DB is empty, no search/filter is active, OR a refresh/search is requested
    if (dbCount < 10 || (!search && !sources) || refresh === 'true' || search) {
      console.log(`Fetching fresh news from APIs (Reason: ${refresh === 'true' ? 'Manual Refresh' : search ? 'Live Search: ' + search : 'Initial Load'})...`);
      const freshNews = await newsService.fetchAndAggregateNews(search);
      console.log(`Fetched ${freshNews.length} fresh articles`);
      if (freshNews.length > 0) {
        for (const item of freshNews) {
          if (item.url) {
            await Article.findOneAndUpdate(
              { url: item.url }, 
              item, 
              { upsert: true, new: true, setDefaultsOnInsert: true }
            ).catch(err => {});
          }
        }
      }
    }

    // 2. Build Query
    let query = {};
    
    if (sources) {
      const sourceList = sources.split(',');
      // Use provider instead of source for reliable filtering
      query.provider = { $in: sourceList };
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // 3. Retrieve the latest news from DB
    const news = await Article.find(query).sort({ publishedAt: -1, _id: -1 }).limit(100);
    console.log(`Returning ${news.length} articles to frontend`);
    
    res.json({ success: true, count: news.length, data: news });
  } catch (error) {
    console.error('Error fetching news:', error);
    
    // Fallback: Return whatever we have in the database if API fails
    try {
      const fallbackNews = await Article.find().sort({ publishedAt: -1 }).limit(100);
      res.status(500).json({ 
        success: false, 
        message: 'Error fetching from APIs, showing cached news', 
        error: error.message,
        data: fallbackNews
      });
    } catch (dbError) {
      res.status(500).json({ success: false, message: 'Server error', error: dbError.message });
    }
  }
});

module.exports = router;
