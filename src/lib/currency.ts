const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
};

export function getCurrencySymbol(currency: string = 'USD'): string {
  return CURRENCY_SYMBOLS[currency] || '$';
}

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  if (!isFinite(amount)) amount = 0;
  
  const currencyMap: Record<string, string> = {
    USD: 'en-US',
    EUR: 'de-DE',
    GBP: 'en-GB',
  };

  const validCurrency = currencyMap[currency] ? currency : 'USD';
  
  try {
    return new Intl.NumberFormat(currencyMap[validCurrency], {
      style: 'currency',
      currency: validCurrency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Failed to format currency:', errorMessage.replace(/[\r\n]/g, ' '));
    if (error instanceof Error && error.stack) {
      console.error('Stack trace:', error.stack.replace(/[\r\n]/g, ' | '));
    }
    const symbol = CURRENCY_SYMBOLS[validCurrency] || '$';
    return `${symbol}${Math.round(amount).toLocaleString()}`;
  }
}
