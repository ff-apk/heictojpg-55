import React, { useState, useEffect } from "react";
import SliderInput from "@/components/slider/SliderInput";
import ResultCard from "@/components/ResultCard";
import CurrencySelector, { CurrencyType } from "@/components/CurrencySelector";

const Index = () => {
  const [totalInvestment, setTotalInvestment] = useState(500000);
  const [monthlyWithdrawal, setMonthlyWithdrawal] = useState(5000);
  const [returnRate, setReturnRate] = useState(13);
  const [timePeriod, setTimePeriod] = useState(10);
  const [finalValue, setFinalValue] = useState(0);
  const [withdrawalPercentage, setWithdrawalPercentage] = useState(1);
  const [currency, setCurrency] = useState<CurrencyType>(() => {
    const savedCurrency = localStorage.getItem("selectedCurrency");
    return (savedCurrency as CurrencyType) || "INR";
  });

  // Save currency selection to localStorage
  useEffect(() => {
    localStorage.setItem("selectedCurrency", currency);
  }, [currency]);

  // Calculate minimum monthly withdrawal (0.1% of total investment)
  const minMonthlyWithdrawal = Math.max(100, Math.round(totalInvestment * 0.001));

  // Calculate maximum monthly withdrawal (total investment / 12)
  const maxMonthlyWithdrawal = Math.floor(totalInvestment / 12);

  // Calculate withdrawal percentage whenever total investment or monthly withdrawal changes
  useEffect(() => {
    const percentage = (monthlyWithdrawal / totalInvestment) * 100;
    // Format to handle small decimals properly (up to 3 decimal places)
    setWithdrawalPercentage(Number(percentage.toFixed(3)));
  }, [totalInvestment, monthlyWithdrawal]);

  // Ensure monthly withdrawal stays within bounds when total investment changes
  useEffect(() => {
    if (monthlyWithdrawal < minMonthlyWithdrawal) {
      setMonthlyWithdrawal(minMonthlyWithdrawal);
    } else if (monthlyWithdrawal > maxMonthlyWithdrawal) {
      setMonthlyWithdrawal(maxMonthlyWithdrawal);
    }
  }, [totalInvestment, minMonthlyWithdrawal, maxMonthlyWithdrawal]);

  const calculateSWP = () => {
    const n = 12; // 12 months in a year
    const r = returnRate / (n * 100); // Monthly return rate
    const t = timePeriod; // Number of years

    // Future Value Calculation using the compound interest formula with monthly withdrawals
    let result = Math.round(
      (totalInvestment * Math.pow((1 + returnRate / 100), t)) -
      (monthlyWithdrawal * (Math.pow((1 + (Math.pow((1 + returnRate / 100), (1 / n)) - 1)), (t * n)) - 1) /
        (Math.pow((1 + returnRate / 100), (1 / n)) - 1))
    );

    return Math.max(0, result);
  };

  useEffect(() => {
    const result = calculateSWP();
    setFinalValue(result);
  }, [totalInvestment, monthlyWithdrawal, returnRate, timePeriod]);

  // Handle value changes with locking logic
  const handleTotalInvestmentChange = (value: number) => {
    if (finalValue === 0 && value < totalInvestment) return;
    setTotalInvestment(value);
  };

  const handleMonthlyWithdrawalChange = (value: number) => {
    if (finalValue === 0 && value > monthlyWithdrawal) return;
    setMonthlyWithdrawal(value);
  };

  const handleReturnRateChange = (value: number) => {
    if (finalValue === 0 && value < returnRate) return;
    setReturnRate(value);
  };

  const handleTimePeriodChange = (value: number) => {
    if (finalValue === 0 && value > timePeriod) return;
    setTimePeriod(value);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            SWP Calculator
          </h1>
          <p className="mt-2 text-gray-600">
            Calculate your Systematic Withdrawal Plan
          </p>
          <CurrencySelector value={currency} onChange={setCurrency} />
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
          <SliderInput
            label="Total investment"
            value={totalInvestment}
            onChange={handleTotalInvestmentChange}
            min={1000}
            max={500000000}
            step={1000}
            currency={currency}
            formatValue={true}
            isLocked={finalValue === 0}
            lockDirection="decrement"
            maxLength={12}
          />

          <div className="space-y-1">
            <SliderInput
              label="Withdrawal per month"
              value={monthlyWithdrawal}
              onChange={handleMonthlyWithdrawalChange}
              min={minMonthlyWithdrawal}
              max={1000000}
              step={100}
              currency={currency}
              formatValue={true}
              dynamicMax={maxMonthlyWithdrawal}
              isLocked={finalValue === 0}
              lockDirection="increment"
              maxLength={10}
            />
            <p className="text-base text-gray-600 ml-1">{withdrawalPercentage}% of Total investment</p>
          </div>

          <SliderInput
            label="Expected return rate (p.a)"
            value={returnRate}
            onChange={handleReturnRateChange}
            min={1}
            max={50}
            step={0.1}
            suffix="%"
            isLocked={finalValue === 0}
            lockDirection="decrement"
            maxLength={2}
          />

          <SliderInput
            label="Time period"
            value={timePeriod}
            onChange={handleTimePeriodChange}
            min={1}
            max={50}
            step={1}
            suffix=" Yr"
            isLocked={finalValue === 0}
            lockDirection="increment"
            maxLength={2}
          />
        </div>

        <ResultCard
          totalInvestment={totalInvestment}
          totalWithdrawal={monthlyWithdrawal * timePeriod * 12}
          finalValue={finalValue}
          currency={currency}
        />

        <footer className="text-center text-sm text-gray-600 pb-4">
          Made with ❤️ by{" "}
          <a 
            href="https://mutualfundjournal.in/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Mutual Fund Journal
          </a>
        </footer>
      </div>
    </div>
  );
};

export default Index;
