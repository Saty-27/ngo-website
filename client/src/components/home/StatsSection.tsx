import React, { useState, useEffect } from "react";
import { useQuery } from '@tanstack/react-query';
import { Stat } from '@shared/schema';
import { Skeleton } from '@/components/ui/skeleton';

interface StatBoxProps {
  value: number;
  suffix: string;
  label: string;
}

const StatBox: React.FC<StatBoxProps> = ({ value, suffix, label }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number | null = null;
    const duration = 2000; // 2 seconds animation
    let animationFrameId: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      setCount(Math.floor(progress * value));

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [value]);

  return (
    <div className="stat-box">
      <h1 className="stat-value">
        {count.toLocaleString()} <span className="suffix">{suffix}</span>
      </h1>
      <p className="stat-label">{label}</p>
    </div>
  );
};

const StatsSection: React.FC = () => {
  const { data: stats = [], isLoading } = useQuery<Stat[]>({
    queryKey: ['/api/stats'],
  });

  if (isLoading) {
    return (
      <div className="stats-container">
        {[1, 2, 3].map((index) => (
          <div key={index} className="stat-box">
            <Skeleton className="h-16 w-32 mb-4" />
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </div>
    );
  }

  if (stats.length === 0) {
    return null;
  }

  return (
    <div className="stats-container">
      {stats
        .filter(stat => stat.isActive)
        .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0))
        .map((stat) => (
          <StatBox
            key={stat.id}
            value={stat.value}
            suffix={stat.suffix}
            label={stat.label}
          />
        ))}
    </div>
  );
};

export default StatsSection;