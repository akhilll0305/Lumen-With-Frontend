import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Sparkles, LayoutDashboard, PlusCircle, BarChart3, LogOut, User, Eye, Edit } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import Button from './Button';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Add Transaction', href: '/add-transaction', icon: PlusCircle },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
];  // { name: 'Pending Reviews', href: '/pending-reviews', icon: AlertCircle },


const AuthenticatedNav: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const profileButtonRef = useRef<HTMLButtonElement>(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 });

  const handleLogout = () => {
    logout();
    localStorage.removeItem('AUTH_TOKEN');
    navigate('/');
  };

  // Calculate menu position when opening
  const toggleProfileMenu = () => {
    if (!isProfileMenuOpen && profileButtonRef.current) {
      const rect = profileButtonRef.current.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right,
      });
    }
    setIsProfileMenuOpen(!isProfileMenuOpen);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="sticky top-0 left-0 right-0 z-50 glass-card border-b border-glass-border backdrop-blur-glass">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between relative">
          {/* Logo - Left Side */}
          <Link to="/">
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="relative"
              >
                <Sparkles className="w-8 h-8 text-luxe-gold drop-shadow-[0_0_10px_rgba(212,175,55,0.5)]" />
              </motion.div>
              <span className="text-3xl font-heading font-bold tracking-wider gradient-text-premium">LUMEN</span>
            </div>
          </Link>

          {/* Navigation Links - Center */}
          <div className="hidden md:flex items-center gap-6">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              
              return (
                <Link key={item.name} to={item.href}>
                  <div
                    className={`flex items-center gap-2 px-4 py-2 rounded-glass ${
                      isActive
                        ? 'bg-glass-bg border border-luxe-gold/30 text-luxe-gold'
                        : 'text-text-secondary'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span className="font-medium">{item.name}</span>
                  </div>
                </Link>
              );
            })}
            
            {/* Features and Benefits Links */}
            <a 
              href="#features" 
              className="text-text-secondary font-medium px-4 py-2"
            >
              Features
            </a>
            <a 
              href="#benefits" 
              className="text-text-secondary font-medium px-4 py-2"
            >
              Benefits
            </a>
          </div>

          {/* Profile Menu & Logout - Right Side */}
          <div className="flex items-center gap-3 relative">
            {/* Profile Dropdown */}
            <div className="relative" ref={profileMenuRef}>
              <button
                ref={profileButtonRef}
                onClick={toggleProfileMenu}
                className="p-2 rounded-full hover:bg-glass-bg transition-colors"
                aria-label="Profile Menu"
              >
                <User className="w-5 h-5 text-text-secondary hover:text-cyan transition-colors" />
              </button>

              <AnimatePresence>
                {isProfileMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="fixed w-56 glass-card border border-glass-border rounded-lg shadow-xl overflow-hidden"
                    style={{ 
                      top: `${menuPosition.top}px`,
                      right: `${menuPosition.right}px`,
                      zIndex: 9999
                    }}
                  >
                    <div className="py-2">
                      <button
                        onClick={() => {
                          navigate('/view-profile');
                          setIsProfileMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-text-secondary hover:bg-glass-bg hover:text-cyan transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        <span className="font-medium">View Profile</span>
                      </button>
                      <button
                        onClick={() => {
                          navigate('/update-profile');
                          setIsProfileMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-text-secondary hover:bg-glass-bg hover:text-cyan transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                        <span className="font-medium">Update Profile</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Logout Button */}
            <Button variant="ghost" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
              <span className="hidden lg:inline">Logout</span>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default AuthenticatedNav;
