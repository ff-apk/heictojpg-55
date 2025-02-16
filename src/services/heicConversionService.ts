
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

    if (targetFormat === 'webp') {
      // First convert to PNG with progress tracking
      const pngBlob = await heic2any({
        blob: file,
        toType: 'image/png',
        quality: 0.95,
        onProgress: (progress) => {
          // Scale progress to 0-90% for PNG conversion
          onProgress?.(progress * 0.9);
        }
      }) as Blob;

      // Then convert PNG to WebP (remaining 10% of progress)
      onProgress?.(90);
      convertedBlob = await convertPngToWebp(pngBlob);
      onProgress?.(100);
    } else {
      convertedBlob = await heic2any({
        blob: file,
        toType: `image/${targetFormat === 'jpg' ? 'jpeg' : targetFormat}`,
        quality: 0.95,
        onProgress: (progress) => {
          onProgress?.(progress);
        }
      }) as Blob;
    }

    const previewUrl = URL.createObjectURL(convertedBlob);
    return { blob: convertedBlob, previewUrl };
  } catch (error) {
    console.error('Error converting HEIC:', error);
    throw error;
  }
};
