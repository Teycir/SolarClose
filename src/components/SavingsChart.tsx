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

  // Calculate cumulative costs - what you actually spend
  let cumulativeUtilitySpend = 0;
  let cumulativeSolarSpend = 0;
  const cumulativeData = results.yearlyBreakdown.map(y => {
    cumulativeUtilitySpend += y.utilityCost;
    cumulativeSolarSpend += y.solarCost;
    return {
      year: y.year,
      utilitySpend: cumulativeUtilitySpend,
      solarSpend: cumulativeSolarSpend,
    };
  });

  const chartData = {
    labels: cumulativeData.map(y => y.year === 1 || y.year % 5 === 0 || y.year === 25 ? `${y.year}` : ''),
    datasets: [
      {
        label: 'Without Solar (Utility Bills)',
        data: cumulativeData.map(y => y.utilitySpend),
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.05)',
        tension: 0.3,
        borderWidth: 3,
        pointRadius: 0,
        pointHoverRadius: 6,
      },
      {
        label: 'With Solar (Total Investment)',
        data: cumulativeData.map(y => y.solarSpend),
        borderColor: 'rgb(255, 193, 7)',
        backgroundColor: 'rgba(255, 193, 7, 0.05)',
        tension: 0.3,
        borderWidth: 3,
        pointRadius: 0,
        pointHoverRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: { 
          color: 'rgb(156, 163, 175)',
          font: { size: 12 },
          padding: 15
        }
      },
      tooltip: {
        callbacks: {
          title: (context: any) => `Year ${context[0].dataIndex + 1}`,
          label: (context: any) => {
            return `${context.dataset.label}: ${formatCurrency(context.parsed.y, data.currency)}`;
          },
          afterBody: (context: any) => {
            const year = context[0].dataIndex + 1;
            if (year === data.breakEvenYear) {
              return '\n🎯 BREAK-EVEN POINT';
            }
            return '';
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value: any) => formatCurrency(value, data.currency),
          color: 'rgb(156, 163, 175)',
          font: { size: 11 }
        },
        grid: { color: 'rgba(156, 163, 175, 0.1)' },
        title: {
          display: true,
          text: 'Cumulative Cost',
          color: 'rgb(156, 163, 175)',
          font: { size: 12 }
        }
      },
      x: {
        ticks: {
          color: 'rgb(156, 163, 175)',
          font: { size: 11 }
        },
        grid: { color: 'rgba(156, 163, 175, 0.1)' },
        title: {
          display: true,
          text: 'Year',
          color: 'rgb(156, 163, 175)',
          font: { size: 12 }
        }
      }
    }
  };

  return (
    <div className="bg-card/80 backdrop-blur-sm border rounded-lg p-4 sm:p-6 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">25-Year Cost Comparison</h3>
        <div className="text-xs bg-primary/20 px-3 py-1 rounded-full">
          🎯 Break-even: Year {data.breakEvenYear}
        </div>
      </div>
      <div className="h-72">
        <Line data={chartData} options={options} />
      </div>
      <div className="grid grid-cols-2 gap-4 pt-3 border-t text-sm">
        <div>
          <span className="text-muted-foreground">Without Solar (25yr): </span>
          <span className="font-semibold text-destructive">{formatCurrency(cumulativeData[24].utilitySpend, data.currency)}</span>
        </div>
        <div>
          <span className="text-muted-foreground">With Solar (25yr): </span>
          <span className="font-semibold text-primary">{formatCurrency(cumulativeData[24].solarSpend, data.currency)}</span>
        </div>
      </div>
      <div className="text-center pt-2 border-t">
        <span className="text-sm text-muted-foreground">Total Savings: </span>
        <span className="text-xl font-bold text-primary">{formatCurrency(data.twentyFiveYearSavings, data.currency)}</span>
      </div>
    </div>
  );
}
