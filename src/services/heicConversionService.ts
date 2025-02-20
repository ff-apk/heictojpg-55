
import { heicTo } from "heic-to";
import { ImageFormat } from "@/types/heicConverter";
import { convertPngToWebp, processRegularImage, processInChunks } from "@/utils/heicConverterUtils";

const CHUNK_SIZE = 1024 * 1024; // 1MB chunks

export const convertHeicToFormat = async (
  file: File, 
  targetFormat: ImageFormat,
  quality: number = 1,
  onProgress?: (progress: number) => void
): Promise<{ blob: Blob, previewUrl: string, isHeic: boolean }> => {
  try {
    let convertedBlob: Blob;

    const processChunk = async (chunk: ArrayBuffer): Promise<Blob> => {
      const chunkBlob = new Blob([chunk]);
      
      if (targetFormat === 'webp') {
        const pngBlob = await heicTo({
          blob: chunkBlob,
          type: 'image/png',
          quality: 1
        });
        return convertPngToWebp(pngBlob, quality);
      } else {
        return heicTo({
          blob: chunkBlob,
          type: targetFormat === 'jpg' ? 'image/jpeg' : 'image/png',
          quality: quality
        });
      }
    };

    try {
      // Read file in chunks
      const fileBuffer = await file.arrayBuffer();
      const chunks: ArrayBuffer[] = [];
      
      for (let i = 0; i < fileBuffer.byteLength; i += CHUNK_SIZE) {
        chunks.push(fileBuffer.slice(i, i + CHUNK_SIZE));
      }

      let processedChunks: Blob[] = [];
      await processInChunks(
        chunks,
        2, // Process 2 chunks at a time
        async (chunk) => {
          const processedChunk = await processChunk(chunk);
          processedChunks.push(processedChunk);
        },
        onProgress
      );

      // Combine processed chunks
      convertedBlob = new Blob(processedChunks, { 
        type: targetFormat === 'jpg' ? 'image/jpeg' : 
              targetFormat === 'webp' ? 'image/webp' : 
              'image/png' 
      });

      const previewUrl = URL.createObjectURL(convertedBlob);
      return { blob: convertedBlob, previewUrl, isHeic: true };
    } catch (error) {
      console.log('HEIC conversion failed, trying as regular image:', error);
      // If heic-to conversion fails, try processing as regular image
      const result = await processRegularImage(file, targetFormat, quality);
      return { ...result, isHeic: false };
    }
  } catch (error) {
    console.error('Error converting file:', error);
    throw error;
  }
};

