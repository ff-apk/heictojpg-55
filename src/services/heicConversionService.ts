
import heic2any from "heic2any";
import { ImageFormat } from "@/types/heicConverter";
import { convertPngToWebp } from "@/utils/heicConverterUtils";

export const convertHeicToFormat = async (file: File, targetFormat: ImageFormat): Promise<{ blob: Blob, previewUrl: string }> => {
  try {
    let convertedBlob: Blob;

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

    const previewUrl = URL.createObjectURL(convertedBlob);
    return { blob: convertedBlob, previewUrl };
  } catch (error) {
    console.error('Error converting HEIC:', error);
    throw error;
  }
};
