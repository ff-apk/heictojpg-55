
import { heicTo } from "heic-to";
import { ImageFormat } from "@/types/heicConverter";
import { convertPngToWebp, processRegularImage } from "@/utils/heicConverterUtils";

export const convertHeicToFormat = async (
  file: File, 
  targetFormat: ImageFormat,
  quality: number = 1,
  onProgress?: (progress: number) => void
): Promise<{ blob: Blob, previewUrl: string, isHeic: boolean }> => {
  try {
    let convertedBlob: Blob;

    try {
      if (targetFormat === 'webp') {
        // First convert to PNG using heic-to
        const pngBlob = await heicTo({
          blob: file,
          type: 'image/png',
          quality: 1
        });
        onProgress?.(50);

        // Then convert PNG to WebP using existing utility with the specified quality
        convertedBlob = await convertPngToWebp(pngBlob, quality);
        // Clean up intermediate PNG blob
        URL.revokeObjectURL(URL.createObjectURL(pngBlob));
        onProgress?.(90);
      } else {
        // Direct conversion to JPG or PNG
        convertedBlob = await heicTo({
          blob: file,
          type: targetFormat === 'jpg' ? 'image/jpeg' : 'image/png',
          quality: quality
        });
        onProgress?.(90);
      }

      const previewUrl = URL.createObjectURL(convertedBlob);
      onProgress?.(100);
      return { blob: convertedBlob, previewUrl, isHeic: true };
    } catch (error) {
      console.log('HEIC conversion failed, trying as regular image:', error);
      // If heic-to conversion fails, try processing as regular image
      const result = await processRegularImage(file, targetFormat, quality);
      onProgress?.(100);
      return { ...result, isHeic: false };
    }
  } catch (error) {
    console.error('Error converting file:', error);
    throw error;
  }
};

