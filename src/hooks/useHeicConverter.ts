import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { ImageFormat, ConvertedImage } from "@/types/heicConverter";
import { isHeicOrHeif, getNewFileName } from "@/utils/heicConverterUtils";
import { convertHeicToFormat } from "@/services/heicConversionService";
import { MAX_FILES } from "@/constants/upload";

export const useHeicConverter = () => {
  const [images, setImages] = useState<ConvertedImage[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [format, setFormat] = useState<ImageFormat>(() => {
    const savedFormat = localStorage.getItem('heic-convert-format');
    return (savedFormat as ImageFormat) || 'jpg';
  });
  const { toast } = useToast();

  useEffect(() => {
    localStorage.setItem('heic-convert-format', format);
  }, [format]);

  const convertSingleImage = async (image: ConvertedImage) => {
    try {
      const { blob, previewUrl } = await convertHeicToFormat(
        image.originalFile,
        format,
        (progress) => {
          setImages(prev => prev.map(img =>
            img.id === image.id ? { ...img, progress } : img
          ));
        }
      );

      setImages(prev => prev.map(img =>
        img.id === image.id
          ? { ...img, previewUrl, convertedBlob: blob, progress: 100 }
          : img
      ));

      return { success: true, id: image.id };
    } catch (error) {
      console.error(`Failed to convert ${image.originalFile.name}:`, error);
      return { success: false, id: image.id, error };
    }
  };

  const handleFiles = async (files: File[]) => {
    const allFiles = Array.from(files);
    const filesToProcess = allFiles.slice(0, MAX_FILES);
    const excludedFiles = allFiles.slice(MAX_FILES);
    const excludedCount = excludedFiles.length;

    const validFiles = filesToProcess.filter(isHeicOrHeif);

    if (validFiles.length === 0) {
      toast({
        title: "Invalid files",
        description: "Please select HEIC or HEIF images only",
        variant: "destructive",
      });
      return;
    }

    setIsConverting(true);
    
    const newImages = validFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      originalFile: file,
      previewUrl: "",
      fileName: getNewFileName(file.name, format),
      exifData: null,
      convertedBlob: null,
      progress: 0,
    }));

    setImages(prev => [...newImages, ...prev]);

    const conversionPromises = newImages.map(image => convertSingleImage(image));
    const results = await Promise.all(conversionPromises);

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;

    if (successCount > 0) {
      toast({
        title: "Conversion complete",
        description: `Successfully converted ${successCount} image${successCount > 1 ? 's' : ''} to ${format.toUpperCase()}.`,
      });

      if (excludedCount > 0) {
        setTimeout(() => {
          toast({
            title: `Max upload limit is ${MAX_FILES} at a time`,
            description: `Other ${excludedCount} image${excludedCount > 1 ? 's' : ''} have been excluded.`,
            duration: 7000,
          });
        }, 4000);
      }
    }

    if (failureCount > 0) {
      toast({
        title: "Some conversions failed",
        description: `${failureCount} image${failureCount > 1 ? 's' : ''} failed to convert.`,
        variant: "destructive",
      });
    }

    setIsConverting(false);
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

  const openImageInNewTab = (imageId: string) => {
    const image = images.find(img => img.id === imageId);
    if (!image || !image.convertedBlob) return;

    const url = URL.createObjectURL(image.convertedBlob);
    window.open(url, '_blank');
    
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 1000);
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
    isConverting,
    setFormat,
    handleFiles,
    handleDragOver,
    handleDragEnter,
    handleDragLeave,
    handleDrop,
    handleExifData,
    downloadImage,
    openImageInNewTab,
    reset,
  };
};
