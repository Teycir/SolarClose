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
      },
    }).catch((error) => {
      const sanitizedError = error instanceof Error ? error.message : String(error);
      console.error('Failed to open IndexedDB:', sanitizedError);
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
  try {
    savedCompany = localStorage.getItem('solarclose-company') || '';
    savedSalesRep = localStorage.getItem('solarclose-salesrep') || '';
    savedPhone = localStorage.getItem('solarclose-phone') || '';
  } catch (e) {
    console.warn('localStorage unavailable');
  }
  const { calculateSolarSavings } = await import('@/lib/calculations');
  const results = calculateSolarSavings({
    currentMonthlyBill: 250,
    yearlyInflationRate: 4,
    systemCost: 25000,
    systemSizeKw: 8.5,
    electricityRate: 0.15,
    sunHoursPerDay: 5,
    federalTaxCreditPercent: 30,
    stateIncentiveDollars: 1000,
  });
  return {
    id: leadId,
    createdAt: Date.now(),
    date: new Date().toISOString().split('T')[0],
    clientName: '',
    address: '',
    companyName: savedCompany,
    companyPhone: savedPhone,
    productDescription: '',
    salesRep: savedSalesRep,
    currency: 'USD',
    language: 'en',
    currentMonthlyBill: 250,
    yearlyInflationRate: 4,
    systemSizeKw: 8.5,
    systemCost: 25000,
    electricityRate: 0.15,
    sunHoursPerDay: 5,
    federalTaxCredit: 30,
    stateIncentive: 1000,
    twentyFiveYearSavings: results.twentyFiveYearSavings,
    breakEvenYear: results.breakEvenYear,
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
        const sanitizedError = error instanceof Error ? error.message : String(error);
        console.error('Failed to load lead:', sanitizedError);
        if (isMounted) {
          setSaveStatus('error');
        }
      }
    };

    loadData().catch((error) => {
      const sanitizedError = error instanceof Error ? error.message : String(error);
      console.error('Unhandled error in loadData:', sanitizedError);
    });
    
    return () => {
      isMounted = false;
    };
  }, [leadId]);

  const debounceRef = useRef<NodeJS.Timeout>();
  const statusTimeoutRef = useRef<NodeJS.Timeout>();

  const saveToIndexedDB = useCallback(async (leadData: SolarLead) => {
    if (!leadData.clientName.trim() || !leadData.salesRep?.trim()) return;
    try {
      setSaveStatus('saving');
      const db = await getDB();
      await db.put(STORE_NAME, leadData);
      setSaveStatus('saved');
      if (statusTimeoutRef.current) clearTimeout(statusTimeoutRef.current);
      statusTimeoutRef.current = setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      const sanitizedError = error instanceof Error ? error.message : String(error);
      console.error('Failed to save lead:', sanitizedError);
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
      debounceRef.current = setTimeout(() => saveToIndexedDB(updated), 500);
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
    await saveToIndexedDB(data);
  }, [data, saveToIndexedDB]);

  return {
    data,
    setData: updateData,
    saveStatus,
    saveLead,
  };
}
