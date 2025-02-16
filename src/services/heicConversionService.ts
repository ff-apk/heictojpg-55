
import heic2any from "heic2any";
import { ImageFormat } from "@/types/heicConverter";
import { convertPngToWebp } from "@/utils/heicConverterUtils";

const STUCK_TIMEOUT = 20000; // 20 seconds
const PROGRESS_THRESHOLD = 90;

export const convertHeicToFormat = async (
  file: File, 
  targetFormat: ImageFormat,
  onProgress?: (progress: number) => void,
  isRetry: boolean = false
): Promise<{ blob: Blob, previewUrl: string }> => {
  try {
    let convertedBlob: Blob;
    let stuckTimeout: NodeJS.Timeout;
    let progressInterval: NodeJS.Timeout;
    let isStuck = false;

    const simulateProgress = (start: number, end: number, duration: number) => {
      const step = 100;
      const increment = (end - start) / step;
      const stepDuration = duration / step;
      
      let currentProgress = start;
      let lastProgressUpdate = Date.now();

      progressInterval = setInterval(() => {
        currentProgress += increment;
        
        if (currentProgress >= PROGRESS_THRESHOLD) {
          // Check if we're stuck at 90%
          if (Date.now() - lastProgressUpdate > STUCK_TIMEOUT) {
            isStuck = true;
            clearInterval(progressInterval);
            throw new Error('CONVERSION_STUCK');
          }
        } else {
          lastProgressUpdate = Date.now();
          onProgress?.(currentProgress);
        }

        if (currentProgress >= end) {
          clearInterval(progressInterval);
          onProgress?.(end);
        }
      }, stepDuration);

      return progressInterval;
    };

    const interval = simulateProgress(0, 90, 2000);

    if (targetFormat === 'webp') {
      const pngBlob = await heic2any({
        blob: file,
        toType: 'image/png',
        quality: 0.95,
      }) as Blob;

      convertedBlob = await convertPngToWebp(pngBlob);
    } else {
      convertedBlob = await heic2any({
        blob: file,
        toType: `image/${targetFormat === 'jpg' ? 'jpeg' : targetFormat}`,
        quality: 0.95,
      }) as Blob;
    }

    clearInterval(interval);
    onProgress?.(100);

    const previewUrl = URL.createObjectURL(convertedBlob);
    return { blob: convertedBlob, previewUrl };
  } catch (error) {
    if ((error as Error).message === 'CONVERSION_STUCK' && !isRetry) {
      throw new Error('STUCK_RETRY_NEEDED');
    }
    console.error('Error converting HEIC:', error);
    throw error;
  }
};
