
import heic2any from "heic2any";
import { ImageFormat } from "@/types/heicConverter";
import { convertPngToWebp } from "@/utils/heicConverterUtils";

export const convertHeicToFormat = async (
  file: File, 
  targetFormat: ImageFormat,
  onProgress?: (progress: number) => void
): Promise<{ blob: Blob, previewUrl: string }> => {
  try {
    let convertedBlob: Blob;

    const simulateProgress = (start: number, end: number, duration: number) => {
      const step = 100;
      const increment = (end - start) / step;
      const stepDuration = duration / step;
      
      let currentProgress = start;
      const interval = setInterval(() => {
        currentProgress += increment;
        if (currentProgress >= end) {
          clearInterval(interval);
          onProgress?.(end);
        } else {
          onProgress?.(currentProgress);
        }
      }, stepDuration);

      return interval;
    };

    const progressInterval = simulateProgress(0, 90, 2000);

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

    clearInterval(progressInterval);
    onProgress?.(100);

    const previewUrl = URL.createObjectURL(convertedBlob);
    return { blob: convertedBlob, previewUrl };
  } catch (error) {
    console.error('Error converting HEIC:', error);
    throw error;
  }
};

