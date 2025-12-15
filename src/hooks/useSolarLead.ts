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
    const loadData = async () => {
      try {
        const db = await getDB();
        const stored = await db.get(STORE_NAME, leadId);
        
        if (stored) {
          setData(stored);
        } else {
          const newLead: SolarLead = {
            id: leadId,
            createdAt: Date.now(),
            date: new Date().toISOString().split('T')[0],
            clientName: '',
            address: '',
            companyName: '',
            currentMonthlyBill: 250,
            yearlyInflationRate: 4,
            systemSizeKw: 8.5,
            systemCost: 25000,
            twentyFiveYearSavings: 0,
            breakEvenYear: 0,
            isSynced: false,
          };
          setData(newLead);
        }
      } catch (error) {
        console.error('Failed to load lead:', error);
        setSaveStatus('error');
      }
    };

    loadData();
  }, [leadId]);

  const saveToIndexedDB = useCallback(async (leadData: SolarLead) => {
    try {
      setSaveStatus('saving');
      const db = await getDB();
      await db.put(STORE_NAME, leadData);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 1000);
    } catch (error) {
      console.error('Failed to save lead:', error);
      setSaveStatus('error');
    }
  }, []);

  const debounceRef = useRef<NodeJS.Timeout>();
  const debounce = useCallback((func: () => void, wait: number) => {
    return () => {
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(func, wait);
    };
  }, []);

  const updateData = useCallback((updates: Partial<SolarLead>) => {
    setData(prev => {
      if (!prev) return null;
      const updated = { ...prev, ...updates };
      debounce(() => saveToIndexedDB(updated), 500)();
      return updated;
    });
  }, [saveToIndexedDB, debounce]);

  return {
    data,
    setData: updateData,
    saveStatus,
  };
}
