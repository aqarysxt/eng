import { useState } from 'react';

/**
 * SVG Circular Progress Ring with animation.
 * @param {number} progress - Value from 0 to 100
 * @param {number} size - Diameter in pixels
 * @param {number} strokeWidth - Ring thickness
 * @param {string} color - Stroke color or gradient ID
 */
export default function ProgressRing({ progress = 0, size = 120, strokeWidth = 8, label = '', sublabel = '' }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="progress-ring-container" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6C5CE7" />
            <stop offset="100%" stopColor="#00D2FF" />
          </linearGradient>
        </defs>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(108, 92, 231, 0.15)"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#progressGradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{
            transition: 'stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        />
      </svg>
      <div className="progress-ring-label">
        {label && <span className="progress-ring-value">{label}</span>}
        {sublabel && <span className="progress-ring-sublabel">{sublabel}</span>}
      </div>
    </div>
  );
}
