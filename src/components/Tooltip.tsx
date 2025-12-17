'use client';

import { ReactNode } from 'react';

interface TooltipProps {
  children: ReactNode;
  text: string;
}

export function Tooltip({ children, text }: TooltipProps) {
  if (!text || typeof text !== 'string') {
    return <>{children}</>;
  }
  
  return (
    <div className="relative group">
      {children}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gradient-to-r from-amber-400 to-orange-400 text-black text-xs font-semibold rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 border border-orange-300">
        {text}
      </div>
    </div>
  );
}
