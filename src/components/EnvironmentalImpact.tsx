'use client';

import type { SolarLead, Language } from '@/types/solar';
import { getTranslation } from '@/lib/translations';

interface EnvironmentalImpactProps {
  data: SolarLead;
}

export function EnvironmentalImpact({ data }: EnvironmentalImpactProps) {
  const annualProduction = (data.systemSizeKw || 0) * (data.sunHoursPerDay || 0) * 365 * 0.8;
  const co2SavedLbs = Math.max(0, Math.round(annualProduction * 0.85 * 25));
  const treesEquivalent = Math.max(0, Math.round(co2SavedLbs / 48));
  const carMilesEquivalent = Math.max(0, Math.round(co2SavedLbs * 0.5));

  return (
    <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 backdrop-blur-sm border border-green-700/50 rounded-lg p-4 sm:p-6 space-y-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-2xl">🌳</span>
        <h3 className="text-lg font-semibold text-green-400">Environmental Impact (25 Years)</h3>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="text-center p-3 bg-black/20 rounded-lg">
          <p className="text-xs text-muted-foreground mb-1">CO₂ Offset</p>
          <p className="text-xl font-bold text-green-400">{co2SavedLbs.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">lbs</p>
        </div>
        
        <div className="text-center p-3 bg-black/20 rounded-lg">
          <p className="text-xs text-muted-foreground mb-1">Trees Planted</p>
          <p className="text-xl font-bold text-green-400">{treesEquivalent.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">equivalent</p>
        </div>
        
        <div className="text-center p-3 bg-black/20 rounded-lg">
          <p className="text-xs text-muted-foreground mb-1">Car Miles</p>
          <p className="text-xl font-bold text-green-400">{carMilesEquivalent.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">not driven</p>
        </div>
      </div>
    </div>
  );
}
