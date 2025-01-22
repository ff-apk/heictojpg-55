import { WithdrawalFrequency } from "@/types/calculator";
import { format, addMonths } from "date-fns";
import { toast } from "@/hooks/use-toast";

let toastTimeout: NodeJS.Timeout | null = null;
let isToastShown = false;

const calculateMonthlyFinalValue = (
  totalInvestment: number,
  monthlyWithdrawal: number,
  returnRate: number,
  monthsPeriod: number,
  withdrawalFrequency: WithdrawalFrequency
): number => {
  const withdrawalsPerYear = {
    "Monthly": 12,
    "Quarterly": 4,
    "Half-yearly": 2,
    "Yearly": 1,
  };

  const n = withdrawalsPerYear[withdrawalFrequency];
  const r = returnRate / (n * 100);
  const t = monthsPeriod / 12;

  return Math.round(
    totalInvestment * Math.pow(1 + returnRate / 100, t) -
      (monthlyWithdrawal *
        (Math.pow(1 + Math.pow(1 + returnRate / 100, 1 / n) - 1, t * n) - 1)) /
        (Math.pow(1 + returnRate / 100, 1 / n) - 1)
  );
};

const getTimeString = (
  totalPeriod: number,
  withdrawalFrequency: WithdrawalFrequency
): string => {
  switch (withdrawalFrequency) {
    case "Quarterly": {
      const years = Math.floor(totalPeriod / 12);
      const quarters = Math.floor((totalPeriod % 12) / 3);
      return `${years > 0 ? `${years} year${years > 1 ? "s" : ""}` : ""}${
        quarters > 0 ? ` ${quarters} quarter${quarters > 1 ? "s" : ""}` : ""
      }`.trim();
    }
    case "Half-yearly": {
      const years = Math.floor(totalPeriod / 12);
      const halfYears = Math.floor((totalPeriod % 12) / 6);
      return `${years > 0 ? `${years} year${years > 1 ? "s" : ""}` : ""}${
        halfYears > 0 ? ` ${halfYears} half-year${halfYears > 1 ? "s" : ""}` : ""
      }`.trim();
    }
    case "Yearly": {
      const years = Math.floor(totalPeriod / 12);
      return `${years} year${years > 1 ? "s" : ""}`;
    }
    default: {
      // Monthly
      const years = Math.floor(totalPeriod / 12);
      const months = totalPeriod % 12;
      return `${years > 0 ? `${years} year${years > 1 ? "s" : ""}` : ""}${
        months > 0 ? ` ${months} month${months > 1 ? "s" : ""}` : ""
      }`.trim();
    }
  }
};

const getPeriodStep = (withdrawalFrequency: WithdrawalFrequency): number => {
  switch (withdrawalFrequency) {
    case "Quarterly":
      return 3;
    case "Half-yearly":
      return 6;
    case "Yearly":
      return 12;
    default:
      return 1;
  }
};

const shouldSkipToastDismissal = (
  totalInvestment: number,
  monthlyWithdrawal: number,
  returnRate: number,
  timePeriod: number,
  withdrawalFrequency: WithdrawalFrequency
): boolean => {
  return (
    totalInvestment === 500000 &&
    monthlyWithdrawal === 5000 &&
    returnRate === 13 &&
    timePeriod === 10 &&
    withdrawalFrequency === "Monthly"
  );
};

export const detectLastPositiveMonth = (
  totalInvestment: number,
  monthlyWithdrawal: number,
  returnRate: number,
  timePeriod: number,
  withdrawalFrequency: WithdrawalFrequency,
  finalValue: number
) => {
  if (finalValue >= 0) {
    if (toastTimeout) {
      clearTimeout(toastTimeout);
      toastTimeout = null;
    }
    // Skip toast dismissal for specific condition
    if (!shouldSkipToastDismissal(totalInvestment, monthlyWithdrawal, returnRate, timePeriod, withdrawalFrequency)) {
      // Update toast with zero duration
      toast({
        duration: 0,
      });
    }
    isToastShown = false;
    return;
  }

  if (toastTimeout) {
    clearTimeout(toastTimeout);
    toastTimeout = null;
    isToastShown = false;
  }

  toastTimeout = setTimeout(() => {
    const totalMonths = timePeriod * 12;
    const periodStep = getPeriodStep(withdrawalFrequency);

    let lastPositiveMonth = 0;
    let lastPositiveValue = 0;

    for (let month = totalMonths - periodStep; month >= 1; month -= periodStep) {
      const value = calculateMonthlyFinalValue(
        totalInvestment,
        monthlyWithdrawal,
        returnRate,
        month,
        withdrawalFrequency
      );

      if (value > 0) {
        lastPositiveMonth = month;
        lastPositiveValue = value;
        break;
      }
    }

    if (lastPositiveMonth > 0 && !isToastShown) {
      const futureDate = addMonths(new Date(), lastPositiveMonth);
      const formattedDate = format(futureDate, "MMMM, yyyy");
      const timeString = getTimeString(lastPositiveMonth, withdrawalFrequency);

      toast({
        title: `Final Value ended by ${formattedDate}`,
        description: `After that ${timeString}, you'll stop receiving withdrawals.`,
        duration: 10000,
      });
      
      isToastShown = true;
    }
  }, 2000);
};
