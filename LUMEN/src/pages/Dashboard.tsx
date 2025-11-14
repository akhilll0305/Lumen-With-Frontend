import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { DollarSign, TrendingUp, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import StatCard from '../components/StatCard';
import ProgressBar from '../components/ProgressBar';
import GlassmorphismCard from '../components/GlassmorphismCard';
import AnimatedBackground from '../components/AnimatedBackground';
import SlideUpReveal from '../components/SlideUpReveal';
import AuthenticatedNav from '../components/AuthenticatedNav';
import { mockTransactions, formatRelativeTime, formatCurrency } from '../utils/mockData';
import { API_ENDPOINTS, getAuthHeaders } from '../config/api';
const categoryIcons: Record<string, string> = {
  Dining: '☕',
  Groceries: '🛒',
  Transport: '⛽',
  Electronics: '💻',
};

export default function Dashboard() {

  const [userName, setUserName] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('AUTH_TOKEN');
    if (!token) return;

    (async () => {
      try {
        const res = await fetch(API_ENDPOINTS.USERS.ME, {
          headers: getAuthHeaders(),
        });
        if (!res.ok) return;
        const data = await res.json();
        // data should contain user object with name and avatar_url
        if (data && data.user) {
          setUserName(data.user.name || null);
          setAvatarUrl(data.user.avatar_url || null);
        } else if (data && data.name) {
          // fallback if controller returns the user directly
          setUserName(data.name || null);
          setAvatarUrl(data.avatar_url || null);
        }
      } catch (err) {
        console.error('Failed to fetch current user', err);
      }
    })();
  }, []);

  const currentDate = new Date();
  const dateStr = currentDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const timeStr = currentDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
    timeZoneName: 'short',
  });

  const monthlySpending = 1247.0;
  const budget = 1500.0;
  const pendingReviews = mockTransactions.filter((t) => t.status === 'flagged').length;
  const confirmedTransactions = mockTransactions.filter((t) => t.status === 'confirmed');
  const insights = [
    'You spent 15% more on dining this week',
    'Coffee purchases up - consider brewing at home',
    "Great! You're under grocery budget by $50",
  ];

  return (
  <div className="min-h-screen pb-20 relative">
      {/* Authenticated Navigation */}
      <AuthenticatedNav />
      
      {/* Premium Animated Background */}
      <AnimatedBackground />
      
      {/* Additional animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-20 right-10 w-96 h-96 bg-cyan/5 rounded-full blur-3xl animate-pulse-soft" />
        <div className="absolute bottom-40 left-10 w-80 h-80 bg-purple/5 rounded-full blur-3xl animate-pulse-soft [animation-delay:1.5s]" />
      </div>

      {/* Hero / Welcome (half screen) */}
  <div className="mb-8 relative overflow-hidden z-10 pt-24">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="h-[50vh] w-full flex flex-row items-center justify-between gap-12"
          >
            {/* Left: Welcome message */}
            <motion.div 
              className="flex-1 flex flex-col justify-center"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <motion.h1 
                className="text-5xl md:text-6xl font-bold mb-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <span className="text-white">👋 Welcome back, {userName ? userName.split(' ')[0].toLowerCase() : 'user'}</span>
              </motion.h1>
              <motion.p 
                className="text-text-secondary mb-6 text-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                {dateStr} • {timeStr}
              </motion.p>
              <motion.p 
                className="text-text-secondary max-w-2xl leading-relaxed text-base"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                Great to see you again! Here's a quick summary of your account and recent activity. You can upload receipts, review flagged transactions, or connect your email to import statements.
              </motion.p>
            </motion.div>

            {/* Right: Large Avatar Circle */}
            <motion.div 
              className="flex-shrink-0 flex items-center justify-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <motion.div 
                className="w-80 h-80 rounded-full overflow-hidden shadow-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center relative"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {/* Show user's avatar or initials */}
                {avatarUrl ? (
                  <img 
                    src={avatarUrl} 
                    alt={userName ? `${userName.split(' ')[0]}'s avatar` : 'User avatar'} 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-9xl font-bold text-white">
                    {userName ? userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'SH'}
                  </div>
                )}
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-3 gap-6 mb-8 relative z-10">
        <SlideUpReveal delay={0}>
          <StatCard
            title="Monthly Spending"
            value={monthlySpending}
            prefix="$"
            change={12}
            icon={DollarSign}
            variant="primary"
          />
        </SlideUpReveal>
        <SlideUpReveal delay={0.1}>
          <motion.div 
          className="glass-card p-6 rounded-xl relative overflow-hidden group"
          whileHover={{ scale: 1.02, y: -5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-success/0 to-success/0 group-hover:from-success/5 group-hover:to-success/10 transition-all duration-300" />
          <div className="flex items-start justify-between mb-4 relative z-10">
            <motion.div 
              className="p-3 rounded-lg bg-success/10 text-success"
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
            >
              <TrendingUp className="w-6 h-6" />
            </motion.div>
          </div>
          <h3 className="text-text-secondary text-sm font-medium mb-2 relative z-10">Spending vs Budget</h3>
          <div className="text-3xl font-bold mb-4 relative z-10 gradient-text">
            {((monthlySpending / budget) * 100).toFixed(0)}%
          </div>
          <ProgressBar current={monthlySpending} max={budget} color="success" showPercentage={false} />
          <p className="text-sm text-text-secondary mt-2 relative z-10">
            ${(budget - monthlySpending).toFixed(2)} left
          </p>
        </motion.div>
        </SlideUpReveal>
        <SlideUpReveal delay={0.2}>
          <Link to="/pending-review">
          <motion.div
            whileHover={{ scale: 1.02, y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
            className={`glass-card p-6 rounded-xl transition-all h-full relative overflow-hidden group ${
              pendingReviews > 0 ? 'border-warning/30 hover:border-warning/50' : ''
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-warning/0 to-warning/0 group-hover:from-warning/5 group-hover:to-warning/10 transition-all duration-300" />
            <div className="flex items-start justify-between mb-4 relative z-10">
              <motion.div 
                className="p-3 rounded-lg bg-warning/10 text-warning"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <AlertCircle className="w-6 h-6" />
              </motion.div>
              {pendingReviews > 0 && (
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="w-3 h-3 bg-warning rounded-full pulse-glow"
                />
              )}
            </div>
            {/* <h3 className="text-text-secondary text-sm font-medium mb-2 relative z-10">Pending Reviews</h3> */}
            <div className="text-3xl font-bold mb-4 relative z-10">{pendingReviews}</div>
            <button className="text-cyan hover:text-cyan-dark font-medium text-sm transition-colors relative z-10 flex items-center gap-1 group-hover:gap-2">
              Review <span className="transition-all">→</span>
            </button>
          </motion.div>
        </Link>
        </SlideUpReveal>
      </div>

      {/* Recent Transactions */}
      <SlideUpReveal delay={0.3}>
        <GlassmorphismCard hover={false}>
          <div className="flex items-center gap-2 mb-6">
            <h2 className="text-xl font-bold">🆕 Recent Transactions</h2>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-2 h-2 bg-cyan rounded-full"
            />
          </div>
          <div className="space-y-4">
            {confirmedTransactions.slice(0, 3).map((transaction, index) => (
              <motion.div
                key={transaction.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.15 + 0.9 }}
                whileHover={{ scale: 1.02, x: 5 }}
                className="glass-card p-4 rounded-lg cursor-pointer relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan/0 to-purple/0 group-hover:from-cyan/5 group-hover:to-purple/5 transition-all duration-300" />
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-4">
                    <motion.div 
                      className="text-3xl"
                      whileHover={{ scale: 1.3, rotate: 10 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      {categoryIcons[transaction.category] || '📄'}
                    </motion.div>
                    <div>
                      <h3 className="font-semibold group-hover:gradient-text transition-all">{transaction.merchant}</h3>
                      <p className="text-sm text-text-secondary">
                        {transaction.category} • {transaction.items?.join(', ')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">{formatCurrency(transaction.amount)}</p>
                    <p className="text-sm text-text-tertiary">{formatRelativeTime(transaction.date)}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </GlassmorphismCard>
      </SlideUpReveal>

      {/* AI Insights */}
      <SlideUpReveal delay={0.4}>
        <GlassmorphismCard className="mt-8" hover={false}>
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-xl font-bold">💡 AI Insights</h2>
            <motion.span 
              className="px-3 py-1 bg-cyan/20 text-cyan text-sm font-semibold rounded-full"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 2, delay: 0.5 }}
            >
              {insights.length} new
            </motion.span>
          </div>
          <div className="space-y-3">
            {insights.map((insight, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.15 + 1.1 }}
                whileHover={{ scale: 1.02, x: 5 }}
                className="flex items-start gap-3 p-3 bg-white/5 rounded-lg cursor-pointer relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan/0 to-cyan/0 group-hover:from-cyan/10 group-hover:to-cyan/5 transition-all duration-300" />
                <motion.div 
                  className="text-cyan mt-0.5 text-xl relative z-10"
                  whileHover={{ scale: 1.3, rotate: 180 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  •
                </motion.div>
                <p className="text-text-secondary relative z-10 group-hover:text-white transition-colors">{insight}</p>
              </motion.div>
            ))}
          </div>
        </GlassmorphismCard>
      </SlideUpReveal>
    </div>
  );
}
