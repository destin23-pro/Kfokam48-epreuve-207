import React, { useEffect, useState } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';

interface CountdownTimerProps {
  expirationAt: string;
  onExpire?: () => void;
  size?: 'sm' | 'md' | 'lg' | 'giant';
  showLabel?: boolean;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  expirationAt,
  onExpire,
  size = 'md',
  showLabel = true,
}) => {
  const calculateRemaining = () => {
    const diff = new Date(expirationAt).getTime() - Date.now();
    return Math.max(0, Math.floor(diff / 1000));
  };

  const [secondsLeft, setSecondsLeft] = useState<number>(calculateRemaining);

  useEffect(() => {
    setSecondsLeft(calculateRemaining());
    const interval = setInterval(() => {
      const remaining = calculateRemaining();
      setSecondsLeft(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
        if (onExpire) onExpire();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expirationAt]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const isExpiringSoon = secondsLeft > 0 && secondsLeft < 180; // Moins de 3 minutes
  const isExpired = secondsLeft <= 0;

  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  if (size === 'giant') {
    return (
      <div className="flex flex-col items-center">
        <div
          className={`font-mono tabular-nums font-black text-5xl md:text-7xl tracking-tight transition-colors ${
            isExpired
              ? 'text-rose-600'
              : isExpiringSoon
              ? 'text-amber-500 animate-pulse'
              : 'text-slate-900'
          }`}
        >
          {formattedTime}
        </div>
        {showLabel && (
          <span className="text-xs uppercase tracking-wider text-slate-500 mt-2 font-medium">
            {isExpired ? 'Session clôturée' : 'Temps restant avant clôture'}
          </span>
        )}
      </div>
    );
  }

  if (size === 'lg') {
    return (
      <div className="flex items-center gap-2">
        <Clock className={`w-5 h-5 ${isExpiringSoon ? 'text-amber-500' : 'text-slate-500'}`} />
        <span
          className={`font-mono tabular-nums font-bold text-2xl ${
            isExpired
              ? 'text-rose-600'
              : isExpiringSoon
              ? 'text-amber-600'
              : 'text-slate-900'
          }`}
        >
          {formattedTime}
        </span>
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium font-mono tabular-nums ${
        isExpired
          ? 'bg-rose-50 text-rose-700 border border-rose-200'
          : isExpiringSoon
          ? 'bg-amber-50 text-amber-700 border border-amber-200'
          : 'bg-slate-100 text-slate-700 border border-slate-200'
      }`}
    >
      {isExpiringSoon ? (
        <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
      ) : (
        <Clock className="w-3.5 h-3.5 text-slate-500" />
      )}
      <span>{formattedTime}</span>
      {isExpired && <span className="font-sans text-[10px] text-rose-600 ml-1">(Expiré)</span>}
    </div>
  );
};
