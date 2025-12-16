'use client';

import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import type { SolarLead } from '@/types/solar';
import { calculateSolarSavings } from '@/lib/calculations';
import { formatCurrency } from '@/lib/currency';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface SavingsChartProps {
  data: SolarLead;
}

export function SavingsChart({ data }: SavingsChartProps) {
  const results = calculateSolarSavings({
    currentMonthlyBill: data.currentMonthlyBill,
    yearlyInflationRate: data.yearlyInflationRate,
    systemCost: data.systemCost,
    systemSizeKw: data.systemSizeKw,
    electricityRate: data.electricityRate,
    sunHoursPerDay: data.sunHoursPerDay,
    federalTaxCreditPercent: data.federalTaxCredit,
    stateIncentiveDollars: data.stateIncentive,
    financingOption: data.financingOption as any,
    loanTerm: data.loanTerm,
    downPayment: data.downPayment,
  });

  if (!results.yearlyBreakdown.length) return null;

  const chartData = {
    labels: results.yearlyBreakdown.map(y => `Year ${y.year}`),
    datasets: [
      {
        label: 'Utility Cost (without solar)',
        data: results.yearlyBreakdown.map(y => y.utilityCost),
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Solar Cost',
        data: results.yearlyBreakdown.map(y => y.solarCost),
        borderColor: 'rgb(255, 193, 7)',
        backgroundColor: 'rgba(255, 193, 7, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: { color: 'rgb(156, 163, 175)' }
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            return `${context.dataset.label}: ${formatCurrency(context.parsed.y, data.currency)}`;
          }
        }
      }
    },
    scales: {
      y: {
        ticks: {
          callback: (value: any) => formatCurrency(value, data.currency),
          color: 'rgb(156, 163, 175)'
        },
        grid: { color: 'rgba(156, 163, 175, 0.1)' }
      },
      x: {
        ticks: {
          maxRotation: 45,
          minRotation: 45,
          color: 'rgb(156, 163, 175)'
        },
        grid: { color: 'rgba(156, 163, 175, 0.1)' }
      }
    }
  };

  return (
    <div className="bg-card/80 backdrop-blur-sm border rounded-lg p-4 sm:p-6 space-y-3">
      <h3 className="text-lg font-semibold">Cost Comparison Over 25 Years</h3>
      <div className="h-64">
        <Line data={chartData} options={options} />
      </div>
      <div className="text-center pt-2 border-t">
        <span className="text-sm text-muted-foreground">Break-even: Year {data.breakEvenYear} | Total Savings: </span>
        <span className="text-lg font-bold text-primary">{formatCurrency(data.twentyFiveYearSavings, data.currency)}</span>
      </div>
    </div>
  );
}
