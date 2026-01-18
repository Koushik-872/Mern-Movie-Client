import React, { useState } from 'react';
import { Search, User, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AuthModal } from '@/components/ui/AuthModal';

interface NavbarProps {
  onSearch?: (query: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onSearch }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const { user, isAuthenticated, logout } = useAuth();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch && searchQuery.trim()) {
      onSearch(searchQuery.trim());
    }
  };

  const handleLoginClick = () => {
    setAuthMode('login');
    setShowAuthModal(true);
  };

  const handleSignUpClick = () => {
    setAuthMode('register');
    setShowAuthModal(true);
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-sm border-b border-white/10">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          {/* Search */}
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <form onSubmit={handleSearch} className="flex items-center gap-2 flex-1">
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none text-white placeholder:text-white/60 text-sm px-3 py-2 flex-1"
              />
              <button type="submit" className="text-white/60 hover:text-white transition-colors">
                <Search size={20} />
              </button>
            </form>
          </div>

          {/* MOVENTO Logo */}
          <Link to="/" className="shrink-0">
            <h1 className="text-4xl font-bold text-red-600 tracking-tight">MOVENTO</h1>
          </Link>

          {/* User Profile */}
          <div className="flex items-center gap-3 shrink-0">
            {isAuthenticated ? (
              <>
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <User size={20} className="text-white" />
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-white text-sm font-medium">{user?.username || 'User'}</span>
                  <button
                    onClick={logout}
                    className="p-2 hover:bg-white/10 rounded transition-colors"
                    title="Logout"
                  >
                    <LogOut size={18} className="text-white/60 hover:text-white" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                {/* SIGN IN */}
                <button
                  onClick={handleLoginClick}
                  className="text-white/80 hover:text-red-600 text-sm transition-all hover:-translate-y-px"
                >
                  Sign In
                </button>

                {/* SIGN UP */}
                <button
                  onClick={handleSignUpClick}
                  className="bg-red-600 text-white hover:bg-white hover:text-red-600 px-4 py-2 rounded text-sm font-medium transition-all hover:-translate-y-px"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        mode={authMode}
      />
    </>
  );
};