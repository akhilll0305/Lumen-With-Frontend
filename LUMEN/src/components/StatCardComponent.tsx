import React from 'react';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number | string;
  prefix?: string;
  suffix?: string;
  icon?: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  className?: string;
  animated?: boolean;
  decimals?: number;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  prefix = '',
  suffix = '',
  icon: Icon,
  trend,
  trendValue,
  className = '',
  animated = true,
  decimals = 0,
}) => {
  const trendColors = {
    up: 'text-success',
    down: 'text-error',
    neutral: 'text-text-secondary',
  };

  return (
    <motion.div
      className={`glass-card p-6 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-text-secondary text-sm font-medium mb-2">{title}</p>
          <div className="flex items-baseline gap-1">
            <span className="text-text-primary text-3xl font-bold">
              {prefix}
              {animated && typeof value === 'number' ? (
                <CountUp end={value} duration={2} decimals={decimals} separator="," />
              ) : (
                value
              )}
              {suffix}
            </span>
          </div>
          {trend && trendValue && (
            <div className={`flex items-center gap-1 mt-2 ${trendColors[trend]}`}>
              <span className="text-sm font-medium">{trendValue}</span>
            </div>
          )}
        </div>
        {Icon && (
          <div className="bg-gradient-card p-3 rounded-lg">
            <Icon className="w-6 h-6 text-luxe-gold" />
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default StatCard;
