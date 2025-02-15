
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import heic2any from "heic2any";

type ImageFormat = 'jpg' | 'png' | 'webp';

interface ConvertedImage {
  id: string;
  originalFile: File;
  previewUrl: string;
  fileName: string;
  exifData: null | Record<string, any>;
  convertedBlob: Blob | null;
}

const VALID_HEIC_TYPES = [
  'image/heic',
  'image/heif',
  'image/heic-sequence',
  'image/heif-sequence'
];

export const useHeicConverter = () => {
  const [images, setImages] = useState<ConvertedImage[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [format, setFormat] = useState<ImageFormat>(() => {
    const savedFormat = localStorage.getItem('heic-convert-format');
    return (savedFormat as ImageFormat) || 'jpg';
  });
  const { toast } = useToast();

  const isHeicOrHeif = (file: File) => {
    return VALID_HEIC_TYPES.includes(file.type) || 
           file.name.toLowerCase().endsWith('.heic') || 
           file.name.toLowerCase().endsWith('.heif');
  };

  const checkActualMimeType = async (file: File): Promise<boolean> => {
    try {
      const arrayBuffer = await file.slice(0, 12).arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      
      // HEIC/HEIF files typically start with 'ftypheic' or 'ftypheix' after their initial bytes
      const signature = Array.from(uint8Array.slice(4, 12))
        .map(byte => String.fromCharCode(byte))
        .join('');
      
      return signature.includes('ftyp') && 
             (signature.includes('heic') || 
              signature.includes('heix') || 
              signature.includes('heif'));
    } catch (error) {
      console.error('Error checking file type:', error);
      return false;
    }
  };

  const getNewFileName = (originalName: string) => {
    return originalName.replace(/\.(heic|heif)$/i, `.${format}`);
  };

  const convertPngToWebp = async (pngBlob: Blob): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to convert to WEBP'));
            }
          },
          'image/webp',
          0.9
        );
      };
      img.onerror = () => reject(new Error('Failed to load PNG image'));
      img.src = URL.createObjectURL(pngBlob);
    });
  };

  const convertHeicToFormat = async (file: File): Promise<{ blob: Blob, previewUrl: string }> => {
    try {
      const isActualHeicHeif = await checkActualMimeType(file);
      if (!isActualHeicHeif) {
        throw new Error('Not a valid HEIC/HEIF file');
      }

      let convertedBlob: Blob;

      if (format === 'webp') {
        // First convert to PNG
        const pngBlob = await heic2any({
          blob: file,
          toType: 'image/png',
          quality: 0.95,
        }) as Blob;

        // Then convert PNG to WEBP
        convertedBlob = await convertPngToWebp(pngBlob);
      } else {
        // Direct conversion for JPG/PNG
        convertedBlob = await heic2any({
          blob: file,
          toType: `image/${format === 'jpg' ? 'jpeg' : format}`,
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

  const handleFiles = async (files: File[]) => {
    if (files.length > 30) {
      toast({
        title: "Too many files",
        description: "Please select up to 30 files",
        variant: "destructive",
      });
      return;
    }

    const potentialHeicFiles = Array.from(files).filter(isHeicOrHeif);
    
    if (potentialHeicFiles.length === 0) {
      toast({
        title: "Invalid files",
        description: "Please select HEIC or HEIF images only",
        variant: "destructive",
      });
      return;
    }

    const toastId = toast({
      title: "Converting images...",
      description: "Please wait while we convert your images.",
    });

    try {
      const results = await Promise.allSettled(
        potentialHeicFiles.map(async (file) => {
          try {
            const { blob, previewUrl } = await convertHeicToFormat(file);
            return {
              success: true,
              data: {
                id: Math.random().toString(36).substr(2, 9),
                originalFile: file,
                previewUrl,
                fileName: getNewFileName(file.name),
                exifData: null,
                convertedBlob: blob,
              },
            };
          } catch (error) {
            return { success: false, file };
          }
        })
      );

      const successfulConversions = results
        .filter((result): result is PromiseFulfilledResult<{ success: true, data: ConvertedImage }> => 
          result.status === 'fulfilled' && result.value.success
        )
        .map(result => result.value.data);

      const failedConversions = results
        .filter((result): result is PromiseFulfilledResult<{ success: false, file: File }> => 
          result.status === 'fulfilled' && !result.value.success
        )
        .length;

      setImages(prev => [...successfulConversions, ...prev]);
      
      toast({
        title: "Conversion complete",
        description: `Successfully converted ${successfulConversions.length} image${successfulConversions.length > 1 ? 's' : ''}.`,
      });

      if (failedConversions > 0) {
        setTimeout(() => {
          toast({
            title: "Non-HEIC images excluded",
            description: `${failedConversions} non-HEIC image${failedConversions > 1 ? 's were' : ' was'} excluded.`,
            variant: "destructive",
          });
        }, 3000);
      }
    } catch (error) {
      console.error('Conversion error:', error);
      toast({
        title: "Conversion failed",
        description: "Failed to convert some images. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const items = Array.from(e.dataTransfer.files);
    await handleFiles(items);
  };

  const handleExifData = async (imageId: string) => {
    toast({
      title: "Coming Soon",
      description: "EXIF data extraction will be implemented soon",
    });
  };

  const downloadImage = async (imageId: string) => {
    const image = images.find(img => img.id === imageId);
    if (!image || !image.convertedBlob) return;

    const url = URL.createObjectURL(image.convertedBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = image.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const reset = () => {
    images.forEach(image => {
      URL.revokeObjectURL(image.previewUrl);
    });
    setImages([]);
  };

  return {
    images,
    isDragging,
    format,
    setFormat,
    handleFiles,
    handleDragOver,
    handleDragEnter,
    handleDragLeave,
    handleDrop,
    handleExifData,
    downloadImage,
    reset,
  };
};
