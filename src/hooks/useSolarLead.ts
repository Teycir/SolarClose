'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { openDB, type IDBPDatabase } from 'idb';
import type { SolarLead } from '@/types/solar';

const DB_NAME = 'solar-leads';
const STORE_NAME = 'leads';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase> | null = null;

const getDB = () => {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      },
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
          const newLead: SolarLead = {
            id: leadId,
            createdAt: Date.now(),
            date: new Date().toISOString().split('T')[0],
            clientName: '',
            address: '',
            companyName: savedCompany,
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
            twentyFiveYearSavings: 0,
            breakEvenYear: 0,
            isSynced: false,
          };
          if (isMounted) {
            setData(newLead);
          }
        }
      } catch (error) {
        console.error('Failed to load lead:', error);
        if (isMounted) {
          setSaveStatus('error');
        }
      }
    };

    loadData();
    
    return () => {
      isMounted = false;
    };
  }, [leadId]);

  const saveToIndexedDB = useCallback(async (leadData: SolarLead) => {
    try {
      setSaveStatus('saving');
      const db = await getDB();
      await db.put(STORE_NAME, leadData);
      setSaveStatus('saved');
      clearTimeout(statusTimeoutRef.current);
      statusTimeoutRef.current = setTimeout(() => setSaveStatus('idle'), 1000);
    } catch (error) {
      console.error('Failed to save lead:', error);
      setSaveStatus('error');
    }
  }, []);

  const debounceRef = useRef<NodeJS.Timeout>();
  const statusTimeoutRef = useRef<NodeJS.Timeout>();

  const updateData = useCallback((updates: Partial<SolarLead>) => {
    setData(prev => {
      if (!prev) return null;
      const updated = { ...prev, ...updates };
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => saveToIndexedDB(updated), 500);
      return updated;
    });
  }, [saveToIndexedDB]);

  return {
    data,
    setData: updateData,
    saveStatus,
  };
}
