
import { heicTo } from "heic-to";
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
      // First convert to PNG using heic-to
      const pngBlob = await heicTo({
        blob: file,
        type: 'image/png',
        quality: 1
      });

      // Then convert PNG to WebP using existing utility
      convertedBlob = await convertPngToWebp(pngBlob);
    } else {
      // Direct conversion to JPG or PNG
      convertedBlob = await heicTo({
        blob: file,
        type: targetFormat === 'jpg' ? 'image/jpeg' : 'image/png',
        quality: targetFormat === 'jpg' ? 0.95 : 1
      });
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
