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
    const symbol = validCurrency === 'EUR' ? '€' : validCurrency === 'GBP' ? '£' : '$';
    return `${symbol}${Math.round(amount).toLocaleString()}`;
  }
}
