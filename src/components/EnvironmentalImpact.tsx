'use client';

import type { SolarLead, Language } from '@/types/solar';
import { getTranslation, type TranslationKey } from '@/lib/translations';

interface EnvironmentalImpactProps {
  data: SolarLead;
}

export function EnvironmentalImpact({ data }: EnvironmentalImpactProps) {
  const lang = (data.language || 'en') as Language;
  const t = (key: string) => getTranslation(lang, key as TranslationKey);
  const isMetric = lang !== 'en';
  const DAYS_PER_YEAR = 365;
  const PERFORMANCE_RATIO = 0.8;
  const CO2_PER_KWH = 0.85;
  const YEARS = 25;
  const LBS_TO_KG = 0.453592;
  const LBS_PER_TREE = 48;
  const MILES_PER_LB_CO2 = 0.5;

  const annualProduction = (data.systemSizeKw || 0) * (data.sunHoursPerDay || 0) * DAYS_PER_YEAR * PERFORMANCE_RATIO;
  const co2SavedLbs = Math.max(0, Math.round(annualProduction * CO2_PER_KWH * YEARS));
  const co2Saved = isMetric ? Math.round(co2SavedLbs * LBS_TO_KG) : co2SavedLbs;
  const treesEquivalent = Math.max(0, Math.round(co2SavedLbs / LBS_PER_TREE));
  const carMiles = Math.max(0, Math.round(co2SavedLbs * MILES_PER_LB_CO2));
  const carDistance = isMetric ? Math.round(carMiles * 1.60934) : carMiles;

  return (
    <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 backdrop-blur-sm border border-green-700/50 rounded-lg p-4 sm:p-6 space-y-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-2xl">🌳</span>
        <h3 className="text-lg font-semibold text-green-400">{t('envImpactTitle')}</h3>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="text-center p-3 bg-black/20 rounded-lg">
          <p className="text-xs text-muted-foreground mb-1">{t('envCo2Offset')}</p>
          <p className="text-xl font-bold text-green-400">{co2Saved.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">{isMetric ? 'kg' : 'lbs'}</p>
        </div>
        
        <div className="text-center p-3 bg-black/20 rounded-lg">
          <p className="text-xs text-muted-foreground mb-1">{t('envTreesPlanted')}</p>
          <p className="text-xl font-bold text-green-400">{treesEquivalent.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">{t('envEquivalent')}</p>
        </div>
        
        <div className="text-center p-3 bg-black/20 rounded-lg">
          <p className="text-xs text-muted-foreground mb-1">{t('envCarMiles')}</p>
          <p className="text-xl font-bold text-green-400">{carDistance.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">{t('envNotDriven')}</p>
        </div>
      </div>
    </div>
  );
}
