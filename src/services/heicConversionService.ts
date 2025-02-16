
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

    // Signal start of conversion
    onProgress?.(0);

    if (targetFormat === 'webp') {
      // First convert to PNG
      const pngBlob = await heic2any({
        blob: file,
        toType: 'image/png',
        quality: 0.95
      }) as Blob;

      // Signal PNG conversion complete
      onProgress?.(90);

      // Then convert PNG to WebP
      convertedBlob = await convertPngToWebp(pngBlob);
      onProgress?.(100);
    } else {
      // Signal start of conversion
      onProgress?.(50);

      convertedBlob = await heic2any({
        blob: file,
        toType: `image/${targetFormat === 'jpg' ? 'jpeg' : targetFormat}`,
        quality: 0.95
      }) as Blob;

      // Signal conversion complete
      onProgress?.(100);
    }

    const previewUrl = URL.createObjectURL(convertedBlob);
    return { blob: convertedBlob, previewUrl };
  } catch (error) {
    console.error('Error converting HEIC:', error);
    throw error;
  }
};
