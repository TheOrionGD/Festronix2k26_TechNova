import React from 'react';

export default function ProgressGauge({ percentage = 60 }) {
  const radius = 36;
  const strokeWidth = 7;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative w-28 h-28 flex items-center justify-center">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 90 90">
        {/* Background Track */}
        <circle
          cx="45"
          cy="45"
          r={radius}
          stroke="#595959"
          strokeOpacity="0.25"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress Arc */}
        <circle
          cx="45"
          cy="45"
          r={radius}
          stroke="url(#technova-gauge-gradient)"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          className="transition-all duration-1000 ease-out"
        />
        <defs>
          <linearGradient id="technova-gauge-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#D60303" />
            <stop offset="50%" stopColor="#C23D31" />
            <stop offset="100%" stopColor="#A30B1A" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute text-center">
        <span className="text-xl font-extrabold text-[#A30B1A]">{percentage}%</span>
        <p className="text-[10px] text-[#595959] font-semibold uppercase tracking-wider">Progress</p>
      </div>
    </div>
  );
}
