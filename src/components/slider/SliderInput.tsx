import React, { useState, useEffect } from "react";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { SliderInputProps } from "./types";
import { formatNumberByCurrency, getCurrencySymbol } from "./utils";

const SliderInput = ({
  label,
  value,
  onChange,
  min,
  max,
  step,
  prefix = "",
  suffix = "",
  dynamicMax,
  isLocked = false,
  lockDirection,
  currency,
  formatValue = false,
  maxLength,
}: SliderInputProps) => {
  const [inputValue, setInputValue] = useState(value.toString());
  const effectiveMax = dynamicMax !== undefined ? dynamicMax : max;

  useEffect(() => {
    if (formatValue && currency) {
      setInputValue(formatNumberByCurrency(value, currency));
    } else {
      setInputValue(value.toString());
    }
  }, [value, currency, formatValue]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/,/g, '');
    setInputValue(rawValue);
    
    const numValue = parseFloat(rawValue);
    if (!isNaN(numValue)) {
      if (numValue >= min && numValue <= effectiveMax) {
        onChange(numValue);
      }
    }
  };

  const handleInputBlur = () => {
    const rawValue = inputValue.replace(/,/g, '');
    const numValue = parseFloat(rawValue);
    if (isNaN(numValue)) {
      if (formatValue && currency) {
        setInputValue(formatNumberByCurrency(value, currency));
      } else {
        setInputValue(value.toString());
      }
    } else {
      let clampedValue = Math.min(Math.max(numValue, min), effectiveMax);
      
      if (formatValue && currency) {
        setInputValue(formatNumberByCurrency(clampedValue, currency));
      } else {
        setInputValue(clampedValue.toString());
      }
      onChange(clampedValue);
    }
  };

  const handleSliderChange = (values: number[]) => {
    const newValue = values[0];
    onChange(newValue);
    if (formatValue && currency) {
      setInputValue(formatNumberByCurrency(newValue, currency));
    } else {
      setInputValue(newValue.toString());
    }
  };

  // Calculate input width based on content length and screen size
  const getInputWidth = () => {
    const baseWidth = Math.max(60, inputValue.length * 12); // Increased base multiplier
    return {
      width: `${baseWidth}px`,
      minWidth: '60px', // Increased minimum width
      maxWidth: '300px' // Increased maximum width for desktop
    };
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex-1">
          {typeof label === 'string' ? (
            <label className="text-lg text-gray-700 dark:text-[#c1cbd6]">{label}</label>
          ) : (
            label
          )}
        </div>
        <div className="bg-secondary px-4 py-2 rounded-lg flex items-center gap-0 w-fit">
          {currency ? (
            <span className="text-xl md:text-2xl font-semibold text-primary shrink-0">{getCurrencySymbol(currency)}</span>
          ) : (
            prefix && <span className="text-xl md:text-2xl font-semibold text-primary shrink-0">{prefix}</span>
          )}
          <Input
            type="text"
            inputMode="numeric"
            pattern="[0-9,]*"
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            min={min}
            max={effectiveMax}
            maxLength={maxLength}
            className="text-xl md:text-2xl font-semibold text-primary bg-transparent border-none focus-visible:ring-0 p-0 text-right"
            style={getInputWidth()}
          />
          {suffix && <span className="text-xl md:text-2xl font-semibold text-primary shrink-0 ml-1">{suffix}</span>}
        </div>
      </div>
      <Slider
        value={[value]}
        onValueChange={handleSliderChange}
        max={effectiveMax}
        min={min}
        step={step}
        className="py-4"
      />
    </div>
  );
};

export default SliderInput;
