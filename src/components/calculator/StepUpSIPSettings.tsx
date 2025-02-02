import React, { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import SliderInput from "@/components/slider/SliderInput";
import InfoTooltip from "@/components/InfoTooltip";
import { useToast } from "@/hooks/use-toast";

export type StepUpFrequency = "Monthly" | "Quarterly" | "Half-yearly" | "Yearly";

interface StepUpSIPSettingsProps {
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
  frequency: StepUpFrequency;
  onFrequencyChange: (frequency: StepUpFrequency) => void;
  percentage: number;
  onPercentageChange: (percentage: number) => void;
  isAdvancedOptionsEnabled: boolean;
  onDropdownOpenChange?: (open: boolean) => void;
}

const StepUpSIPSettings = ({
  enabled,
  onEnabledChange,
  frequency,
  onFrequencyChange,
  percentage,
  onPercentageChange,
  isAdvancedOptionsEnabled,
  onDropdownOpenChange,
}: StepUpSIPSettingsProps) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);

  const getWidthClass = () => {
    switch (frequency) {
      case "Monthly": return "w-[160px]";
      case "Quarterly": return "w-[170px]";
      case "Half-yearly": return "w-[180px]";
      case "Yearly": return "w-[150px]";
      default: return "w-[180px]";
    }
  };

  const handleFrequencyChange = (value: string) => {
    const newFrequency = value as StepUpFrequency;
    onFrequencyChange(newFrequency);
    toast({
      title: "Step Up frequency updated",
      description: `Changed to ${value} Step Up`,
      duration: 7000,
    });
  };

  const handleLabelClick = () => {
    if (isAdvancedOptionsEnabled && !isOpen) {
      onEnabledChange(!enabled);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    onDropdownOpenChange?.(open);
  };

  return (
    <div className={`space-y-4 ${isOpen ? 'mb-8' : ''}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-x-1">
          <span 
            className={`text-lg text-gray-700 dark:text-[#c1cbd6] ${!isOpen ? 'cursor-pointer' : ''}`}
            onClick={handleLabelClick}
          >
            Step Up SIP
          </span>
          <InfoTooltip content="Automatically increase your SIP amount by a fixed percentage at regular intervals to keep up with your growing income and inflation. The most common step-up frequency is Yearly, also known as the Annual step-up." />
        </div>
        <Switch
          checked={enabled}
          onCheckedChange={onEnabledChange}
          disabled={!isAdvancedOptionsEnabled}
        />
      </div>

      {enabled && isAdvancedOptionsEnabled && (
        <div className="space-y-4">
          <SliderInput
            label={
              <Select 
                value={frequency} 
                onValueChange={handleFrequencyChange}
                onOpenChange={handleOpenChange}
              >
                <SelectTrigger className={`${getWidthClass()} focus:ring-0 focus-visible:ring-0 bg-white dark:bg-[#030c21]`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-[#030c21] border-border">
                  <SelectItem value="Monthly">Monthly Step Up</SelectItem>
                  <SelectItem value="Quarterly">Quarterly Step Up</SelectItem>
                  <SelectItem value="Half-yearly">Half-yearly Step Up</SelectItem>
                  <SelectItem value="Yearly">Yearly Step Up</SelectItem>
                </SelectContent>
              </Select>
            }
            value={percentage}
            onChange={onPercentageChange}
            min={1}
            max={100}
            step={0.1}
            suffix="%"
            maxLength={4}
          />
        </div>
      )}
    </div>
  );
};

export default StepUpSIPSettings;
