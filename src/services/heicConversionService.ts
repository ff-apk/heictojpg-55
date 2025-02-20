
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
    // First try to convert directly without chunking for small files (under 5MB)
    if (file.size < 5 * 1024 * 1024) {
      try {
        console.log('Attempting direct conversion for small file:', file.name);
        const blob = await heicTo({
          blob: file,
          type: targetFormat === 'jpg' ? 'image/jpeg' : 
                targetFormat === 'webp' ? 'image/webp' : 
                'image/png',
          quality
        });
        const previewUrl = URL.createObjectURL(blob);
        console.log('Direct conversion successful for:', file.name);
        return { blob, previewUrl, isHeic: true };
      } catch (error) {
        console.log('Direct conversion failed, trying regular image:', error);
        const result = await processRegularImage(file, targetFormat, quality);
        return { ...result, isHeic: false };
      }
    }

    // For larger files, use chunked processing
    let convertedBlob: Blob;
    const fileBuffer = await file.arrayBuffer();
    const chunks: ArrayBuffer[] = [];
    
    for (let i = 0; i < fileBuffer.byteLength; i += CHUNK_SIZE) {
      chunks.push(fileBuffer.slice(i, i + CHUNK_SIZE));
    }

    const processChunk = async (chunk: ArrayBuffer): Promise<Blob> => {
      const chunkBlob = new Blob([chunk], { type: file.type });
      return heicTo({
        blob: chunkBlob,
        type: targetFormat === 'jpg' ? 'image/jpeg' : 
              targetFormat === 'webp' ? 'image/webp' : 
              'image/png',
        quality
      });
    };

    try {
      console.log('Starting chunked processing for:', file.name);
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
      console.log('Chunked processing successful for:', file.name);
      return { blob: convertedBlob, previewUrl, isHeic: true };
    } catch (error) {
      console.log('Chunked processing failed, trying regular image:', error);
      const result = await processRegularImage(file, targetFormat, quality);
      return { ...result, isHeic: false };
    }
  } catch (error) {
    console.error('Error converting file:', error);
    throw error;
  }
};
