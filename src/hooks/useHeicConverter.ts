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

interface FileTypeResult {
  mimeType: string;
  extension: string;
}

export const useHeicConverter = () => {
  const [images, setImages] = useState<ConvertedImage[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [format, setFormat] = useState<ImageFormat>(() => {
    const savedFormat = localStorage.getItem('heic-convert-format');
    return (savedFormat as ImageFormat) || 'jpg';
  });
  const { toast } = useToast();

  const detectFileType = async (file: File): Promise<FileTypeResult> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = (event) => {
        if (!event.target?.result) {
          reject(new Error('Failed to read file'));
          return;
        }

        const arr = new Uint8Array(event.target.result as ArrayBuffer).subarray(0, 12);
        let header = "";
        for (let i = 0; i < arr.length; i++) {
          header += arr[i].toString(16).padStart(2, '0');
        }

        let result: FileTypeResult = { mimeType: 'unknown', extension: '' };

        switch (header.toLowerCase()) {
        case "ffd8ffe0":
        case "ffd8ffe1":
        case "ffd8ffe2":
        case "ffd8ffe3":
        case "ffd8ffe8":
          result = { mimeType: 'image/jpeg', extension: '.jpg' };
          break;
        case "89504e47":
          result = { mimeType: 'image/png', extension: '.png' };
          break;
        case "52494646":
          result = { mimeType: 'image/webp', extension: '.webp' };
          break;
        case "47494638":
          result = { mimeType: 'image/gif', extension: '.gif' };
          break;
        case "4d4d002a":
        case "49492a00":
          result = { mimeType: 'image/tiff', extension: '.tiff' };
          break;
        default:
          // If nothing else matches, assume HEIC/HEIF.
          result = { mimeType: 'image/heic', extension: '.heic' };
      }

        resolve(result);
      };
      reader.onerror = () => reject(new Error('File reading error'));
      reader.readAsArrayBuffer(file.slice(0, 12));
    });
  };

  const isHeicOrHeif = (mimeType: string) => {
    return [
      'image/heic',
      'image/heif',
      'image/heic-sequence',
      'image/heif-sequence'
    ].includes(mimeType);
  };

  const getNewFileName = (originalName: string, detectedExtension?: string) => {
    if (detectedExtension) {
      // If we detected a non-HEIC type, use its extension
      return originalName.replace(/\.(heic|heif)$/i, detectedExtension);
    }
    // Otherwise use the selected format
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

  const convertHeicToFormat = async (file: File): Promise<{ blob: Blob, previewUrl: string, detectedType?: FileTypeResult }> => {
    try {
      // First, detect the actual file type
      const detectedType = await detectFileType(file);
      
      // If it's not actually a HEIC/HEIF file
      if (!isHeicOrHeif(detectedType.mimeType)) {
        // Create a new blob with the correct mime type
        const nonHeicBlob = new Blob([file], { type: detectedType.mimeType });
        const previewUrl = URL.createObjectURL(nonHeicBlob);
        return { blob: nonHeicBlob, previewUrl, detectedType };
      }

      // If it is a HEIC/HEIF file, proceed with conversion
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
      console.error('Error converting image:', error);
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

    const validFiles = Array.from(files).filter(file => 
      file.name.toLowerCase().endsWith('.heic') || 
      file.name.toLowerCase().endsWith('.heif')
    );

    if (validFiles.length === 0) {
      toast({
        title: "Invalid files",
        description: "Please select HEIC or HEIF images only",
        variant: "destructive",
      });
      return;
    }

    const toastId = toast({
      title: "Processing images...",
      description: "Please wait while we process your images.",
    });

    try {
      const newImages = await Promise.all(
        validFiles.map(async (file) => {
          const { blob, previewUrl, detectedType } = await convertHeicToFormat(file);
          
          // If we detected a non-HEIC type, use its details
          const fileName = getNewFileName(file.name, detectedType?.extension);
          
          if (detectedType && !isHeicOrHeif(detectedType.mimeType)) {
            toast({
              title: "File type mismatch",
              description: `"${file.name}" is actually a ${detectedType.extension.toUpperCase()} file. Renamed accordingly.`,
            });
          }

          return {
            id: Math.random().toString(36).substr(2, 9),
            originalFile: file,
            previewUrl,
            fileName,
            exifData: null,
            convertedBlob: blob,
          };
        })
      );

      setImages(prev => [...newImages, ...prev]);
      toast({
        title: "Processing complete",
        description: `Successfully processed ${newImages.length} image${newImages.length > 1 ? 's' : ''}.`,
      });
    } catch (error) {
      console.error('Processing error:', error);
      toast({
        title: "Processing failed",
        description: "Failed to process some images. Please try again.",
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
