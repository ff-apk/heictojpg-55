import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Calculator,
  IndianRupee,
  Clock,
  Calendar,
  PieChart,
  Share2,
  TrendingUp,
  DollarSign,
  Percent,
  Info,
  RefreshCw,
  MousePointerClick,
  Euro,
  JapaneseYen,
  PoundSterling
} from 'lucide-react';
import { CurrencyType } from './CurrencySelector';
import { formatNumberByCurrency, getCurrencySymbol } from './slider/utils';

interface HomepageContentProps {
  currency: CurrencyType;
  totalInvestment: number;
  monthlyWithdrawal: number;
  timePeriod: number;
  withdrawalFrequency: string;
}

const HomepageContent = ({ 
  currency, 
  totalInvestment, 
  monthlyWithdrawal,
  timePeriod,
  withdrawalFrequency
}: HomepageContentProps) => {
  const currencySymbol = getCurrencySymbol(currency);
  
  const getCurrencyIcon = (currency: CurrencyType) => {
    switch(currency) {
      case 'INR':
        return <IndianRupee className="h-5 w-5" />;
      case 'EUR':
        return <Euro className="h-5 w-5" />;
      case 'JPY':
      case 'CNY':
        return <JapaneseYen className="h-5 w-5" />;
      case 'GBP':
        return <PoundSterling className="h-5 w-5" />;
      default:
        return <DollarSign className="h-5 w-5" />;
    }
  };

  const formatInvestmentRange = (currency: CurrencyType) => {
    if (currency === 'INR') {
      return `${currencySymbol}1,000 to ${currencySymbol}50 Crore`;
    }
    return `${currencySymbol}1,000 to ${currencySymbol}5 Million`;
  };

  const formatMinWithdrawal = (currency: CurrencyType) => {
    return `${currencySymbol}50`;
  };

  const getTotalWithdrawal = () => {
    let withdrawalsPerYear;
    switch (withdrawalFrequency) {
      case "Quarterly":
        withdrawalsPerYear = 4;
        break;
      case "Half-yearly":
        withdrawalsPerYear = 2;
        break;
      case "Yearly":
        withdrawalsPerYear = 1;
        break;
      default:
        withdrawalsPerYear = 12;
    }
    return monthlyWithdrawal * withdrawalsPerYear * timePeriod;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            SWP Calculator Uses Guide
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-3">
              {getCurrencyIcon(currency)}
              Investment Details
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Enter your total investment amount ({formatInvestmentRange(currency)}) and select from 11 supported currencies including INR, USD, EUR, JPY, GBP, CNY, AUD, CAD, CHF, HKD, and SGD.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-3">
              <Calendar className="h-5 w-5" />
              Withdrawal Configuration
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Choose your withdrawal frequency (Monthly, Quarterly, Half-yearly, or Yearly) and set the withdrawal amount. You can specify either a fixed amount or percentage of total investment, with a minimum of {formatMinWithdrawal(currency)} per withdrawal.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-3">
              <TrendingUp className="h-5 w-5" />
              Return Rate Settings
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Set your expected annual return rate (1% to 50%) to calculate potential earnings. The calculator factors this into your withdrawal sustainability analysis.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-3">
              <Clock className="h-5 w-5" />
              Investment Timeline
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Define your investment horizon from 1 to 50 years. The calculator shows the end date of your investment period and helps plan long-term withdrawal strategies.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-3">
              <PieChart className="h-5 w-5" />
              Results Breakdown
            </h3>
            <div className="space-y-2 text-gray-600 dark:text-gray-400">
              <p>The calculator provides comprehensive results including:</p>
              <ul className="list-disc ml-6 space-y-1">
                <li>Total Investment Value</li>
                <li>Total Withdrawal Amount</li>
                <li>Final Portfolio Value</li>
                <li>Total Value (Including Withdrawals)</li>
                <li>Total Profit (Amount and Percentage)</li>
              </ul>
            </div>
            <div className="space-y-2 text-gray-600 dark:text-gray-400 mt-6">
              <p>The interactive Donut Chart provides a visual comparison between:</p>
              <ul className="list-disc ml-6 space-y-1">
                <li>Total Withdrawal (displayed in high contrast green)</li>
                <li>Total Investment (displayed in low contrast green)</li>
              </ul>
          
              <div className="mt-4">
                <h4 className="font-semibold flex items-center gap-2 mb-2">
                  <MousePointerClick className="h-4 w-4" />
                  Interactive Features:
                </h4>
                <ul className="list-disc ml-6 space-y-1">
                  <li>Click on different sections of the chart to highlight specific values</li>
                  <li>Hover over chart segments to see detailed amounts</li>
                  <li>Compare total withdrawal amount ({formatNumberByCurrency(getTotalWithdrawal(), currency)}) against total investment ({formatNumberByCurrency(totalInvestment, currency)})</li>
                  <li>Visualize the proportion of withdrawals to investment</li>
                </ul>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-3">
              <RefreshCw className="h-5 w-5" />
              Reset Functionality
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Use the Reset button to quickly restore all values to their defaults:
            </p>
            <ul className="list-disc ml-6 mt-2 text-gray-600 dark:text-gray-400 space-y-1">
              <li>Total Investment: {formatNumberByCurrency(500000, currency)}</li>
              <li>Withdrawal Frequency: Monthly</li>
              <li>Withdrawal Amount: {formatNumberByCurrency(5000, currency)}</li>
              <li>Expected Return Rate: 13%</li>
              <li>Time Period: 10 Years</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-3">
              <Share2 className="h-5 w-5" />
              Sharing Options
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Share your calculations easily with the built-in sharing features:
            </p>
            <ul className="list-disc ml-6 mt-2 text-gray-600 dark:text-gray-400 space-y-1">
              <li>Direct share via platform sharing</li>
              <li>Copy calculator link</li>
              <li>Share current calculation settings</li>
            </ul>
          </div>

          <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-3">
              <Info className="h-5 w-5" />
              Important Notes
            </h3>
            <ul className="list-disc ml-6 text-gray-600 dark:text-gray-400 space-y-1">
              <li>All calculations are indicative and based on your inputs</li>
              <li>Returns are calculated using compound interest</li>
              <li>The calculator assumes consistent returns over the investment period</li>
              <li>Regular monitoring and rebalancing of your investment is recommended</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HomepageContent;