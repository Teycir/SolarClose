"use client";

import { useState, useEffect, useCallback } from "react";
import { useSolarLead } from "@/hooks/useSolarLead";
import {
  getTranslation,
  languageFlags,
  type Language,
  type TranslationKey,
} from "@/lib/translations";
import { SystemDetailsSection } from "@/components/form-sections/SystemDetailsSection";
import { ClientInfoSection } from "@/components/form-sections/ClientInfoSection";
import { CompanyInfoSection } from "@/components/form-sections/CompanyInfoSection";
import { PropertyFinancialSection } from "@/components/form-sections/PropertyFinancialSection";
import { ResultsCard } from "@/components/ResultsCard";
import { ExportButton } from "@/components/ExportButton";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { EnvironmentalImpact } from "@/components/EnvironmentalImpact";
import { SavingsChart } from "@/components/SavingsChart";
import { BillSwapComparison } from "@/components/BillSwapComparison";
import { SocialShare } from "@/components/SocialShare";
import { DataBackup } from "@/components/DataBackup";
import { Tooltip } from "@/components/Tooltip";
import { openDB } from "idb";
import type { SolarLead } from "@/types/solar";

const generateLeadId = () => `lead-${Date.now()}`;

export default function Home() {
  const [currentLeadId, setCurrentLeadId] = useState("default-lead");
  const [allLeads, setAllLeads] = useState<SolarLead[]>([]);
  const [showLeads, setShowLeads] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  const { data, setData, saveStatus, saveLead } = useSolarLead(currentLeadId);

  const lang: Language = (data?.language || "en") as Language;
  const t = (key: string) => getTranslation(lang, key as TranslationKey);
  const isDefaultLead = currentLeadId === "default-lead";

  // Auto-recalculate when inputs change
  const shouldRecalculate = useCallback(() => {
    return data && !isDefaultLead;
  }, [data, isDefaultLead]);

  useEffect(() => {
    if (!shouldRecalculate()) return;

    const recalculate = async () => {
      try {
        if (!data) return;
        const { calculateSolarSavings } = await import("@/lib/calculations");
        const results = calculateSolarSavings({
          currentMonthlyBill: data.currentMonthlyBill,
          yearlyInflationRate: data.yearlyInflationRate,
          systemCost: data.systemCost,
          systemSizeKw: data.systemSizeKw,
          electricityRate: data.electricityRate,
          sunHoursPerDay: data.sunHoursPerDay,
          federalTaxCreditPercent: data.federalTaxCredit,
          stateIncentiveDollars: data.stateIncentive,
          financingOption: data.financingOption as "Cash" | "Loan" | undefined,
          loanTerm: data.loanTerm,
          downPayment: data.downPayment,
          loanInterestRate: data.loanInterestRate,
          has25YearInverterWarranty: data.has25YearInverterWarranty,
        });

        setData({
          twentyFiveYearSavings: results.twentyFiveYearSavings,
          breakEvenYear: results.breakEvenYear,
          yearlyBreakdown: results.yearlyBreakdown,
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message.replace(/[\r\n]/g, " ")
            : "Unknown error";
        console.error("Failed to recalculate:", errorMessage);
      }
    };

    recalculate().catch((error) => {
      const errorMessage = error instanceof Error ? error.message.replace(/[\r\n]/g, ' ') : 'Unknown error';
      console.error('Recalculate promise rejected:', errorMessage);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    data?.currentMonthlyBill,
    data?.yearlyInflationRate,
    data?.systemCost,
    data?.systemSizeKw,
    data?.electricityRate,
    data?.sunHoursPerDay,
    data?.federalTaxCredit,
    data?.stateIncentive,
    data?.financingOption,
    data?.loanTerm,
    data?.downPayment,
    data?.loanInterestRate,
    data?.has25YearInverterWarranty,
    isDefaultLead,
    setData,
  ]);

  useEffect(() => {
    if (!showLeads) return;
    const loadLeads = async () => {
      try {
        const db = await openDB("solar-leads", 2);
        const leads = await db.getAll("leads");
        const sortedLeads = Array.isArray(leads)
          ? leads.sort((a, b) => b.createdAt - a.createdAt)
          : [];
        setAllLeads(sortedLeads);
      } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        const sanitizedError = errorMsg.replace(/[\r\n]/g, " ");
        console.error("Failed to load leads:", sanitizedError);
        if (error instanceof Error && error.stack) {
          console.error("Stack trace:", error.stack.replace(/[\r\n]/g, " | "));
        }
        setAllLeads([]);
      }
    };
    loadLeads();
  }, [showLeads]);

  const handleClearAllLeads = async () => {
    try {
      const db = await openDB("solar-leads", 2);
      await db.clear("leads");
      setAllLeads([]);
      setShowLeads(false);
      setCurrentLeadId(generateLeadId());
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error(
        "Failed to clear database:",
        errorMessage.replace(/[\r\n]/g, " "),
      );
    }
    setConfirmDialog(null);
  };

  const handleDeleteLead = async (leadId: string) => {
    try {
      const db = await openDB("solar-leads", 2);
      await db.delete("leads", leadId);
      setAllLeads((prev) => prev.filter((l) => l.id !== leadId));
      if (leadId === currentLeadId) {
        setCurrentLeadId(generateLeadId());
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error(
        "Failed to delete lead:",
        errorMessage.replace(/[\r\n]/g, " "),
      );
    }
    setConfirmDialog(null);
  };

  const confirmNewLead = () => {
    setCurrentLeadId(generateLeadId());
    setConfirmDialog(null);
  };

  const handleNewLead = () => {
    if (!data?.clientName) {
      setCurrentLeadId(generateLeadId());
      return;
    }

    setConfirmDialog({
      isOpen: true,
      title: t('createNewLead'),
      message: t('currentLeadWillBeSaved'),
      onConfirm: confirmNewLead,
    });
  };

  const handleSelectLead = (leadId: string) => {
    setCurrentLeadId(leadId);
    setShowLeads(false);
  };

  const validateRequiredFields = () => {
    const missing: string[] = [];
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!data?.clientName?.trim()) missing.push(t('clientName'));
    if (!data?.address?.trim()) missing.push(t('address'));
    if (!data?.productDescription?.trim()) missing.push(t('productDescription'));
    if (!data?.proposalConditions?.trim()) missing.push(t('proposalConditions'));
    if (!data?.companyName?.trim()) missing.push(t('companyName'));
    if (!data?.companyPhone?.trim()) missing.push(t('companyPhone'));
    if (!data?.salesRep?.trim()) missing.push(t('salesRep'));
    if (data?.email && !emailRegex.test(data.email)) missing.push(t('email') + ' (invalid format)');
    if (data?.companyEmail && !emailRegex.test(data.companyEmail)) missing.push(t('companyEmail') + ' (invalid format)');
    return missing;
  };

  const [justSaved, setJustSaved] = useState(false);

  const handleSaveLead = async () => {
    const missing = validateRequiredFields();
    if (missing.length > 0) {
      setConfirmDialog({
        isOpen: true,
        title: t('missingRequiredFields'),
        message: `${t('pleaseFillIn')}: ${missing.join(', ')}`,
        onConfirm: () => setConfirmDialog(null),
      });
      return;
    }
    await saveLead();
    const db = await openDB("solar-leads", 2);
    const leads = await db.getAll("leads");
    setAllLeads(Array.isArray(leads) ? leads.sort((a, b) => b.createdAt - a.createdAt) : []);
    setShowLeads(true);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2000);
  };

  const refreshLeads = useCallback(async () => {
    try {
      const db = await openDB("solar-leads", 2);
      const leads = await db.getAll("leads");
      const sortedLeads = Array.isArray(leads)
        ? leads.sort((a, b) => b.createdAt - a.createdAt)
        : [];
      setAllLeads(sortedLeads);
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error("Failed to refresh leads:", errorMsg.replace(/[\r\n]/g, " "));
    }
  }, []);

  if (!data) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground" role="status" aria-live="polite">
          {t('loading')}
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-2 sm:p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="text-3xl float-sun" aria-hidden="true">
            ☀️
          </div>
          <select
            value={data.language || "en"}
            onChange={(e) => {
              const lang = e.target.value as Language;
              const currency = lang === "en" ? "USD" : "EUR";
              try {
                localStorage.setItem('solarclose-language', lang);
                localStorage.setItem('solarclose-currency', currency);
              } catch (e) {
                console.warn('localStorage unavailable');
              }
              setData({ language: lang, currency } as Partial<SolarLead>);
            }}
            className="text-2xl bg-transparent border-none cursor-pointer hover:opacity-80 transition-opacity"
            aria-label="Select language"
            title="Select language"
          >
            <option value="en">{languageFlags.en}</option>
            <option value="es">{languageFlags.es}</option>
            <option value="it">{languageFlags.it}</option>
            <option value="fr">{languageFlags.fr}</option>
            <option value="de">{languageFlags.de}</option>
          </select>
          <div>
            <h1 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-600 bg-clip-text text-transparent">
              {t("title")}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 whitespace-pre-line">
              {t("subtitle")}
            </p>
          </div>
        </div>

        <div className="mb-4">
          <div
            className="text-xs sm:text-sm text-muted-foreground text-center mb-1 h-5"
            role="status"
            aria-live="polite"
          >
            {saveStatus === "saving" && (
              <span aria-label={t('saving')}>💾 {t('saving')}</span>
            )}
            {saveStatus === "saved" && (
              <span aria-label={t('saved')}>✓ {t('saved')}</span>
            )}
            {saveStatus === "error" && (
              <span aria-label={t('error')}>⚠ {t('error')}</span>
            )}
          </div>
          <div className="flex flex-wrap justify-center items-center gap-2">
            <Tooltip text={t("tooltipNewLead")}>
              <button
                onClick={handleNewLead}
                className="min-w-[80px] max-w-[100px] bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-600 text-black font-semibold py-2 px-2 rounded-lg transition-all text-[9px] sm:text-[10px] shadow-md shimmer-button"
                aria-label="Create new lead"
              >
                <span className="block truncate">➕ {t("newLead")}</span>
              </button>
            </Tooltip>
            <Tooltip text={t("tooltipViewLeads")}>
              <button
                onClick={() => setShowLeads(!showLeads)}
                disabled={allLeads.length === 0}
                className="min-w-[80px] max-w-[110px] bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-600 text-black font-semibold py-2 px-2 rounded-lg transition-all text-[9px] sm:text-[10px] shadow-md shimmer-button disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="block truncate">
                  {showLeads
                    ? `✕ ${t("hideLeads")}`
                    : `📋 ${t("viewLeads")}${allLeads.length > 0 ? ` (${allLeads.length})` : ""}`}
                </span>
              </button>
            </Tooltip>
            <Tooltip text={t("tooltipSaveLead")}>
              <button
                onClick={handleSaveLead}
                disabled={isDefaultLead || justSaved}
                className="min-w-[80px] max-w-[100px] bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-600 text-black font-semibold py-2 px-2 rounded-lg transition-all text-[9px] sm:text-[10px] shadow-md shimmer-button disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="block truncate">{justSaved ? `✓ ${t("saved")}` : `💾 ${t("saveLead")}`}</span>
              </button>
            </Tooltip>
            <DataBackup data={data} />
            <ExportButton data={data} />
          </div>
        </div>

        {showLeads && allLeads.length > 0 && (
          <div className="mb-4 bg-card/80 backdrop-blur-sm border rounded-lg p-4 shadow-lg">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold">{t('allLeads')} ({allLeads.length})</h3>
              <button
                onClick={() => {
                  setConfirmDialog({
                    isOpen: true,
                    title: t('clearAllLeads'),
                    message: t('clearAllLeadsWarning'),
                    onConfirm: handleClearAllLeads,
                  });
                }}
                className="text-xs text-destructive hover:underline"
              >
                {t('clearAll')}
              </button>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {allLeads.map((lead) => (
                <div key={lead.id} className="flex items-center gap-2">
                  <button
                    onClick={() => handleSelectLead(lead.id)}
                    className={`flex-1 text-left p-2 rounded hover:bg-secondary transition-colors ${
                      lead.id === currentLeadId ? "bg-secondary" : ""
                    }`}
                  >
                    <div className="font-medium">
                      {lead.clientName || t('unnamedLead')}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {lead.address || t('noAddress')}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {(() => {
                        const lastUpdate = lead.updatedAt || lead.createdAt;
                        const daysDiff = Math.floor((Date.now() - lastUpdate) / (1000 * 60 * 60 * 24));
                        if (daysDiff === 0) return `🕒 ${t('lastContacted')}: ${t('today')}`;
                        if (daysDiff === 1) return `🕒 ${t('lastContacted')}: ${t('yesterday')}`;
                        return `🕒 ${t('lastContacted')}: ${daysDiff} ${t('daysAgo')}`;
                      })()}
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      setConfirmDialog({
                        isOpen: true,
                        title: t('deleteLead'),
                        message: `${t('areYouSureDelete')} "${lead.clientName || t('unnamedLead')}"?`,
                        onConfirm: () => handleDeleteLead(lead.id),
                      });
                    }}
                    className="text-destructive hover:bg-destructive/10 p-2 rounded transition-colors"
                    aria-label="Delete lead"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {isDefaultLead && (
          <div className="mb-6 bg-gradient-to-r from-yellow-400/20 via-orange-500/20 to-yellow-600/20 border-2 border-yellow-500/50 rounded-lg p-6 text-center">
            <div className="text-4xl mb-3">👋</div>
            <h3 className="text-xl font-bold mb-2">{t('welcomeTitle')}</h3>
            <p className="text-muted-foreground">
              {t('welcomeMessage')}{allLeads.length > 0 ? " " + t('viewLeads').toLowerCase() + "." : ""}
            </p>
          </div>
        )}

        <div className="mb-6 space-y-6">
          <div className="hover:-translate-y-1 hover:shadow-2xl transition-all duration-300">
            <ResultsCard data={data} />
          </div>
          <div className="hover:-translate-y-1 hover:shadow-2xl transition-all duration-300">
            <BillSwapComparison data={data} />
          </div>
          <div className="hover:-translate-y-1 hover:shadow-2xl transition-all duration-300">
            <SavingsChart data={data} />
          </div>

          <div className="hover:-translate-y-1 hover:shadow-2xl transition-all duration-300">
            <EnvironmentalImpact data={data} />
          </div>

          <div
            className={`transition-shadow duration-300 ${isDefaultLead ? "opacity-50 pointer-events-none" : ""}`}
          >
            <div className="bg-white/20 dark:bg-black/30 backdrop-blur-xl border border-white/30 rounded-lg p-6 sm:p-8 shadow-2xl hover:shadow-2xl transition-shadow">
              <h2 className="text-lg sm:text-xl font-semibold mb-8">
                {t("calculator")}
              </h2>
              <div className="space-y-6 sm:space-y-8 overflow-visible">
                <SystemDetailsSection data={data} onUpdate={setData} />
              </div>
            </div>
          </div>

          <div
            className={`hover:shadow-2xl transition-all duration-300 ${isDefaultLead ? "opacity-50 pointer-events-none" : ""}`}
          >
            <div className="bg-white/20 dark:bg-black/30 backdrop-blur-xl border border-white/30 rounded-lg p-4 sm:p-6 shadow-2xl">
              <h2 className="text-lg sm:text-xl font-semibold mb-4">
                {t("administrative")}
              </h2>
              <div className="space-y-4 sm:space-y-6">
                <ClientInfoSection data={data} onUpdate={setData} />
                <CompanyInfoSection data={data} onUpdate={setData} />
                <PropertyFinancialSection data={data} onUpdate={setData} />
              </div>
              <div className="mt-6 flex justify-center">
                <button
                  onClick={handleSaveLead}
                  disabled={isDefaultLead || justSaved}
                  className="bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-600 text-black font-semibold py-3 px-8 rounded-lg transition-all shadow-md shimmer-button disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {justSaved ? `✓ ${t("saved")}` : `💾 ${t("saveLead")}`}
                </button>
              </div>
            </div>
          </div>
        </div>

        <footer className="mt-8 text-center text-sm text-muted-foreground pb-4 space-y-3">
          <div className="flex justify-center">
            <SocialShare data={data} />
          </div>
          <div className="flex flex-col items-center gap-2">
            <div>
              <span>
                {t("madeBy")}{" "}
                <a
                  href="https://teycirbensoltane.tn"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors underline"
                >
                  teycirbensoltane.tn
                </a>
              </span>
            </div>
            <div className="text-xs">{t("openSourceFree")}</div>
            <div className="text-xs">🔒 {t("dataStaysLocal")}</div>
            <a
              href="https://github.com/Teycir/SolarClose/#readme"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors flex items-center gap-1 text-xs"
              aria-label="How it works - GitHub"
            >
              <span>{t("howItWorks")}</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
            </a>
          </div>
        </footer>
      </div>

      {confirmDialog && (
        <ConfirmDialog
          isOpen={confirmDialog.isOpen}
          title={confirmDialog.title}
          message={confirmDialog.message}
          onConfirm={confirmDialog.onConfirm}
          onCancel={() => setConfirmDialog(null)}
          confirmText={confirmDialog.title.includes(t('missingRequiredFields')) ? t('ok') : t('confirm')}
          cancelText={confirmDialog.title.includes(t('missingRequiredFields')) ? "" : t('cancel')}
          isDangerous={
            confirmDialog.title.includes(t('deleteLead')) ||
            confirmDialog.title.includes(t('clearAllLeads'))
          }
        />
      )}
    </main>
  );
}
