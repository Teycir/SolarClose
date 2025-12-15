'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { openDB, type IDBPDatabase } from 'idb';
import type { SolarLead } from '@/types/solar';

const DB_NAME = 'solar-leads';
const STORE_NAME = 'leads';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase> | null = null;

const getDB = async () => {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      },
    }).catch((error) => {
      console.error('Failed to open IndexedDB:', error);
      dbPromise = null;
      throw error;
    });
  }
  return dbPromise;
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
          let savedCompany = '';
          let savedSalesRep = '';
          try {
            savedCompany = localStorage.getItem('solarclose-company') || '';
            savedSalesRep = localStorage.getItem('solarclose-salesrep') || '';
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
          
          const newLead: SolarLead = {
            id: leadId,
            createdAt: Date.now(),
            date: new Date().toISOString().split('T')[0],
            clientName: '',
            address: '',
            companyName: savedCompany,
            companyPhone: '',
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
          if (isMounted) {
            setData(newLead);
            await db.put(STORE_NAME, newLead);
          }
        }
      } catch (error) {
        console.error('Failed to load lead:', error);
        if (isMounted) {
          setSaveStatus('error');
        }
      }
    };

    loadData().catch((error) => {
      console.error('Unhandled error in loadData:', error);
    });
    
    return () => {
      isMounted = false;
    };
  }, [leadId]);

  const debounceRef = useRef<NodeJS.Timeout>();
  const statusTimeoutRef = useRef<NodeJS.Timeout>();

  const saveToIndexedDB = useCallback(async (leadData: SolarLead) => {
    try {
      setSaveStatus('saving');
      const db = await getDB();
      await db.put(STORE_NAME, leadData);
      setSaveStatus('saved');
      if (statusTimeoutRef.current) clearTimeout(statusTimeoutRef.current);
      statusTimeoutRef.current = setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Failed to save lead:', error);
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

  return {
    data,
    setData: updateData,
    saveStatus,
  };
}
