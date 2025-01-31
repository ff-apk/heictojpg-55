import React from "react";
import { CurrencyType } from "./CurrencySelector";
import { SIPFrequency } from "@/types/calculator";
import InfoTooltip from "./InfoTooltip";
import DonutChart from "./DonutChart";
import { format, addMonths, startOfMonth } from "date-fns";
import { StepUpFrequency } from "./calculator/StepUpSIPSettings";

interface ResultCardProps {
  totalInvestment: number;
  monthlyInvestment: number;
  totalValue: number;
  currency: CurrencyType;
  sipFrequency: SIPFrequency;
  timePeriod: number;
  stepUpEnabled?: boolean;
  stepUpPercentage?: number;
  stepUpFrequency?: StepUpFrequency;
}

const formatCurrency = (value: number, currency: CurrencyType): string => {
  const currencyFormats: { [key in CurrencyType]: { locale: string, currency: string } } = {
    INR: { locale: "en-IN", currency: "INR" },
    USD: { locale: "en-US", currency: "USD" },
    EUR: { locale: "de-DE", currency: "EUR" },
    JPY: { locale: "ja-JP", currency: "JPY" },
    GBP: { locale: "en-GB", currency: "GBP" },
    CNY: { locale: "zh-CN", currency: "CNY" },
    AUD: { locale: "en-AU", currency: "AUD" },
    CAD: { locale: "en-CA", currency: "CAD" },
    CHF: { locale: "de-CH", currency: "CHF" },
    HKD: { locale: "zh-HK", currency: "HKD" },
    SGD: { locale: "en-SG", currency: "SGD" }
  };

  const format = currencyFormats[currency];
  const formatter = new Intl.NumberFormat(format.locale, {
    style: "currency",
    currency: format.currency,
    maximumFractionDigits: 0,
  });
  return formatter.format(value);
};

const ResultCard = ({
  totalInvestment,
  monthlyInvestment,
  totalValue,
  currency,
  sipFrequency,
  timePeriod,
  stepUpEnabled,
  stepUpPercentage = 0,
  stepUpFrequency = "Yearly",
}: ResultCardProps) => {
  const totalProfit = totalValue - totalInvestment;
  const profitPercentage = ((totalProfit / totalInvestment) * 100).toFixed(2);

  const getFrequencyMonths = (frequency: SIPFrequency): number => {
    switch (frequency) {
      case "Daily": return 1/30;
      case "Weekly": return 1/4;
      case "Monthly": return 1;
      case "Quarterly": return 3;
      case "Half-yearly": return 6;
      case "Yearly": return 12;
      default: return 1;
    }
  };

  const getStepUpPeriodsPerYear = (frequency: StepUpFrequency): number => {
    switch (frequency) {
      case "Monthly": return 12;
      case "Quarterly": return 4;
      case "Half-yearly": return 2;
      case "Yearly": return 1;
      default: return 1;
    }
  };

  const calculateLastSIPAmount = () => {
    if (!stepUpEnabled) return monthlyInvestment;
    
    const periodsPerYear = getStepUpPeriodsPerYear(stepUpFrequency);
    const totalPeriods = timePeriod * periodsPerYear;
    
    return monthlyInvestment * Math.pow(1 + stepUpPercentage / 100, totalPeriods - 1);
  };

  const startDate = startOfMonth(new Date());
  const frequencyMonths = getFrequencyMonths(sipFrequency);
  const totalMonths = timePeriod * 12;
  const lastSIPDate = addMonths(startDate, Math.floor(totalMonths / frequencyMonths) * frequencyMonths - frequencyMonths);
  
  const firstSIPDate = format(startDate, "MMM yyyy");
  const lastSIPDate_formatted = format(lastSIPDate, "MMM yyyy");
  const lastSIPAmount = calculateLastSIPAmount();

  const calculateXIRR = () => {
  const cashFlows = [];
  const dates = [];
  let currentDate = new Date();
  
  // Determine SIP frequency in months
  const frequencyMonths = getFrequencyMonths(sipFrequency); // Uses your existing function

  // Generate cash flows (SIP outflows)
  let totalPeriods = Math.floor((timePeriod * 12) / frequencyMonths);
  for (let i = 0; i < totalPeriods; i++) {
    cashFlows.push(-monthlyInvestment);
    dates.push(new Date(currentDate)); // Store actual investment date
    currentDate = addMonths(currentDate, frequencyMonths); // Move to next SIP date
  }

  // Final inflow (total value received at end)
  cashFlows.push(totalValue);
  dates.push(addMonths(new Date(), timePeriod * 12));

  // XIRR calculation using Newton's method
  const xirrNewton = (cashFlows, dates) => {
    const guess = 0.1; // Initial guess (10%)
    let rate = guess;
    let maxIterations = 100;
    let precision = 1e-6;

    for (let i = 0; i < maxIterations; i++) {
      let f = 0;
      let df = 0;

      for (let j = 0; j < cashFlows.length; j++) {
        const t = (dates[j] - dates[0]) / (1000 * 60 * 60 * 24 * 365); // Convert to years
        f += cashFlows[j] / Math.pow(1 + rate, t);
        df += -t * cashFlows[j] / Math.pow(1 + rate, t + 1);
      }

      let newRate = rate - f / df;
      if (Math.abs(newRate - rate) < precision) return (newRate * 100).toFixed(2);
      rate = newRate;
    }
    return (rate * 100).toFixed(2); // Convert to percentage
  };

  return xirrNewton(cashFlows, dates);
};

  return (
    <div className="border border-border bg-card dark:bg-card rounded-xl p-6 space-y-4">
      {stepUpEnabled && (
        <>
          <div className="flex justify-between items-center">
            <div className="flex flex-wrap items-center gap-x-1">
              <span className="text-gray-600 dark:text-gray-400">First SIP</span>
              <span className="text-gray-600 dark:text-gray-400">({firstSIPDate})</span>
              <InfoTooltip content="Your initial SIP amount at the start of investment" />
            </div>
            <span className="text-xl font-semibold text-foreground">
              {formatCurrency(monthlyInvestment, currency)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex flex-wrap items-center gap-x-1">
              <span className="text-gray-600 dark:text-gray-400">Last SIP</span>
              <span className="text-gray-600 dark:text-gray-400">({lastSIPDate_formatted})</span>
              <InfoTooltip content="Your final SIP amount after all step-ups" />
            </div>
            <span className="text-xl font-semibold text-foreground">
              {formatCurrency(lastSIPAmount, currency)}
            </span>
          </div>
        </>
      )}

      <div className="flex justify-between items-center">
        <div className="flex flex-wrap items-center gap-x-1">
          <span className="text-gray-600 dark:text-gray-400">Total</span>
          <span className="text-gray-600 dark:text-gray-400">Investment</span>
          <InfoTooltip content="The total amount you will invest over the entire investment period through SIP." />
        </div>
        <span className="text-xl font-semibold text-foreground">
          {formatCurrency(totalInvestment, currency)}
        </span>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex flex-wrap items-center gap-x-1">
          <span className="text-gray-600 dark:text-gray-400">Total</span>
          <span className="text-gray-600 dark:text-gray-400">Profit</span>
          <InfoTooltip content="The estimated returns generated by your SIP investment over the investment period, shown both as an absolute value and as a percentage of your total investment." />
        </div>
        <div className="flex flex-col items-end">
          <span className={`text-xl font-semibold ${totalProfit > 0 ? 'text-green-500 dark:text-green-400' : 'text-foreground'}`}>
            {formatCurrency(totalProfit, currency)}
          </span>
          <span className={`text-base font-medium ${totalProfit > 0 ? 'text-green-500 dark:text-green-400' : 'text-foreground'}`}>
            ({profitPercentage}%)
          </span>
        </div>
      </div>
      <div className="flex justify-between items-center">
        <div className="flex flex-wrap items-center gap-x-1">
          <span className="text-gray-600 dark:text-gray-400">Total</span>
          <span className="text-gray-600 dark:text-gray-400">Value</span>
          <InfoTooltip content="The final value of your investment including both your invested amount and the returns generated." />
        </div>
        <span className="text-xl font-semibold text-foreground">
          {formatCurrency(totalValue, currency)}
        </span>
      </div>

      <DonutChart
        totalInvestment={totalInvestment}
        totalWithdrawal={totalProfit}
        currency={currency}
        formatCurrency={formatCurrency}
      />

      <div className="flex justify-center items-center gap-x-1">
        <span className="text-gray-600 dark:text-gray-400">XIRR:</span>
        <span className="text-lg font-semibold text-foreground">
          {calculateXIRR()}%
        </span>
      </div>
    </div>
  );
};

export default ResultCard;
