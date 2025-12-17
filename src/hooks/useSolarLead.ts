'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { openDB, type IDBPDatabase } from 'idb';
import type { SolarLead } from '@/types/solar';

const DB_NAME = 'solar-leads';
const STORE_NAME = 'leads';
const DB_VERSION = 2;

let dbPromise: Promise<IDBPDatabase> | null = null;

const getDB = async () => {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('product-descriptions')) {
          db.createObjectStore('product-descriptions', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('companies')) {
          db.createObjectStore('companies', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('sales-reps')) {
          db.createObjectStore('sales-reps', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('phones')) {
          db.createObjectStore('phones', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('proposal-conditions')) {
          db.createObjectStore('proposal-conditions', { keyPath: 'id' });
        }
      },
    }).catch((error) => {
      const errorMsg = error instanceof Error ? error.message : String(error);
      const sanitizedError = errorMsg.replace(/[\r\n]/g, ' ');
      console.error('Failed to open IndexedDB:', sanitizedError);
      if (error instanceof Error && error.stack) {
        console.error('Stack trace:', error.stack.replace(/[\r\n]/g, ' | '));
      }
      dbPromise = null;
      throw error;
    });
  }
  return dbPromise;
};

const createDefaultLead = async (leadId: string): Promise<SolarLead> => {
  let savedCompany = '';
  let savedSalesRep = '';
  let savedPhone = '';
  let savedLogo = '';
  let savedLanguage: 'en' | 'es' | 'it' | 'fr' | 'de' = 'en';
  let savedCurrency: 'USD' | 'EUR' = 'USD';
  try {
    savedCompany = localStorage.getItem('solarclose-company') || '';
    savedSalesRep = localStorage.getItem('solarclose-salesrep') || '';
    savedPhone = localStorage.getItem('solarclose-phone') || '';
    savedLogo = localStorage.getItem('solarclose-logo') || '';
    const lang = localStorage.getItem('solarclose-language');
    savedLanguage = (lang === 'es' || lang === 'it' || lang === 'fr' || lang === 'de') ? lang : 'en';
    const curr = localStorage.getItem('solarclose-currency');
    savedCurrency = curr === 'EUR' ? 'EUR' : 'USD';
  } catch (e) {
    console.warn('localStorage unavailable');
  }
  const { calculateSolarSavings } = await import('@/lib/calculations');
  const { getTranslation } = await import('@/lib/translations');
  const results = calculateSolarSavings({
    currentMonthlyBill: 120,
    yearlyInflationRate: 3.5,
    systemCost: 20000,
    systemSizeKw: 7,
    electricityRate: 0.16,
    sunHoursPerDay: 4.5,
    federalTaxCreditPercent: 30,
    stateIncentiveDollars: 0,
  });
  const defaultProposalConditions = getTranslation(savedLanguage, 'proposalCondPlaceholder');
  return {
    id: leadId,
    createdAt: Date.now(),
    date: new Date().toISOString().split('T')[0],
    clientName: '',
    address: '',
    companyName: savedCompany,
    companyPhone: savedPhone,
    companyLogo: savedLogo || undefined,
    productDescription: '',
    salesRep: savedSalesRep,
    proposalConditions: defaultProposalConditions,
    currency: savedCurrency,
    language: savedLanguage,
    currentMonthlyBill: 120,
    yearlyInflationRate: 3.5,
    systemSizeKw: 7,
    systemCost: 20000,
    electricityRate: 0.16,
    sunHoursPerDay: 4.5,
    federalTaxCredit: 30,
    stateIncentive: 0,
    has25YearInverterWarranty: false,
    twentyFiveYearSavings: results.twentyFiveYearSavings,
    breakEvenYear: results.breakEvenYear,
    yearlyBreakdown: results.yearlyBreakdown,
    isSynced: false,
  };
};

export function useSolarLead(leadId: string) {
  const [data, setData] = useState<SolarLead | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  useEffect(() => {
    let isMounted = true;
    
    const loadData = async () => {
      try {
        const db = await getDB();
        const stored = await db.get(STORE_NAME, leadId);
        
        if (!isMounted) return;
        
        if (stored) {
          setData(stored);
        } else {
          const newLead = await createDefaultLead(leadId);
          if (isMounted) {
            setData(newLead);
          }
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        const sanitizedError = errorMsg.replace(/[\r\n]/g, ' ');
        console.error('Failed to load lead:', sanitizedError);
        if (error instanceof Error && error.stack) {
          console.error('Stack trace:', error.stack.replace(/[\r\n]/g, ' | '));
        }
        if (isMounted) {
          setSaveStatus('error');
        }
      }
    };

    loadData().catch((error) => {
      const errorMsg = error instanceof Error ? error.message : String(error);
      const sanitizedError = errorMsg.replace(/[\r\n]/g, ' ');
      console.error('Unhandled error in loadData:', sanitizedError);
      if (error instanceof Error && error.stack) {
        console.error('Stack trace:', error.stack.replace(/[\r\n]/g, ' | '));
      }
    });
    
    return () => {
      isMounted = false;
    };
  }, [leadId]);

  const debounceRef = useRef<NodeJS.Timeout>();
  const statusTimeoutRef = useRef<NodeJS.Timeout>();

  const saveToIndexedDB = useCallback(async (leadData: SolarLead) => {
    if (!leadData.clientName.trim()) return;
    try {
      setSaveStatus('saving');
      const db = await getDB();
      const dataWithTimestamp = { ...leadData, updatedAt: Date.now() };
      await db.put(STORE_NAME, dataWithTimestamp);
      setSaveStatus('saved');
      if (statusTimeoutRef.current) clearTimeout(statusTimeoutRef.current);
      statusTimeoutRef.current = setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      const sanitizedError = errorMsg.replace(/[\r\n]/g, ' ');
      console.error('Failed to save lead:', sanitizedError);
      if (error instanceof Error && error.stack) {
        console.error('Stack trace:', error.stack.replace(/[\r\n]/g, ' | '));
      }
      setSaveStatus('error');
      if (statusTimeoutRef.current) clearTimeout(statusTimeoutRef.current);
      statusTimeoutRef.current = setTimeout(() => setSaveStatus('idle'), 3000);
    }
  }, []);

  const updateData = useCallback((updates: Partial<SolarLead>) => {
    setData(prev => {
      if (!prev) return null;
      const updated = { ...prev, ...updates };
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        saveToIndexedDB(updated).catch((error) => {
          const errorMsg = error instanceof Error ? error.message : String(error);
          console.error('Error in debounced save:', errorMsg.replace(/[\r\n]/g, ' '));
          if (error instanceof Error && error.stack) {
            console.error('Stack trace:', error.stack.replace(/[\r\n]/g, ' | '));
          }
        });
      }, 500);
      return updated;
    });
  }, [saveToIndexedDB]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (statusTimeoutRef.current) clearTimeout(statusTimeoutRef.current);
    };
  }, []);

  const saveLead = useCallback(async () => {
    if (!data) return;
    try {
      await saveToIndexedDB(data);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      const sanitizedError = errorMsg.replace(/[\r\n]/g, ' ');
      console.error('Unexpected error in saveLead:', sanitizedError);
      if (error instanceof Error && error.stack) {
        console.error('Stack trace:', error.stack.replace(/[\r\n]/g, ' | '));
      }
    }
  }, [data, saveToIndexedDB]);

  return {
    data,
    setData: updateData,
    saveStatus,
    saveLead,
  };
}
