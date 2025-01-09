import React from "react";
import ResultCard from "@/components/ResultCard";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import CalculatorForm from "@/components/CalculatorForm";
import useTheme from "@/hooks/useTheme";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import ActionButtons from "@/components/ActionButtons";
import { useCalculator } from "@/hooks/useCalculator";
import CalculatorHeader from "@/components/calculator/CalculatorHeader";
import AdSenseHorizontal from "@/components/AdSenseHorizontal";
import AdSenseResponsive from "@/components/AdSenseResponsive";

const Index = () => {
  useTheme();

  const {
    totalInvestment,
    setTotalInvestment,
    monthlyWithdrawal,
    setMonthlyWithdrawal,
    returnRate,
    setReturnRate,
    timePeriod,
    setTimePeriod,
    withdrawalFrequency,
    setWithdrawalFrequency,
    finalValue,
    withdrawalPercentage,
    currency,
    setCurrency,
  } = useCalculator();

  const handleReset = () => {
    setTotalInvestment(500000);
    setMonthlyWithdrawal(5000);
    setReturnRate(13);
    setTimePeriod(10);
    setWithdrawalFrequency("Monthly");
    setCurrency("INR");

    // Clear URL parameters
    window.history.replaceState({}, '', window.location.pathname);
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
          <AdSenseHorizontal />
          <CalculatorHeader currency={currency} onCurrencyChange={setCurrency} />

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
            withdrawalFrequency={withdrawalFrequency}
            setWithdrawalFrequency={setWithdrawalFrequency}
          />
<AdSenseResponsive />
          <ResultCard
            totalInvestment={totalInvestment}
            monthlyWithdrawal={monthlyWithdrawal}
            finalValue={finalValue}
            currency={currency}
            withdrawalFrequency={withdrawalFrequency}
            timePeriod={timePeriod}
          />

          <ActionButtons
            onReset={handleReset}
            previousValues={{
              totalInvestment,
              monthlyWithdrawal,
              returnRate,
              timePeriod,
              withdrawalFrequency,
            }}
            currentValues={{
              totalInvestment,
              monthlyWithdrawal,
              returnRate,
              timePeriod,
              withdrawalFrequency,
              currency,
            }}
            onRestore={(values) => {
              setTotalInvestment(values.totalInvestment);
              setMonthlyWithdrawal(values.monthlyWithdrawal);
              setReturnRate(values.returnRate);
              setTimePeriod(values.timePeriod);
              setWithdrawalFrequency(values.withdrawalFrequency);
            }}
          />

          <Footer />
        </div>
      </div>
    </>
  );
};

export default Index;
