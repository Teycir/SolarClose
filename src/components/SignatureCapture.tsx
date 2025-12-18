'use client';

import { useRef, useState, useEffect } from 'react';
import type { Language } from '@/types/solar';
import { getTranslation, type TranslationKey } from '@/lib/translations';

interface SignatureCaptureProps {
  onSave: (signature: string) => void;
  onCancel: () => void;
  language?: Language;
  existingSignature?: string;
}

export function SignatureCapture({ onSave, onCancel, language = 'en', existingSignature }: SignatureCaptureProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isEmpty, setIsEmpty] = useState(true);
  const t = (key: string) => getTranslation(language, key as TranslationKey);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size with device pixel ratio for crisp rendering
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    // Fill with white background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Load existing signature if provided
    if (existingSignature) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        setIsEmpty(false);
      };
      img.onerror = () => {
        console.error('Failed to load existing signature');
        setIsEmpty(true);
      };
      img.src = existingSignature;
    } else {
      setIsEmpty(true);
    }
  }, [existingSignature]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    setIsEmpty(false);

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear and fill with white background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setIsEmpty(true);
  };

  const save = () => {
    const canvas = canvasRef.current;
    if (!canvas || isEmpty) return;

    try {
      const signature = canvas.toDataURL('image/png', 0.8);
      // Check size (base64 is ~1.37x original, limit to ~100KB)
      if (signature.length > 140000) {
        console.warn('Signature too large, compressing...');
        const compressed = canvas.toDataURL('image/jpeg', 0.5);
        onSave(compressed);
      } else {
        onSave(signature);
      }
    } catch (error) {
      console.error('Failed to save signature:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full shadow-2xl">
        <h3 className="text-lg font-semibold mb-4">{t('signatureTitle')}</h3>
        
        <div className="border-2 border-gray-300 dark:border-gray-600 rounded-lg mb-4 bg-white">
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            className="w-full h-48 touch-none cursor-crosshair"
          />
        </div>

        <p className="text-xs text-center text-muted-foreground mb-4">
          {t('signatureInstructions')}
        </p>

        <div className="flex gap-2 justify-end">
          <button
            onClick={clear}
            className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            {t('clear')}
          </button>
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            {t('cancel')}
          </button>
          <button
            onClick={save}
            disabled={isEmpty}
            className="px-4 py-2 text-sm bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-600 text-black font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('saveSignature')}
          </button>
        </div>
      </div>
    </div>
  );
}
