import React from 'react';
import { Card } from './Card';
import { TrendingUpIcon, TrendingDownIcon, MinusIcon } from 'lucide-react';
interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon: React.ReactNode;
  accentColor?: 'primary' | 'accent' | 'warning' | 'rose' | 'purple' | 'neutral';
  sparklineData?: number[];
  className?: string;
}
export function StatCard({
  title,
  value,
  change,
  trend = 'neutral',
  icon,
  accentColor = 'primary',
  sparklineData,
  className = ''
}: StatCardProps) {
  const trendColors = {
    up: 'text-emerald-500 bg-emerald-50',
    down: 'text-rose-500 bg-rose-50',
    neutral: 'text-slate-500 bg-slate-50'
  };
  const accentStyles = {
    primary: 'text-primary-600 bg-primary-50 border-primary-500',
    accent: 'text-accent-600 bg-accent-50 border-accent-500',
    warning: 'text-amber-600 bg-amber-50 border-amber-500',
    rose: 'text-rose-600 bg-rose-50 border-rose-500',
    purple: 'text-purple-600 bg-purple-50 border-purple-500',
    neutral: 'text-slate-600 bg-slate-100 border-slate-400'
  };
  const TrendIcon = {
    up: TrendingUpIcon,
    down: TrendingDownIcon,
    neutral: MinusIcon
  }[trend];
  // Simple SVG sparkline generator
  const renderSparkline = () => {
    if (!sparklineData || sparklineData.length === 0) return null;
    const min = Math.min(...sparklineData);
    const max = Math.max(...sparklineData);
    const range = max - min || 1;
    const points = sparklineData.
    map((val, i) => {
      const x = i / (sparklineData.length - 1) * 100;
      const y = 100 - (val - min) / range * 100;
      return `${x},${y}`;
    }).
    join(' ');
    const strokeColor =
    trend === 'up' ? '#10b981' : trend === 'down' ? '#f43f5e' : '#94a3b8';
    return (
      <div className="h-10 w-24 ml-auto opacity-80">
        <svg
          viewBox="0 -10 100 120"
          className="w-full h-full overflow-visible"
          preserveAspectRatio="none">

          <polyline
            fill="none"
            stroke={strokeColor}
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={points} />

        </svg>
      </div>);

  };
  return (
    <Card
      hover
      className={`p-6 relative overflow-hidden border-b-4 border-b-transparent hover:${accentStyles[accentColor].split(' ')[2]} transition-colors ${className}`}>

      <div className="flex items-start justify-between mb-6">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm ${accentStyles[accentColor].split(' ').slice(0, 2).join(' ')}`}>

          {icon}
        </div>
        {change &&
        <div
          className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold shadow-sm ${trendColors[trend]}`}>

            <TrendIcon className="w-3.5 h-3.5" />
            {change}
          </div>
        }
      </div>

      <div className="flex items-end justify-between">
        <div>
          <h3 className="text-slate-500 text-sm font-semibold tracking-wide uppercase mb-1.5">
            {title}
          </h3>
          <div className="text-4xl font-bold text-slate-900 font-heading tracking-tight">
            {value}
          </div>
        </div>
        {renderSparkline()}
      </div>
    </Card>);

}