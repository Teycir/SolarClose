export function formatCurrency(amount: number, currency: string = 'USD'): string {
  const currencyMap: Record<string, string> = {
    USD: 'en-US',
    EUR: 'de-DE',
    GBP: 'en-GB',
  };

  return new Intl.NumberFormat(currencyMap[currency] || 'en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
