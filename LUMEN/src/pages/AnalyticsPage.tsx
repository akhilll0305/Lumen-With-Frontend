import { motion } from 'framer-motion';
import { useState } from 'react';
import StatCard from '../components/StatCard';
import GlassCard from '../components/GlassCard';
import ProgressBar from '../components/ProgressBar';
import PageTransition from '../components/PageTransition';
import UltraPremiumBackground from '../components/UltraPremiumBackground';
import MouseGlow from '../components/MouseGlow';
import AuthenticatedNav from '../components/AuthenticatedNav';
import { DollarSign, ShoppingCart, TrendingUp } from 'lucide-react';
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const spendingOverTime = [
  { date: 'Jan 1', amount: 42 },
  { date: 'Jan 3', amount: 38 },
  { date: 'Jan 5', amount: 51 },
  { date: 'Jan 7', amount: 45 },
  { date: 'Jan 9', amount: 39 },
  { date: 'Jan 11', amount: 55 },
  { date: 'Jan 13', amount: 144 },
];

const categoryData = [
  { name: 'Groceries', value: 450, color: '#00D9FF' },
  { name: 'Dining', value: 287, color: '#8B5CF6' },
  { name: 'Transport', value: 180, color: '#10B981' },
  { name: 'Utilities', value: 220, color: '#F59E0B' },
  { name: 'Entertainment', value: 110, color: '#EF4444' },
];

const topMerchants = [
  { name: 'Walmart', amount: 320, percentage: 25 },
  { name: 'Starbucks', amount: 125.5, percentage: 10 },
  { name: 'Shell Gas', amount: 180, percentage: 14 },
  { name: 'Chipotle', amount: 98, percentage: 8 },
  { name: 'Amazon', amount: 156, percentage: 12 },
];

const forecastData = [
  { category: 'Groceries', amount: 470, change: 4 },
  { category: 'Dining', amount: 295, change: 3 },
  { category: 'Transport', amount: 185, change: 3 },
  { category: 'Utilities', amount: 220, change: 0 },
  { category: 'Entertainment', amount: 150, change: 36 },
];

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<'month' | '30days' | '3months' | 'custom'>('month');

  const totalSpent = categoryData.reduce((sum, cat) => sum + cat.value, 0);
  const totalTransactions = 47;
  const avgPerDay = totalSpent / 30;
  const forecastTotal = forecastData.reduce((sum, cat) => sum + cat.amount, 0);
  const budget = 1500;

  return (
    <PageTransition className="min-h-screen pb-20 relative overflow-hidden">
      <UltraPremiumBackground />
      <MouseGlow />
      <AuthenticatedNav />

      <div className="max-w-7xl mx-auto px-6 pt-28 pb-12 space-y-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-5xl font-heading font-bold gradient-text-premium mb-2">Financial Analytics</h1>
          <p className="text-text-secondary text-lg">Comprehensive insights into your financial patterns</p>
        </motion.div>

        {/* Time Range Selector */}
        <div className="flex gap-4">
          {(['month', '30days', '3months', 'custom'] as const).map((range) => (
            <button
              key={range}
            onClick={() => setTimeRange(range)}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${
              timeRange === range
                ? 'bg-cyan text-black'
                : 'glass-card hover:bg-white/10 text-text-secondary'
            }`}
          >
            {range === 'month'
              ? 'This Month'
              : range === '30days'
              ? 'Last 30 Days'
              : range === '3months'
              ? 'Last 3 Months'
              : 'Custom'}
          </button>
        ))}
      </div>

      {/* Top Stats */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Total Spent"
          value={totalSpent}
          prefix="$"
          change={12}
          icon={DollarSign}
          variant="primary"
        />
        <StatCard
          title="Transactions"
          value={totalTransactions}
          change={5}
          icon={ShoppingCart}
          variant="success"
        />
        <StatCard
          title="Avg/Day"
          value={avgPerDay}
          prefix="$"
          change={8}
          icon={TrendingUp}
          variant="warning"
        />
      </div>

      {/* Spending Over Time Chart */}
      <GlassCard className="mb-8" hoverable={false}>
        <h2 className="text-xl font-bold mb-6">📈 Spending Over Time</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={spendingOverTime}>
              <defs>
                <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00D9FF" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#00D9FF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" stroke="#737373" />
              <YAxis stroke="#737373" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1A1A1A',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                }}
              />
              <Area
                type="monotone"
                dataKey="amount"
                stroke="#00D9FF"
                strokeWidth={2}
                fill="url(#colorAmount)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      {/* Spending by Category */}
      <GlassCard className="mb-8" hoverable={false}>
        <h2 className="text-xl font-bold mb-6">🏷️ Spending by Category</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1A1A1A',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-4">
            {categoryData.map((category) => (
              <div key={category.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: category.color }}
                  ></div>
                  <span className="font-medium">{category.name}</span>
                </div>
                <div className="text-right">
                  <div className="font-bold">${category.value}</div>
                  <div className="text-sm text-text-secondary">
                    {((category.value / totalSpent) * 100).toFixed(0)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </GlassCard>

      {/* Top Merchants */}
      <GlassCard className="mb-8" hoverable={false}>
        <h2 className="text-xl font-bold mb-6">🏪 Top Merchants</h2>
        <div className="space-y-4">
          {topMerchants.map((merchant, index) => (
            <motion.div
              key={merchant.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center gap-4"
            >
              <div className="text-2xl font-bold text-text-tertiary w-8">
                {index + 1}.
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">{merchant.name}</span>
                  <span className="font-bold">${merchant.amount.toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-bg-tertiary rounded-full h-2 overflow-hidden">
                    <motion.div
                      className="h-full bg-cyan rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${merchant.percentage}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                    />
                  </div>
                  <span className="text-sm text-text-secondary w-12 text-right">
                    {merchant.percentage}%
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </GlassCard>

      {/* Next Month Forecast */}
      <GlassCard hoverable={false}>
        <h2 className="text-xl font-bold mb-6">🔮 Next Month Forecast</h2>
        <p className="text-text-secondary mb-4">
          Based on your patterns, we predict:
        </p>
        
        <div className="mb-6">
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-3xl font-bold">${forecastTotal}</span>
            <span className="text-text-secondary">± $85</span>
          </div>
          <ProgressBar
            current={forecastTotal}
            max={budget}
            color="cyan"
            label={`${((forecastTotal / budget) * 100).toFixed(0)}% of budget`}
          />
        </div>

        <div className="space-y-3">
          <h3 className="font-semibold">By category:</h3>
          {forecastData.map((item, index) => (
            <motion.div
              key={item.category}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
            >
              <span className="text-text-secondary">• {item.category}</span>
              <div className="flex items-center gap-2">
                <span className="font-medium">${item.amount}</span>
                <span
                  className={`text-sm ${
                    item.change === 0
                      ? 'text-text-tertiary'
                      : item.change > 0
                      ? 'text-success'
                      : 'text-danger'
                  }`}
                >
                  ({item.change === 0 ? '→' : item.change > 0 ? '↑' : '↓'} {Math.abs(item.change)}%)
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </GlassCard>
      </div>
    </PageTransition>
  );
}
