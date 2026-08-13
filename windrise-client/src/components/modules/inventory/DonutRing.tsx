

interface DonutRingProps {
  percent: number
  color: string
  label: string
  size?: number
  thickness?: number
}

export function DonutRing({ percent, color, label, size = 46, thickness = 4.5 }: DonutRingProps) {
  const radius = (size - thickness) / 2
  const circumference = 2 * Math.PI * radius
  const dash = (Math.min(Math.max(percent, 0), 100) / 100) * circumference

  return (
    <span className="relative inline-flex shrink-0 items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#e9ecf3" strokeWidth={thickness} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={thickness}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <span className="absolute text-[10px] font-semibold tabular text-slate-500">{label}</span>
    </span>
  )
}
