
import { ImageFormat, ConvertedImage } from "./heicConverter";

export interface Qualities {
  [key: string]: number;
}

export interface ConversionProgress {
  current: number;
  total: number;
  showProgress: boolean;
  progress: number;
}

export type ConversionTrigger = 'format' | 'quality';

export interface ConversionState {
  format: ImageFormat;
  qualities: Qualities;
  isConverting: boolean;
  progress: ConversionProgress;
}
