
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
      // First convert to PNG
      onProgress?.(30);
      const pngBlob = await heic2any({
        blob: file,
        toType: 'image/png',
        quality: 0.95
      }) as Blob;

      // Then convert PNG to WebP
      onProgress?.(60);
      convertedBlob = await convertPngToWebp(pngBlob);
      onProgress?.(100);
    } else {
      onProgress?.(50);
      convertedBlob = await heic2any({
        blob: file,
        toType: `image/${targetFormat === 'jpg' ? 'jpeg' : targetFormat}`,
        quality: 0.95
      }) as Blob;
      onProgress?.(100);
    }

    const previewUrl = URL.createObjectURL(convertedBlob);
    return { blob: convertedBlob, previewUrl };
  } catch (error) {
    console.error('Error converting HEIC:', error);
    throw error;
  }
};
