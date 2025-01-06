import React, { useState, useEffect } from "react";
import ResultCard from "@/components/ResultCard";
import CurrencySelector, { CurrencyType } from "@/components/CurrencySelector";
import { Button } from "@/components/ui/button";
import { RefreshCw, Undo } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import CalculatorForm from "@/components/CalculatorForm";
import useTheme from "@/hooks/useTheme";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";

const Index = () => {
  useTheme(); // Apply theme using the custom hook
  const [totalInvestment, setTotalInvestment] = useState(() => {
    const saved = localStorage.getItem("totalInvestment");
    return saved ? Number(saved) : 500000;
  });
  
  const [monthlyWithdrawal, setMonthlyWithdrawal] = useState(() => {
    const saved = localStorage.getItem("monthlyWithdrawal");
    return saved ? Number(saved) : 5000;
  });
  
  const [returnRate, setReturnRate] = useState(() => {
    const saved = localStorage.getItem("returnRate");
    return saved ? Number(saved) : 13;
  });
  
  const [timePeriod, setTimePeriod] = useState(() => {
    const saved = localStorage.getItem("timePeriod");
    return saved ? Number(saved) : 10;
  });

  const [finalValue, setFinalValue] = useState(0);
  const [withdrawalPercentage, setWithdrawalPercentage] = useState(1);
  const [currency, setCurrency] = useState<CurrencyType>(() => {
    const savedCurrency = localStorage.getItem("selectedCurrency");
    return (savedCurrency as CurrencyType) || "INR";
  });

  // Save inputs to localStorage
  useEffect(() => {
    localStorage.setItem("totalInvestment", totalInvestment.toString());
    localStorage.setItem("monthlyWithdrawal", monthlyWithdrawal.toString());
    localStorage.setItem("returnRate", returnRate.toString());
    localStorage.setItem("timePeriod", timePeriod.toString());
  }, [totalInvestment, monthlyWithdrawal, returnRate, timePeriod]);

  // Save currency selection to localStorage
  useEffect(() => {
    localStorage.setItem("selectedCurrency", currency);
  }, [currency]);

  // Calculate withdrawal percentage whenever total investment or monthly withdrawal changes
  useEffect(() => {
    const percentage = (monthlyWithdrawal / totalInvestment) * 100;
    setWithdrawalPercentage(Number(percentage.toFixed(3)));
  }, [totalInvestment, monthlyWithdrawal]);

  const handleReset = () => {
    // Store current values for undo functionality
    const previousValues = {
      totalInvestment,
      monthlyWithdrawal,
      returnRate,
      timePeriod
    };

    // Reset values
    setTotalInvestment(500000);
    setMonthlyWithdrawal(5000);
    setReturnRate(13);
    setTimePeriod(10);
    
    // Clear localStorage
    localStorage.removeItem("totalInvestment");
    localStorage.removeItem("monthlyWithdrawal");
    localStorage.removeItem("returnRate");
    localStorage.removeItem("timePeriod");
    
    toast({
      title: "Reset Complete",
      description: "All values reset to default",
      duration: 5000,
      action: (
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => {
            setTotalInvestment(previousValues.totalInvestment);
            setMonthlyWithdrawal(previousValues.monthlyWithdrawal);
            setReturnRate(previousValues.returnRate);
            setTimePeriod(previousValues.timePeriod);
            
            // Restore localStorage
            localStorage.setItem("totalInvestment", previousValues.totalInvestment.toString());
            localStorage.setItem("monthlyWithdrawal", previousValues.monthlyWithdrawal.toString());
            localStorage.setItem("returnRate", previousValues.returnRate.toString());
            localStorage.setItem("timePeriod", previousValues.timePeriod.toString());
            
            toast({
              title: "Values Restored",
              description: "Previous values have been restored",
              duration: 3000,
            });
          }}
        >
          <Undo className="h-4 w-4" />
          Undo
        </Button>
      ),
    });
  };

  const handleCurrencyChange = (newCurrency: CurrencyType) => {
    setCurrency(newCurrency);
    toast({
      title: "Currency Changed",
      description: `Switched to ${newCurrency} ${getCurrencySymbol(newCurrency)}`,
      duration: 5000,
    });
  };

  const getCurrencySymbol = (currency: CurrencyType): string => {
    const symbols: { [key in CurrencyType]: string } = {
      INR: "₹", USD: "$", EUR: "€", JPY: "¥", GBP: "£",
      CNY: "¥", AUD: "$", CAD: "$", CHF: "Fr", HKD: "$", SGD: "$"
    };
    return symbols[currency];
  };

  return (
    <>
      <SEO
        title="SWP Calculator - Systematic Withdrawal Plan Calculator"
        description="Calculate your Systematic Withdrawal Plan (SWP) easily with our free calculator. Plan your investment withdrawals effectively."
        canonicalUrl="https://swp-calculator.mutualfundjournal.in/"
        robots="max-image-preview:large"
        ogTitle="SWP Calculator - Systematic Withdrawal Plan Calculator"
        ogDescription="Calculate your Systematic Withdrawal Plan (SWP) easily with our free calculator. Plan your investment withdrawals effectively."
        ogUrl="https://swp-calculator.mutualfundjournal.in/"
        ogImage="https://swp-calculator.mutualfundjournal.in/banner.jpg"
        ogType="website"
      />
      <div className="min-h-screen bg-background text-foreground py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-foreground sm:text-4xl">
              SWP Calculator
            </h1>
            <p className="mt-2 text-muted-foreground">
              Calculate your Systematic Withdrawal Plan
            </p>
            <CurrencySelector value={currency} onChange={handleCurrencyChange} />
          </div>

          <CalculatorForm
            totalInvestment={totalInvestment}
            setTotalInvestment={setTotalInvestment}
            monthlyWithdrawal={monthlyWithdrawal}
            setMonthlyWithdrawal={setMonthlyWithdrawal}
            returnRate={returnRate}
            setReturnRate={setReturnRate}
            timePeriod={timePeriod}
            setTimePeriod={setTimePeriod}
            withdrawalPercentage={withdrawalPercentage}
            currency={currency}
          />

          <ResultCard
            totalInvestment={totalInvestment}
            totalWithdrawal={monthlyWithdrawal * timePeriod * 12}
            finalValue={finalValue}
            currency={currency}
          />

          <div className="flex justify-center">
            <Button
              onClick={handleReset}
              variant="outline"
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Reset
            </Button>
          </div>

          <Footer />
        </div>
      </div>
    </>
  );
};

export default Index;