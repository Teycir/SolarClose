"use client";

import { useEffect } from 'react';
import { X } from 'lucide-react';
import type { SolarLead, Language } from "@/types/solar";
import { formatCurrency } from "@/lib/currency";
import { getTranslation, type TranslationKey } from "@/lib/translations";
import { AnimatedNumber } from './AnimatedNumber';

interface ShowModeProps {
  data: SolarLead;
  onClose: () => void;
}

const PERFORMANCE_RATIO = 0.8;
const DAYS_PER_YEAR = 365;
const MONTHS_PER_YEAR = 12;
const CO2_PER_KWH = 0.85;

export function ShowMode({ data, onClose }: ShowModeProps) {
  const lang = (data.language || "en") as Language;
  const t = (key: string) => getTranslation(lang, key as TranslationKey);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const annualProduction = data.systemSizeKw * data.sunHoursPerDay * DAYS_PER_YEAR * PERFORMANCE_RATIO;
  const annualUsage = data.electricityRate > 0 ? (data.currentMonthlyBill / data.electricityRate) * MONTHS_PER_YEAR : 0;
  const offsetPercentage = annualUsage > 0 ? Math.min((annualProduction / annualUsage) * 100, 100) : 0;
  const co2SavedLbs = Math.round(annualProduction * CO2_PER_KWH * 25);
  const treesEquivalent = Math.round(co2SavedLbs / 48);
  const isNegativeSavings = data.twentyFiveYearSavings < 0;

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-8 animate-in fade-in duration-500">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all"
        aria-label="Close show mode"
      >
        <X className="w-6 h-6 text-white" />
      </button>

      <div className="max-w-6xl w-full space-y-12 text-white">
        <div className="text-center space-y-4 animate-in slide-in-from-bottom-4 duration-700">
          <div className="text-8xl mb-4">☀️</div>
          <h1 className="text-6xl font-bold bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-600 bg-clip-text text-transparent">
            {data.clientName || t('yourFuture')}
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-in slide-in-from-bottom-8 duration-700 delay-200">
          <div className="text-center p-8 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20">
            <p className="text-xl text-white/70 mb-4">{isNegativeSavings ? t("twentyFiveYearLoss") : t("twentyFiveYearSavings")}</p>
            <p className={`text-5xl font-bold ${isNegativeSavings ? 'text-red-400' : 'text-green-400'}`}>
              <AnimatedNumber 
                value={Math.abs(data.twentyFiveYearSavings)} 
                prefix={data.currency === 'EUR' ? '€' : '$'}
              />
            </p>
          </div>

          <div className="text-center p-8 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20">
            <p className="text-xl text-white/70 mb-4">{t("breakEvenYear")}</p>
            <p className="text-5xl font-bold text-blue-400">
              {data.breakEvenYear === null || isNegativeSavings ? t("wontPayOff") : `${t("year")} ${data.breakEvenYear}`}
            </p>
          </div>

          <div className="text-center p-8 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20">
            <p className="text-xl text-white/70 mb-4">{t("monthlyBillOffset")}</p>
            <p className="text-5xl font-bold text-purple-400">{Math.round(offsetPercentage)}%</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-bottom-12 duration-700 delay-500">
          <div className="text-center p-8 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20">
            <p className="text-xl text-white/70 mb-4">{t("systemSize")}</p>
            <p className="text-4xl font-bold text-yellow-400">{data.systemSizeKw} kW</p>
          </div>

          <div className="text-center p-8 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20">
            <p className="text-xl text-white/70 mb-4">🌳 {t("treesPlanted")}</p>
            <p className="text-4xl font-bold text-green-400">{treesEquivalent.toLocaleString()}</p>
          </div>
        </div>

        <div className="text-center text-white/50 text-sm animate-in fade-in duration-700 delay-1000">
          {t("pressEscToExit")}
        </div>
      </div>
    </div>
  );
}
