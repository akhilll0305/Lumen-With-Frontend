import React from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Sparkles, LayoutDashboard, Upload, AlertCircle, BarChart3, LogOut } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useUploadStore } from '../store/uploadStore';
import Button from './Button';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Upload', href: '/upload', icon: Upload },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
];  // { name: 'Pending Reviews', href: '/pending-reviews', icon: AlertCircle },


const AuthenticatedNav: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const { openUploadModal } = useUploadStore();

  const handleLogout = () => {
    logout();
    localStorage.removeItem('AUTH_TOKEN');
    navigate('/');
  };

  return (
    <nav className="sticky top-0 left-0 right-0 z-50 glass-card border-b border-glass-border backdrop-blur-glass">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
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
              
              // Handle Upload button separately to open modal
              if (item.name === 'Upload') {
                return (
                  <button 
                    key={item.name}
                    onClick={openUploadModal}
                    className={`flex items-center gap-2 px-4 py-2 rounded-glass ${
                      isActive
                        ? 'bg-glass-bg border border-luxe-gold/30 text-luxe-gold'
                        : 'text-text-secondary'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span className="font-medium">{item.name}</span>
                  </button>
                );
              }
              
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

          {/* Logout - Right Side */}
          <Button variant="ghost" onClick={handleLogout}>
            <LogOut className="w-4 h-4" />
            <span className="hidden lg:inline">Logout</span>
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default AuthenticatedNav;
