import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/card';
import { User, Mail, Lock, Loader2, AlertCircle, CheckCircle2, Bookmark, Heart } from 'lucide-react';
import Avatar from '../components/Avatar';
import NewsCard from '../components/NewsCard';

const Profile = () => {
  const { user, logout } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [savedArticles, setSavedArticles] = useState([]);
  const [likedArticles, setLikedArticles] = useState([]);
  const [fetchingSaved, setFetchingSaved] = useState(true);
  const [fetchingLiked, setFetchingLiked] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/user/profile');
        if (res.data.success) {
          setSavedArticles(res.data.data.bookmarks || []);
          setLikedArticles(res.data.data.likes || []);
        }
      } catch (err) {
        console.error('Failed to fetch profile:', err);
      } finally {
        setFetchingSaved(false);
        setFetchingLiked(false);
      }
    };
    fetchProfile();
  }, [user?.bookmarks, user?.likes]); // Re-fetch when bookmarks or likes change

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    
    try {
      const res = await axios.put('http://localhost:5000/api/user/profile', { name, email });
      if (res.data.success) {
        setMessage(res.data.message);
        // If email changed, logout is required to re-verify
        if (email !== user.email) {
          setTimeout(() => logout(), 3000);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    
    try {
      const res = await axios.put('http://localhost:5000/api/user/password', { currentPassword, newPassword });
      if (res.data.success) {
        setMessage(res.data.message);
        setCurrentPassword('');
        setNewPassword('');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Password update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-6 border-b border-border pb-8">
        <Avatar name={user?.name} size="lg" />
        <div>
          <h1 className="text-4xl font-black tracking-tight">{user?.name}</h1>
          <p className="text-muted-foreground font-bold uppercase tracking-widest text-sm">{user?.role} Account</p>
        </div>
      </div>

      {(message || error) && (
        <div className={`p-4 rounded-xl flex items-center gap-3 border ${message ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
          {message ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
          <p className="text-sm font-bold">{message || error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Profile Info */}
        <Card className="border-border shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" /> Profile Settings
            </CardTitle>
            <CardDescription>Update your personal information</CardDescription>
          </CardHeader>
          <form onSubmit={handleUpdateProfile}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background text-black focus:ring-2 focus:ring-primary outline-none transition-all font-medium caret-primary"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Email</label>
                <input
                  type="email"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary outline-none transition-all font-medium"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full font-bold" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Changes'}
              </Button>
            </CardFooter>
          </form>
        </Card>

        {/* Password Change */}
        <Card className="border-border shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary" /> Change Password
            </CardTitle>
            <CardDescription>Ensure your account is using a long, random password</CardDescription>
          </CardHeader>
          <form onSubmit={handleChangePassword}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Current Password</label>
                <input
                  type="password"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary outline-none transition-all font-medium"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">New Password</label>
                <input
                  type="password"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary outline-none transition-all font-medium"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" variant="outline" className="w-full font-bold border-2" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Update Password'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>

      {/* Saved Articles Section */}
      <div className="space-y-6 pt-8 border-t border-border">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black flex items-center gap-3">
            <Bookmark className="h-6 w-6 text-primary" /> Saved Articles
          </h2>
          <span className="bg-primary/10 text-primary text-xs font-black px-3 py-1 rounded-full uppercase tracking-widest">
            {savedArticles.length} Articles
          </span>
        </div>

        {fetchingSaved ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : savedArticles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedArticles.map((article) => (
              <NewsCard key={article._id} article={article} />
            ))}
          </div>
        ) : (
          <div className="bg-muted/30 border-2 border-dashed border-border rounded-3xl py-20 flex flex-col items-center justify-center text-center px-4">
            <div className="bg-background p-4 rounded-2xl shadow-sm mb-4">
              <Bookmark className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-black mb-2">No saved articles yet</h3>
            <p className="text-muted-foreground font-medium max-w-xs">
              Articles you bookmark will appear here for easy access later.
            </p>
          </div>
        )}
      </div>

      {/* Liked Articles Section */}
      <div className="space-y-6 pt-8 border-t border-border">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black flex items-center gap-3">
            <Heart className="h-6 w-6 text-primary fill-current" /> Liked Articles
          </h2>
          <span className="bg-primary/10 text-primary text-xs font-black px-3 py-1 rounded-full uppercase tracking-widest">
            {likedArticles.length} Articles
          </span>
        </div>

        {fetchingLiked ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : likedArticles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {likedArticles.map((article) => (
              <NewsCard key={article._id} article={article} />
            ))}
          </div>
        ) : (
          <div className="bg-muted/30 border-2 border-dashed border-border rounded-3xl py-20 flex flex-col items-center justify-center text-center px-4">
            <div className="bg-background p-4 rounded-2xl shadow-sm mb-4">
              <Heart className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-black mb-2">No liked articles yet</h3>
            <p className="text-muted-foreground font-medium max-w-xs">
              Articles you like will appear here for easy access later.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
