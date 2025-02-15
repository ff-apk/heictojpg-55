
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

type ImageFormat = 'jpg' | 'png' | 'webp';

interface ConvertedImage {
  id: string;
  originalFile: File;
  previewUrl: string;
  fileName: string;
  exifData: null | Record<string, any>;
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

    const newImages = await Promise.all(
      validFiles.map(async (file) => {
        // For now, we're just creating preview URLs
        // TODO: Implement actual HEIC/HEIF conversion
        const previewUrl = URL.createObjectURL(file);
        return {
          id: Math.random().toString(36).substr(2, 9),
          originalFile: file,
          previewUrl,
          fileName: getNewFileName(file.name),
          exifData: null,
        };
      })
    );

    setImages(prev => [...newImages, ...prev]);
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
    if (!image) return;

    // TODO: Implement actual conversion before download
    const link = document.createElement("a");
    link.href = image.previewUrl;
    link.download = image.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
