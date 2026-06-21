import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom';
import { Newspaper, LogOut, Shield, User as UserIcon, LogIn } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import NewsFeed from './components/NewsFeed';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile';
import Avatar from './components/Avatar';
import { Button } from './components/ui/button';

// Protected Route Component
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div></div>;
  if (!user) return <Navigate to="/login" />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/" />;
  
  return children;
};

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="bg-primary text-white p-2 rounded-lg">
            <Newspaper className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">
            News<span className="text-primary">Hub</span>
          </h1>
        </Link>
        
        <nav className="hidden md:flex items-center gap-6 text-sm font-bold uppercase tracking-wider">
          <Link to="/" className="transition-colors hover:text-primary">Home</Link>
          {user?.role === 'admin' && (
            <Link to="/admin" className="text-primary flex items-center gap-1 transition-colors hover:opacity-80">
              <Shield className="h-4 w-4" /> Admin
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              <Link to="/profile" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                <div className="hidden sm:flex flex-col items-end mr-1">
                  <span className="text-sm font-bold leading-tight">{user.name}</span>
                </div>
                <Avatar name={user.name} size="sm" />
              </Link>
              <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout" className="hover:text-primary transition-colors">
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild className="font-bold">
                <Link to="/login">Sign In</Link>
              </Button>
              <Button size="sm" asChild className="font-bold">
                <Link to="/register">Register</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

function AppContent() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary selection:text-white">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={
            <>
              <NewsFeed />
            </>
          } />
          
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          
          <Route path="/admin" element={
            <ProtectedRoute adminOnly>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
        </Routes>
      </main>

      <footer className="border-t border-border mt-20 py-12 bg-muted/30">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <Newspaper className="h-5 w-5 text-primary" />
            <span className="text-lg font-bold">NewsHub</span>
          </div>
          <p className="text-sm text-muted-foreground text-center md:text-left">
            &copy; {new Date().getFullYear()} NewsHub. All rights reserved. Data provided by Guardian, NewsAPI, and NYTimes.
          </p>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
