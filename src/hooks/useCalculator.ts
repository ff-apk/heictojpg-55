import { useState, useEffect } from "react";
import { SIPFrequency } from "@/types/calculator";
import { CurrencyType } from "@/components/CurrencySelector";
import { StepUpFrequency } from "@/components/calculator/StepUpSIPSettings";

export const useCalculator = () => {
  const getInitialValues = () => {
    const params = new URLSearchParams(window.location.search);
    const savedMonthlyInvestment = localStorage.getItem("monthlyInvestment");
    const savedReturnRate = localStorage.getItem("returnRate");
    const savedTimePeriod = localStorage.getItem("timePeriod");
    const savedSipFrequency = localStorage.getItem("sipFrequency") as SIPFrequency;
    const savedCurrency = localStorage.getItem("selectedCurrency") as CurrencyType;
    const savedAdvancedOptionsEnabled = localStorage.getItem("advancedOptionsEnabled");
    const savedStepUpEnabled = localStorage.getItem("stepUpEnabled");
    const savedStepUpFrequency = localStorage.getItem("stepUpFrequency") as StepUpFrequency;
    const savedStepUpPercentage = localStorage.getItem("stepUpPercentage");

    return {
      monthlyInvestment: Number(params.get("mi")) || Number(savedMonthlyInvestment) || 30000,
      returnRate: Number(params.get("rr")) || Number(savedReturnRate) || 13,
      timePeriod: Number(params.get("tp")) || Number(savedTimePeriod) || 10,
      sipFrequency: (params.get("sf") as SIPFrequency) || savedSipFrequency || "Monthly",
      currency: (params.get("cs") as CurrencyType) || savedCurrency || "INR",
      advancedOptionsEnabled: params.get("ao") === "true" || (savedAdvancedOptionsEnabled ? JSON.parse(savedAdvancedOptionsEnabled) : false),
      stepUpEnabled: params.get("su") === "true" || (savedStepUpEnabled ? JSON.parse(savedStepUpEnabled) : false),
      stepUpFrequency: (params.get("suf") as StepUpFrequency) || savedStepUpFrequency || "Yearly",
      stepUpPercentage: Number(params.get("sup")) || Number(savedStepUpPercentage) || 10,
    };
  };

  const initialValues = getInitialValues();

  const [monthlyInvestment, setMonthlyInvestment] = useState(initialValues.monthlyInvestment);
  const [returnRate, setReturnRate] = useState(initialValues.returnRate);
  const [timePeriod, setTimePeriod] = useState(initialValues.timePeriod);
  const [sipFrequency, setSipFrequency] = useState<SIPFrequency>(initialValues.sipFrequency);
  const [totalValue, setTotalValue] = useState(0);
  const [totalInvestment, setTotalInvestment] = useState(0);
  const [currency, setCurrency] = useState<CurrencyType>(initialValues.currency);
  const [advancedOptionsEnabled, setAdvancedOptionsEnabled] = useState(initialValues.advancedOptionsEnabled);
  const [stepUpEnabled, setStepUpEnabled] = useState(initialValues.stepUpEnabled);
  const [stepUpFrequency, setStepUpFrequency] = useState<StepUpFrequency>(initialValues.stepUpFrequency);
  const [stepUpPercentage, setStepUpPercentage] = useState(initialValues.stepUpPercentage);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem("monthlyInvestment", monthlyInvestment.toString());
    localStorage.setItem("returnRate", returnRate.toString());
    localStorage.setItem("timePeriod", timePeriod.toString());
    localStorage.setItem("sipFrequency", sipFrequency);
    localStorage.setItem("selectedCurrency", currency);
    localStorage.setItem("advancedOptionsEnabled", JSON.stringify(advancedOptionsEnabled));
    localStorage.setItem("stepUpEnabled", JSON.stringify(stepUpEnabled));
    localStorage.setItem("stepUpFrequency", stepUpFrequency);
    localStorage.setItem("stepUpPercentage", stepUpPercentage.toString());
  }, [monthlyInvestment, returnRate, timePeriod, sipFrequency, currency, advancedOptionsEnabled, stepUpEnabled, stepUpFrequency, stepUpPercentage]);

  const calculateSIP = () => {
    const paymentsPerYear = {
      "Daily": 365,
      "Weekly": 52,
      "Monthly": 12,
      "Quarterly": 4,
      "Half-yearly": 2,
      "Yearly": 1
    };

    const n = paymentsPerYear[sipFrequency];
    const r = returnRate / (n * 100); // Convert percentage to decimal and divide by frequency
    const t = timePeriod * n; // Total number of payments

    // Calculate total investment
    const investment = monthlyInvestment * t;
    setTotalInvestment(investment);

    // SIP Future Value formula: P * ((1 + r)^t - 1) / r * (1 + r)
    const futureValue = monthlyInvestment * ((Math.pow(1 + r, t) - 1) / r) * (1 + r);
    setTotalValue(Math.round(futureValue));
  };

  // Calculate values
  useEffect(() => {
    calculateSIP();
  }, [monthlyInvestment, returnRate, timePeriod, sipFrequency]);

  return {
    monthlyInvestment,
    setMonthlyInvestment,
    returnRate,
    setReturnRate,
    timePeriod,
    setTimePeriod,
    sipFrequency,
    setSipFrequency,
    totalValue,
    totalInvestment,
    currency,
    setCurrency,
    advancedOptionsEnabled,
    setAdvancedOptionsEnabled,
    stepUpEnabled,
    setStepUpEnabled,
    stepUpFrequency,
    setStepUpFrequency,
    stepUpPercentage,
    setStepUpPercentage,
  };
};