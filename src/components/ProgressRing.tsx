interface ProgressRingProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
}

function ProgressRingInner({ percentage, size = 56, strokeWidth = 5 }: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-navy-800"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="text-gold-400 transition-all duration-500"
        />
      </svg>
      <span className="absolute text-xs font-semibold text-white">{percentage}%</span>
    </div>
  );
}

export const ProgressRing = ProgressRingInner;
export default ProgressRingInner;
