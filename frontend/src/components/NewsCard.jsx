import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { ExternalLink, Heart, Bookmark, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import Avatar from './Avatar';

const NewsCard = ({ article }) => {
  const { user, updateUser } = useAuth();
  const [likes, setLikes] = useState(article.likes?.length || 0);
  const [isLiked, setIsLiked] = useState(
    user?.likes?.some(id => (id._id || id) === article._id) || 
    article.likes?.some(id => (id._id || id) === user?.id) || 
    false
  );
  const [isBookmarked, setIsBookmarked] = useState(user?.bookmarks?.some(id => (id._id || id) === article._id) || false);

  useEffect(() => {
    setIsBookmarked(user?.bookmarks?.some(id => (id._id || id) === article._id) || false);
    setIsLiked(
      user?.likes?.some(id => (id._id || id) === article._id) || 
      article.likes?.some(id => (id._id || id) === user?.id) || 
      false
    );
  }, [user?.bookmarks, user?.likes, article._id, article.likes, user?.id]);

  const formattedDate = article.publishedAt 
    ? format(new Date(article.publishedAt), 'MMM dd, yyyy')
    : 'Unknown Date';

  const handleLike = async (e) => {
    e.preventDefault();
    if (!user) return alert('Please login to like news');
    
    try {
      const res = await axios.put(`http://localhost:5000/api/social/like/${article._id}`);
      if (res.data.success) {
        setLikes(res.data.likes);
        setIsLiked(res.data.isLiked);
        if (res.data.userLikes) {
          updateUser({ likes: res.data.userLikes });
        }
      }
    } catch (err) {
      console.error('Like failed:', err);
    }
  };

  const handleBookmark = async (e) => {
    e.preventDefault();
    if (!user) return alert('Please login to bookmark news');

    try {
      const res = await axios.put(`http://localhost:5000/api/social/bookmark/${article._id}`);
      if (res.data.success) {
        updateUser({ bookmarks: res.data.bookmarks });
        setIsBookmarked(!isBookmarked);
      }
    } catch (err) {
      console.error('Bookmark failed:', err);
    }
  };

  return (
    <Card className="flex flex-col h-full overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 border-border group relative">
      {article.imageUrl && (
        <div className="w-full h-48 overflow-hidden bg-muted relative">
          <img 
            src={article.imageUrl} 
            alt={article.title} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            onError={(e) => {
              e.target.onerror = null;
              e.target.style.display = 'none';
            }}
          />
          <div className="absolute top-2 right-2 flex gap-2">
            <button 
              onClick={handleBookmark}
              className={`p-1.5 rounded-lg backdrop-blur transition-all duration-300 ${isBookmarked ? 'bg-primary text-white scale-110 shadow-lg' : 'bg-white/90 text-muted-foreground hover:text-primary hover:scale-105'}`}
            >
              <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
            </button>
            <div className="bg-white/90 backdrop-blur px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest shadow-sm flex items-center">
              {article.source}
            </div>
          </div>
        </div>
      )}
      {!article.imageUrl && (
        <button 
          onClick={handleBookmark}
          className={`absolute top-4 right-4 p-1.5 rounded-lg backdrop-blur z-10 transition-all duration-300 ${isBookmarked ? 'bg-primary text-white scale-110 shadow-lg' : 'bg-muted text-muted-foreground hover:text-primary hover:scale-105'}`}
        >
          <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
        </button>
      )}
      <CardHeader className="flex-grow pb-4">
        <div className="flex justify-between items-center mb-3">
          <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-2 py-1 rounded">
            Headline
          </span>
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{formattedDate}</span>
        </div>
        <CardTitle className="text-lg font-black leading-tight line-clamp-3 group-hover:text-primary transition-colors">
          {article.title}
        </CardTitle>
        <CardDescription className="mt-3 line-clamp-3 text-foreground/70 text-sm font-medium">
          {article.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pb-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={handleLike}
            className={`flex items-center gap-1.5 text-xs font-black transition-colors ${isLiked ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}
          >
            <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
            {likes}
          </button>
        </div>
      </CardContent>

      <CardFooter className="pt-0 border-t border-border mt-auto pt-4 flex gap-2">
        <Button 
          variant="outline" 
          className="flex-1 text-xs font-black uppercase tracking-widest border-2"
          asChild
        >
          <a href={article.url} target="_blank" rel="noopener noreferrer">
            Read Full <ExternalLink className="ml-1.5 h-3 w-3" />
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default NewsCard;
