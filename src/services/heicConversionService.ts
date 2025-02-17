
import convert from 'heic-convert/browser';
import { ImageFormat } from "@/types/heicConverter";
import { fileToBuffer, bufferToBlob } from "@/utils/bufferUtils";

const getTargetFormat = (format: ImageFormat): 'JPEG' | 'PNG' => {
  switch (format) {
    case 'jpg':
      return 'JPEG';
    case 'png':
    case 'webp':
      return 'PNG';
    default:
      return 'JPEG';
  }
};

export const convertHeicToFormat = async (
  file: File, 
  targetFormat: ImageFormat,
  onProgress?: (progress: number) => void
): Promise<{ blob: Blob, previewUrl: string }> => {
  try {
    let convertedBuffer: Buffer;
    let mimeType: string;

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

    // Convert file to buffer
    const inputBuffer = await fileToBuffer(file);

    // Convert HEIC to target format using browser-specific convert
    const format = getTargetFormat(targetFormat);
    convertedBuffer = await convert({
      buffer: inputBuffer,
      format,
      quality: 0.95
    });

    if (targetFormat === 'webp') {
      // For WEBP, we need to convert the PNG buffer to WEBP
      const pngBlob = bufferToBlob(convertedBuffer, 'image/png');
      
      // Convert PNG to WebP using canvas
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = URL.createObjectURL(pngBlob);
      });

      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);

      const webpBlob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else resolve(pngBlob); // Fallback to PNG if WebP conversion fails
        }, 'image/webp', 0.95);
      });

      // Clean up the temporary URL
      URL.revokeObjectURL(img.src);

      clearInterval(progressInterval);
      onProgress?.(100);

      const previewUrl = URL.createObjectURL(webpBlob);
      return { blob: webpBlob, previewUrl };
    }

    // For JPG and PNG formats
    mimeType = `image/${targetFormat === 'jpg' ? 'jpeg' : targetFormat}`;
    const convertedBlob = bufferToBlob(convertedBuffer, mimeType);

    clearInterval(progressInterval);
    onProgress?.(100);

    const previewUrl = URL.createObjectURL(convertedBlob);
    return { blob: convertedBlob, previewUrl };
  } catch (error) {
    console.error('Error converting HEIC:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
    }
    throw error;
  }
};
