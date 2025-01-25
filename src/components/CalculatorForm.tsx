import React from "react";
import SliderInput from "@/components/slider/SliderInput";
import { CurrencyType } from "@/components/CurrencySelector";
import { WithdrawalFrequency } from "@/types/calculator";
import WithdrawalFrequencySelector from "./calculator/WithdrawalFrequencySelector";
import InfoTooltip from "./InfoTooltip";
import { format, addYears } from "date-fns";

interface CalculatorFormProps {
  totalInvestment: number;
  setTotalInvestment: (value: number) => void;
  monthlyInvestment: number;
  setMonthlyInvestment: (value: number) => void;
  returnRate: number;
  setReturnRate: (value: number) => void;
  timePeriod: number;
  setTimePeriod: (value: number) => void;
  currency: CurrencyType;
  sipFrequency: WithdrawalFrequency;
  setSipFrequency: (frequency: WithdrawalFrequency) => void;
}

const CalculatorForm = ({
  monthlyInvestment,
  setMonthlyInvestment,
  returnRate,
  setReturnRate,
  timePeriod,
  setTimePeriod,
  currency,
  sipFrequency,
  setSipFrequency,
}: CalculatorFormProps) => {
  const getInvestmentLabel = () => {
    switch (sipFrequency) {
      case "Daily":
        return "Daily investment";
      case "Weekly":
        return "Weekly investment";
      case "Monthly":
        return "Monthly investment";
      case "Quarterly":
        return "Quarterly investment";
      case "Half-yearly":
        return "Half-yearly investment";
      case "Yearly":
        return "Yearly investment";
      default:
        return "Monthly investment";
    }
  };

  const getFutureDate = (years: number) => {
    const futureDate = addYears(new Date(), years);
    return format(futureDate, "MMMM, yyyy");
  };

  return (
    <div className="border border-border bg-card dark:bg-card rounded-xl p-6 space-y-6">
      <div className="space-y-4">
        <div className="flex flex-col space-y-4">
          <WithdrawalFrequencySelector
            withdrawalFrequency={sipFrequency}
            setWithdrawalFrequency={setSipFrequency}
          />
        </div>

        <SliderInput
          label={getInvestmentLabel()}
          value={monthlyInvestment}
          onChange={setMonthlyInvestment}
          min={50}
          max={50000000}
          step={50}
          currency={currency}
          formatValue={true}
          maxLength={12}
        />
      </div>

      <div className="space-y-4">
        <SliderInput
          label={
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-x-1">
                <span className="text-lg text-gray-700 dark:text-[#c1cbd6]">
                  Expected return
                </span>
                <span className="text-lg text-gray-700 dark:text-[#c1cbd6]">
                  rate
                </span>
                <span className="text-lg text-gray-700 dark:text-[#c1cbd6]">
                  (p.a)
                </span>
                <InfoTooltip content="The expected annual return rate on your investment. This is the percentage by which your investment is expected to grow each year." />
              </div>
            </div>
          }
          value={returnRate}
          onChange={setReturnRate}
          min={1}
          max={50}
          step={0.1}
          suffix="%"
          maxLength={4}
        />
      </div>

      <div className="space-y-4">
        <SliderInput
          label={
            <div className="flex items-center gap-x-1">
              <span className="text-lg text-gray-700 dark:text-[#c1cbd6]">Time period</span>
              <InfoTooltip content="The total duration for which you plan to invest through SIP. This is measured in years." />
            </div>
          }
          value={timePeriod}
          onChange={setTimePeriod}
          min={1}
          max={50}
          step={1}
          suffix=" Yr"
          maxLength={2}
        />
        <p className="text-base text-muted-foreground ml-1 dark:text-[#c1cbd6]">
          {getFutureDate(timePeriod)}
        </p>
      </div>
    </div>
  );
};

export default CalculatorForm;