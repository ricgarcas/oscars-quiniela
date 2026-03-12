export function Star4({ size = 16, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 0 L14.5 9.5 L24 12 L14.5 14.5 L12 24 L9.5 14.5 L0 12 L9.5 9.5 Z" />
    </svg>
  );
}

export function StarBurst({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 ${className}`}>
      <Star4 size={10} />
      <Star4 size={14} />
      <Star4 size={10} />
    </span>
  );
}

export function RetroSparkles() {
  return (
    <div className="flex justify-center gap-4 items-center text-gold">
      <Star4 size={8} />
      <Star4 size={12} />
      <Star4 size={16} />
      <Star4 size={12} />
      <Star4 size={8} />
    </div>
  );
}
