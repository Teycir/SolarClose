export function formatCurrency(amount: number, currency: string = 'USD'): string {
  if (!isFinite(amount)) return '$0';
  
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
  } catch {
    return `${amount}`;
  }
}
