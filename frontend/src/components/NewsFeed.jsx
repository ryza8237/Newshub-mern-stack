import React, { useState, useEffect } from 'react';
import axios from 'axios';
import NewsCard from './NewsCard';
import { Loader2, AlertCircle, RefreshCw, Search, Filter } from 'lucide-react';
import { Button } from './ui/button';

const NewsFeed = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedSources, setSelectedSources] = useState(['The Guardian', 'NewsAPI', 'New York Times']);

  const sources = [
    { id: 'The Guardian', label: 'The Guardian' },
    { id: 'NewsAPI', label: 'NewsAPI' },
    { id: 'New York Times', label: 'NYTimes' }
  ];

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const toggleSource = (sourceId) => {
    setSelectedSources(prev => 
      prev.includes(sourceId) 
        ? prev.filter(s => s !== sourceId) 
        : [...prev, sourceId]
    );
  };

  const fetchNews = async (forceRefresh = false) => {
    setLoading(true);
    if (forceRefresh) setNews([]); // Clear news on manual refresh to show loader
    setError(null);
    try {
      const params = new URLSearchParams();
      if (debouncedSearch) params.append('search', debouncedSearch);
      if (selectedSources.length > 0) params.append('sources', selectedSources.join(','));
      if (forceRefresh) params.append('refresh', 'true');
      params.append('_', Date.now().toString()); // Prevent browser caching

      const response = await axios.get(`http://localhost:5000/api/news?${params.toString()}`);
      if (response.data && response.data.data) {
        setNews(response.data.data);
      } else {
        setNews([]);
      }
    } catch (err) {
      console.error('Failed to fetch news:', err);
      if (err.response?.data?.data) {
        setNews(err.response.data.data);
        setError('Failed to fetch fresh news. Showing cached articles.');
      } else {
        setError('Failed to connect to the server. Please ensure the backend is running.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, [debouncedSearch, selectedSources]);

  return (
    <div className="w-full">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-12 bg-muted/20 p-6 rounded-2xl border border-border">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search global news..."
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Source Filters */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 text-sm font-black uppercase tracking-tighter text-muted-foreground mr-2">
            <Filter className="h-4 w-4" /> Filter By Source:
          </div>
          <div className="flex flex-wrap gap-2">
            {sources.map(source => (
              <button
                key={source.id}
                onClick={() => toggleSource(source.id)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                  selectedSources.includes(source.id)
                    ? 'bg-black text-white border-black'
                    : 'bg-background text-muted-foreground border-border hover:border-black'
                }`}
              >
                {source.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center mb-8 border border-red-200 shadow-sm">
          <AlertCircle className="h-5 w-5 mr-3 flex-shrink-0" />
          <p className="text-sm font-bold">{error}</p>
        </div>
      )}

      {news.length === 0 && !loading ? (
        <div className="text-center py-32 bg-muted/30 rounded-3xl border border-dashed border-border">
          <p className="text-xl font-bold text-muted-foreground">No articles match your criteria.</p>
          <p className="text-muted-foreground mt-2 text-sm">Try adjusting your filters or search term.</p>
          <Button variant="link" onClick={() => { setSearchTerm(''); setSelectedSources(['The Guardian', 'NewsAPI', 'New York Times']); }} className="mt-4 font-bold">
            Clear all filters
          </Button>
        </div>
      ) : (
        <>
          <div className="mb-6 flex items-center justify-between">
            <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
              Showing {news.length} results
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {news.map((article) => (
              <NewsCard key={article._id || article.url} article={article} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default NewsFeed;
