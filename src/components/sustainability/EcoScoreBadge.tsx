import React, { useState, useEffect } from 'react';
import { Leaf, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { getEcoScoreGrade } from '../../services/recommendationEngine';

interface EcoScoreBadgeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg' | 'hero';
  showLabel?: boolean;
  isVerified?: boolean;
}

export const EcoScoreBadge: React.FC<EcoScoreBadgeProps> = ({
  score,
  size = 'md',
  showLabel = true,
  isVerified = false
}) => {
  const { grade, text, bg, color } = getEcoScoreGrade(score);
  const [displayScore, setDisplayScore] = useState<number>(0);

  // Animated count up on initial mount
  useEffect(() => {
    let startTimestamp: number | null = null;
    const duration = 1100; // 1.1s smooth count up

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // easeOutCubic curve
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      setDisplayScore(Math.round(easeProgress * score));

      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };

    const animId = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(animId);
  }, [score]);

  if (size === 'sm') {
    return (
      <div 
        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black border shadow-2xs transition-transform hover:scale-105"
        style={{ backgroundColor: bg, borderColor: `${color}40`, color: color }}
        title={`EcoScore: ${score}/100 (${grade})`}
      >
        <Leaf className="w-3 h-3 text-emerald-600" />
        <span>{displayScore}</span>
        <span className="text-[10px] font-extrabold opacity-75">({grade})</span>
      </div>
    );
  }

  if (size === 'hero') {
    const radius = 38;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (score / 100) * circumference;

    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative inline-flex flex-col items-center bg-white/95 backdrop-blur-md rounded-3xl p-5 shadow-eco-md border border-emerald-100"
      >
        {isVerified && (
          <span className="absolute -top-3 bg-gradient-to-r from-emerald-600 to-eco-dark text-white text-[10px] font-black px-3 py-1 rounded-full flex items-center gap-1 shadow-sm border border-white/40">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-200" />
            GRIHA / IGBC Verified
          </span>
        )}

        {/* Circular Progress Ring */}
        <div className="relative w-28 h-28 flex items-center justify-center my-1">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {/* Background Track */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              className="stroke-slate-100"
              strokeWidth="8"
              fill="transparent"
            />
            {/* Animated Progress Ring */}
            <motion.circle
              cx="50"
              cy="50"
              r={radius}
              stroke={color}
              strokeWidth="8"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>

          {/* Center Score */}
          <div className="absolute flex flex-col items-center justify-center">
            <span className="text-3xl font-black text-slate-900 leading-none">
              {displayScore}
            </span>
            <span className="text-[10px] font-bold text-slate-400 mt-0.5">/ 100</span>
          </div>
        </div>

        <div 
          className="mt-1 px-3 py-0.5 rounded-full text-xs font-black uppercase tracking-wider shadow-2xs"
          style={{ backgroundColor: bg, color: color }}
        >
          Grade {grade}
        </div>

        {showLabel && (
          <span className="text-[11px] font-bold text-slate-500 mt-2 flex items-center gap-1">
            <Leaf className="w-3.5 h-3.5 text-eco-primary" />
            Overall EcoScore
          </span>
        )}
      </motion.div>
    );
  }

  // Medium (default) and Large
  return (
    <div 
      className={`inline-flex items-center gap-1.5 rounded-xl font-black border transition-all hover:shadow-2xs ${
        size === 'lg' ? 'px-3 py-1.5 text-sm' : 'px-2.5 py-1 text-xs'
      }`}
      style={{ backgroundColor: bg, borderColor: `${color}40`, color: color }}
    >
      <div className="flex items-center gap-1">
        <Leaf className={size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'} />
        <span>{displayScore}</span>
        <span className="opacity-70 text-[10px] font-extrabold">/100</span>
      </div>
      <span 
        className="px-1.5 py-0.2 rounded-md text-[10px] font-black uppercase"
        style={{ backgroundColor: `${color}20`, color: color }}
      >
        {grade}
      </span>
    </div>
  );
};
