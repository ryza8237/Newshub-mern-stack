const axios = require('axios');

// Helper to normalize Guardian data
const normalizeGuardian = (articles) => {
  return articles.map(article => ({
    title: article.webTitle,
    description: article.fields?.trailText || '',
    url: article.webUrl,
    imageUrl: article.fields?.thumbnail || null,
    source: 'The Guardian',
    provider: 'The Guardian',
    publishedAt: new Date(article.webPublicationDate),
    content: article.fields?.bodyText || ''
  }));
};

// Helper to normalize NewsAPI data
const normalizeNewsAPI = (articles) => {
  return articles.map(article => ({
    title: article.title,
    description: article.description || '',
    url: article.url,
    imageUrl: article.urlToImage || null,
    source: article.source.name || 'NewsAPI',
    provider: 'NewsAPI',
    publishedAt: new Date(article.publishedAt),
    content: article.content || ''
  })).filter(a => a.title && a.url && a.title !== '[Removed]');
};

// Helper to normalize NYTimes data
const normalizeNYTimes = (articles) => {
  return articles.map(article => {
    // NYTimes images are often in multimedia array
    let imageUrl = null;
    if (article.multimedia && article.multimedia.length > 0) {
      const image = article.multimedia.find(m => m.type === 'image' && m.format === 'Super Jumbo') || article.multimedia[0];
      if (image && image.url) {
        imageUrl = image.url.startsWith('http') ? image.url : `https://www.nytimes.com/${image.url}`;
      }
    }

    return {
      title: article.headline?.main || article.title,
      description: article.abstract || article.lead_paragraph || '',
      url: article.web_url || article.url,
      imageUrl: imageUrl,
      source: 'New York Times',
      provider: 'New York Times',
      publishedAt: new Date(article.pub_date || article.published_date),
      content: article.lead_paragraph || ''
    };
  });
};

const fetchAndAggregateNews = async (query = '') => {
  let aggregatedNews = [];

  const guardianKey = process.env.GUARDIAN_API_KEY;
  const newsApiKey = process.env.NEWSAPI_KEY;
  const nytimesKey = process.env.NYTIMES_API_KEY;

  console.log(`Fetching news from sources (Query: ${query || 'None'})...`);
  const promises = [];

  // 1. Fetch from Guardian
  if (guardianKey && guardianKey !== 'your_guardian_api_key_here') {
    const q = query ? encodeURIComponent(query) : 'news';
    console.log(`Requesting The Guardian with query: ${q}...`);
    promises.push(
      axios.get(`https://content.guardianapis.com/search?q=${q}&show-fields=thumbnail,trailText,bodyText&page-size=20&api-key=${guardianKey}`)
        .then(res => {
          const articles = res.data?.response?.results || [];
          console.log(`Guardian: Found ${articles.length} articles`);
          return normalizeGuardian(articles);
        })
        .catch(err => {
          console.error('Guardian API Error:', err.response?.data?.message || err.message);
          return [];
        })
    );
  }

  // 2. Fetch from NewsAPI
  if (newsApiKey && newsApiKey !== 'your_newsapi_key_here') {
    const endpoint = query 
      ? `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&pageSize=20&apiKey=${newsApiKey}`
      : `https://newsapi.org/v2/top-headlines?language=en&pageSize=20&apiKey=${newsApiKey}`;
    
    console.log(`Requesting NewsAPI: ${query ? 'Search' : 'Top Headlines'}...`);
    promises.push(
      axios.get(endpoint, {
        headers: { 'User-Agent': 'NewsHub-App' }
      })
        .then(res => {
          const articles = res.data?.articles || [];
          console.log(`NewsAPI: Found ${articles.length} articles`);
          return normalizeNewsAPI(articles);
        })
        .catch(err => {
          console.error('NewsAPI Error:', err.response?.data?.message || err.message);
          return [];
        })
    );
  }

  // 3. Fetch from NYTimes
  if (nytimesKey && nytimesKey !== 'your_nytimes_api_key_here') {
    const endpoint = query
      ? `https://api.nytimes.com/svc/search/v2/articlesearch.json?q=${encodeURIComponent(query)}&api-key=${nytimesKey}`
      : `https://api.nytimes.com/svc/topstories/v2/home.json?api-key=${nytimesKey}`;

    console.log(`Requesting NYTimes: ${query ? 'Article Search' : 'Top Stories'}...`);
    promises.push(
      axios.get(endpoint)
        .then(res => {
          const articles = query ? (res.data?.response?.docs || []) : (res.data?.results || []);
          console.log(`NYTimes: Found ${articles.length} articles`);
          return normalizeNYTimes(articles.slice(0, 20));
        })
        .catch(err => {
          console.error('NYTimes API Error:', err.response?.data?.message || err.message);
          return [];
        })
    );
  }

  // Await all API calls concurrently
  const results = await Promise.all(promises);
  
  // Flatten array of arrays
  results.forEach(sourceNews => {
    aggregatedNews = [...aggregatedNews, ...sourceNews];
  });

  return aggregatedNews;
};

module.exports = {
  fetchAndAggregateNews
};
