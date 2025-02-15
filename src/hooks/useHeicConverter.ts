import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import * as HeicDecode from "heic-decode";

type ImageFormat = 'jpg' | 'png' | 'webp';

interface ConvertedImage {
  id: string;
  originalFile: File;
  previewUrl: string;
  fileName: string;
  exifData: null | Record<string, any>;
  convertedBlob: Blob | null;
}

export const useHeicConverter = () => {
  const [images, setImages] = useState<ConvertedImage[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [format, setFormat] = useState<ImageFormat>(() => {
    const savedFormat = localStorage.getItem('heic-convert-format');
    return (savedFormat as ImageFormat) || 'jpg';
  });
  const { toast } = useToast();

  const isHeicOrHeif = (file: File) => {
    return file.type === 'image/heic' || 
           file.type === 'image/heif' || 
           file.name.toLowerCase().endsWith('.heic') || 
           file.name.toLowerCase().endsWith('.heif');
  };

  const getNewFileName = (originalName: string) => {
    return originalName.replace(/\.(heic|heif)$/i, `.${format}`);
  };

  const convertHeicToFormat = async (file: File): Promise<{ blob: Blob, previewUrl: string }> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const decoded = await HeicDecode.decode(arrayBuffer);
      const canvas = document.createElement('canvas');
      canvas.width = decoded.width;
      canvas.height = decoded.height;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) throw new Error('Could not get canvas context');
      
      const imageData = new ImageData(
        new Uint8ClampedArray(decoded.data),
        decoded.width,
        decoded.height
      );
      ctx.putImageData(imageData, 0, 0);

      const mimeType = `image/${format}`;
      const quality = format === 'webp' ? 0.9 : 0.95;

      return new Promise((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const previewUrl = URL.createObjectURL(blob);
              resolve({ blob, previewUrl });
            } else {
              reject(new Error('Conversion failed'));
            }
          },
          mimeType,
          quality
        );
      });
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

    const validFiles = Array.from(files).filter(isHeicOrHeif);

    if (validFiles.length === 0) {
      toast({
        title: "Invalid files",
        description: "Please select HEIC or HEIF images only",
        variant: "destructive",
      });
      return;
    }

    try {
      const newImages = await Promise.all(
        validFiles.map(async (file) => {
          const { blob, previewUrl } = await convertHeicToFormat(file);
          return {
            id: Math.random().toString(36).substr(2, 9),
            originalFile: file,
            previewUrl,
            fileName: getNewFileName(file.name),
            exifData: null,
            convertedBlob: blob,
          };
        })
      );

      setImages(prev => [...newImages, ...prev]);
    } catch (error) {
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
    // TODO: Implement EXIF data extraction
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
