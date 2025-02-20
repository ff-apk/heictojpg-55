
import { ImageFormat } from "@/types/heicConverter";
import { ConversionTrigger } from "@/types/conversion";

export const formatQuality = (quality: number): string => {
  return Number(quality.toFixed(2)).toString();
};

export const getConversionMessage = (
  count: number, 
  format: string, 
  quality: number, 
  includesNonHeic: boolean,
  trigger: ConversionTrigger
) => {
  const pluralSuffix = count > 1 ? 's' : '';
  const actionVerb = includesNonHeic ? 'processed' : 'converted';
  
  if (format === 'png') {
    return `Successfully ${actionVerb} ${count} image${pluralSuffix} to PNG`;
  }
  
  if (trigger === 'format') {
    return `Successfully ${actionVerb} ${count} image${pluralSuffix} to ${format.toUpperCase()}`;
  }
  
  if (trigger === 'quality') {
    return `Successfully ${actionVerb} ${count} image${pluralSuffix} with quality ${formatQuality(quality)}`;
  }
  
  return `Successfully ${actionVerb} ${count} image${pluralSuffix} to ${format.toUpperCase()} with quality ${formatQuality(quality)}`;
};

export const getConversionStartMessage = (trigger: ConversionTrigger) => {
  return trigger === 'format' 
    ? "Please wait while we convert your images to the new format"
    : "Please wait while we convert your images to the new quality";
};

export const validateFileName = (name: string, extension: string): string => {
  let sanitized = name.replace(/[<>:"/\\|?*]/g, '').trim();
  
  if (!sanitized) {
    sanitized = 'image';
  }
  
  return `${sanitized}.${extension}`;
};
