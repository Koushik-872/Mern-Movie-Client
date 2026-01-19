import React, { useState, useEffect } from "react";
import { Search, User, LogOut, Menu } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { AuthModal } from "@/components/ui/AuthModal";
import { Sidebar } from "./Sidebar";

interface NavbarProps {
  onSearch?: (query: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onSearch }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScroll, setLastScroll] = useState(0);

  const { user, isAuthenticated, logout } = useAuth();

  // ===== Scroll Effect =====
  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.scrollY;
      if (currentScroll > lastScroll && currentScroll > 50) {
        setShowNavbar(false); // scrolling down → hide
      } else {
        setShowNavbar(true); // scrolling up → show
      }
      setLastScroll(currentScroll);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScroll]);

  // ===== Auto-hide after 3 seconds =====
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowNavbar(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch && searchQuery.trim()) {
      onSearch(searchQuery.trim());
      setMobileSearchOpen(false);
    }
  };

  const handleLoginClick = () => {
    setAuthMode("login");
    setShowAuthModal(true);
  };

  const handleSignUpClick = () => {
    setAuthMode("register");
    setShowAuthModal(true);
  };

  return (
    <>
      {/* Navbar */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-sm border-b border-white/10 transition-transform duration-500 ${
          showNavbar ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="mx-auto w-full px-4 py-2 flex items-center justify-between gap-2 overflow-hidden">
          {/* Mobile Hamburger */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="p-2 text-white/80 hover:bg-white/10 rounded transition"
            >
              <Menu size={22} />
            </button>
          </div>

          {/* Logo with Fade */}
          <div className="flex-shrink-0 flex items-center justify-start min-w-[180px] lg:min-w-[200px]">
            <Link to="/" className="w-full">
              <h1
                className={`text-lg sm:text-xl lg:text-2xl font-bold text-red-600 tracking-tight truncate transition-opacity duration-500 ${
                  showNavbar ? "opacity-100" : "opacity-50"
                }`}
              >
                MOVENTO
              </h1>
            </Link>
          </div>

          {/* Desktop Search */}
          <div className="hidden md:flex justify-center flex-1 px-2">
            <form
              onSubmit={handleSearch}
              className="flex items-center gap-2 w-full max-w-[400px]" // limit search bar width
            >
              <input
                type="text"
                placeholder="Search movies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none text-white placeholder:text-white/60 text-sm px-3 py-2 flex-1"
              />
              <button
                type="submit"
                className="text-white/60 hover:text-white transition-colors"
              >
                <Search size={20} />
              </button>
            </form>
          </div>

          {/* Right Section (Desktop Only) */}
          <div className="hidden md:flex items-center gap-2 shrink-0 ml-auto">
            {isAuthenticated ? (
              <>
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                  <User size={18} className="text-white" />
                </div>
                <span className="text-white text-sm font-medium">
                  {user?.username || "User"}
                </span>
                <button
                  onClick={logout}
                  className="p-2 hover:bg-white/10 rounded transition-colors"
                  title="Logout"
                >
                  <LogOut
                    size={18}
                    className="text-white/60 hover:text-white"
                  />
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleLoginClick}
                  className="text-white/80 hover:text-red-600 text-sm whitespace-nowrap transition-all"
                >
                  Sign In
                </button>

                <button
                  onClick={handleSignUpClick}
                  className="bg-red-600 text-white hover:bg-white hover:text-red-600 px-3 py-1.5 rounded text-sm font-medium whitespace-nowrap transition-all"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>

          {/* Mobile Search Toggle */}
          <button
            onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
            className="md:hidden p-2 text-white/70 hover:bg-white/10 rounded transition"
          >
            <Search size={20} />
          </button>
        </div>

        {/* Mobile / Secondary Row */}
        <div className="md:hidden flex flex-col gap-2 px-4 pb-3">
          {mobileSearchOpen && (
            <form onSubmit={handleSearch} className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Search movies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-black border border-white/20 rounded px-3 py-2 text-white text-sm outline-none focus:ring-1 focus:ring-red-600"
              />
              <button
                type="submit"
                className="text-white/70 p-2 hover:text-white"
              >
                <Search size={20} />
              </button>
            </form>
          )}

          {!isAuthenticated ? (
            <div className="flex gap-3">
              <button
                onClick={handleLoginClick}
                className="flex-1 border border-white/20 text-white py-2 rounded text-sm hover:bg-white/10 transition"
              >
                Sign In
              </button>

              <button
                onClick={handleSignUpClick}
                className="flex-1 bg-red-600 text-white py-2 rounded text-sm font-medium hover:bg-red-700 transition"
              >
                Sign Up
              </button>
            </div>
          ) : (
            <div className="flex gap-3">
              <div className="flex-1 flex items-center gap-2 border border-white/20 rounded px-3 py-2">
                <User size={18} className="text-white" />
                <span className="text-white text-sm font-medium truncate">
                  {user?.username || "User"}
                </span>
              </div>
              <button
                className="flex-1 bg-red-600 text-white py-2 rounded text-sm font-medium hover:bg-red-700 transition"
                onClick={logout}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Mobile Sidebar */}
      <Sidebar
        isOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
      />

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        mode={authMode}
      />
    </>
  );
};
