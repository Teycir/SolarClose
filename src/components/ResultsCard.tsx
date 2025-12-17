"use client";

import { useEffect, useState } from 'react';
import type { SolarLead, Language } from "@/types/solar";
import { formatCurrency } from "@/lib/currency";
import { getTranslation, type TranslationKey } from "@/lib/translations";
import { AnimatedNumber } from './AnimatedNumber';
import { Confetti } from './Confetti';
import { Copy, Check } from 'lucide-react';

interface ResultsCardProps {
  data: SolarLead;
}

// Solar system performance constants
const PERFORMANCE_RATIO = 0.8; // 80% real-world efficiency
const DAYS_PER_YEAR = 365;
const MONTHS_PER_YEAR = 12;

function getTranslate(language: string | undefined) {
  const lang = (language || "en") as Language;
  return (key: string) => getTranslation(lang, key as TranslationKey);
}

export function ResultsCard({ data }: ResultsCardProps) {
  const t = getTranslate(data.language);
  const [showConfetti, setShowConfetti] = useState(false);
  const [copied, setCopied] = useState(false);
  
  useEffect(() => {
    if (data.twentyFiveYearSavings > 50000) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [data.twentyFiveYearSavings]);
  const annualProduction =
    data.systemSizeKw * data.sunHoursPerDay * DAYS_PER_YEAR * PERFORMANCE_RATIO;
  const annualUsage =
    data.electricityRate > 0
      ? (data.currentMonthlyBill / data.electricityRate) * MONTHS_PER_YEAR
      : 0;
  const offsetPercentage =
    annualUsage > 0 ? Math.min((annualProduction / annualUsage) * 100, 100) : 0;
  const roiPercentage =
    data.systemCost > 0
      ? Math.round((data.twentyFiveYearSavings / data.systemCost) * 100)
      : 0;
  const clampedRoi = Math.max(0, Math.min(100, roiPercentage));
  const isNegativeSavings = data.twentyFiveYearSavings < 0;
  const progressBarColor = isNegativeSavings ? "bg-destructive" : "bg-primary";
  const savingsTextColor = isNegativeSavings ? "text-destructive" : "text-primary";
  const formattedAnnualProduction = Math.round(annualProduction).toLocaleString();

  const DAYS_PER_YEAR = 365;
  const CO2_PER_KWH = 0.85;
  const co2SavedLbs = Math.round(annualProduction * CO2_PER_KWH * 25);
  const treesEquivalent = Math.round(co2SavedLbs / 48);

  const handleCopySummary = async () => {
    const currencySymbol = data.currency === 'EUR' ? '€' : '$';
    const summary = `✅ ${currencySymbol}${Math.abs(data.twentyFiveYearSavings).toLocaleString()} saved over 25 years\n✅ Break-even in Year ${data.breakEvenYear || 'N/A'}\n✅ ${Math.round(offsetPercentage)}% bill offset\n✅ Equivalent to planting ${treesEquivalent.toLocaleString()} trees`;
    
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <article
      className="bg-white/20 dark:bg-black/30 backdrop-blur-xl border border-white/30 rounded-lg p-4 sm:p-6 space-y-4 sm:space-y-6 shadow-2xl"
      aria-label="Solar system results"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div className="text-center p-4 sm:p-6 bg-secondary rounded-lg hover:bg-secondary/80 transition-all cursor-default">
          <p className="text-sm sm:text-base text-muted-foreground mb-2">
            {t("breakEvenYear")}
          </p>
          <p className="text-2xl sm:text-3xl font-bold break-words">
            {data.breakEvenYear === null || isNegativeSavings
              ? `⚠️ ${t("wontPayOff")}`
              : `${t("year")} ${data.breakEvenYear}`}
          </p>
        </div>
        <div className="text-center p-4 sm:p-6 bg-secondary rounded-lg hover:bg-secondary/80 transition-all cursor-default">
          <p className="text-sm sm:text-base text-muted-foreground mb-2">
            {t("systemCost")}
          </p>
          <p className="text-2xl sm:text-3xl font-bold break-words">
            {formatCurrency(data.systemCost, data.currency)}
          </p>
        </div>
      </div>

      <div className="text-center p-4 sm:p-6 bg-secondary rounded-lg relative">
        <Confetti trigger={showConfetti} />
        <h2 className="text-xs sm:text-sm text-muted-foreground mb-2">
          {isNegativeSavings
            ? t("twentyFiveYearLoss")
            : t("twentyFiveYearSavings")}
        </h2>
        <p
          className={`text-3xl sm:text-5xl font-bold break-words ${savingsTextColor}`}
        >
          <AnimatedNumber 
            value={Math.abs(data.twentyFiveYearSavings)} 
            prefix={data.currency === 'EUR' ? '€' : '$'}
            suffix={isNegativeSavings ? ` ${t("loss")}` : ''}
          />
        </p>
        <button
          onClick={handleCopySummary}
          className="mt-4 flex items-center gap-2 mx-auto px-4 py-2 bg-primary/10 hover:bg-primary/20 rounded-lg transition-all text-sm font-medium"
          title={t('copySummary')}
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? t('copied') : t('copySummary')}
        </button>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">{t("systemSize")}</span>
          <span className="font-medium">{data.systemSizeKw} kW</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">
            {t("estAnnualProduction")}
          </span>
          <span className="font-medium">
            {formattedAnnualProduction} kWh
          </span>
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              {t("monthlyBillOffset")}
            </span>
            <span className="font-medium">{Math.round(offsetPercentage)}%</span>
          </div>
          <div className="relative h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className="absolute left-0 top-0 h-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-300"
              style={{ width: `${Math.min(offsetPercentage, 100)}%` }}
            />
          </div>
        </div>
      </div>

      <div
        className="relative h-8 bg-secondary rounded-full overflow-hidden"
        role="progressbar"
        aria-label="Return on investment progress"
        aria-valuenow={clampedRoi}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={`absolute left-0 top-0 h-full transition-all duration-300 ${progressBarColor}`}
          style={{ width: `${clampedRoi}%` }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 flex items-center justify-center text-base font-bold text-white drop-shadow-md">
          {t("roi")}: {roiPercentage}%
        </div>
      </div>
    </article>
  );
}
