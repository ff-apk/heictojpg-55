
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { ImageFormat, ConvertedImage, EditState } from "@/types/heicConverter";
import { isHeicOrHeif, getNewFileName } from "@/utils/heicConverterUtils";
import { convertHeicToFormat } from "@/services/heicConversionService";
import { MAX_FILES } from "@/constants/upload";

interface Qualities {
  [key: string]: number;
}

type ConversionTrigger = 'format' | 'quality';

const CHUNK_SIZE = 2;
const MAX_FILE_SIZE = 50 * 1024 * 1024;

const getConversionMessage = (count: number, format: string, quality: number, includesNonHeic: boolean) => {
  const pluralSuffix = count > 1 ? 's' : '';
  const actionVerb = includesNonHeic ? 'processed' : 'converted';
  if (format === 'png') {
    return `Successfully ${actionVerb} ${count} image${pluralSuffix} to PNG`;
  }
  const formattedQuality = quality.toFixed(2);
  return `Successfully ${actionVerb} ${count} image${pluralSuffix} to ${format.toUpperCase()} with quality ${formattedQuality}`;
};

const getConversionStartMessage = (trigger: ConversionTrigger) => {
  return trigger === 'format' 
    ? "Please wait while we convert your images to the new format"
    : "Please wait while we convert your images to the new quality";
};

export const useHeicConverter = () => {
  const [images, setImages] = useState<ConvertedImage[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showProgress, setShowProgress] = useState(false);
  const [totalImages, setTotalImages] = useState(0);
  const [convertedCount, setConvertedCount] = useState(0);
  const [editState, setEditState] = useState<EditState>({
    imageId: null,
    isEditing: false,
  });
  const [format, setFormat] = useState<ImageFormat>(() => {
    const savedFormat = localStorage.getItem('heic-convert-format');
    return (savedFormat as ImageFormat) || 'jpg';
  });
  const [qualities, setQualities] = useState<Qualities>(() => ({
    jpg: parseFloat(localStorage.getItem('heic-convert-quality-jpg') || '0.9'),
    png: 0.95,
    webp: parseFloat(localStorage.getItem('heic-convert-quality-webp') || '0.9'),
  }));
  
  const { toast } = useToast();
  const quality = qualities[format];

  const cleanupObjectURLs = () => {
    images.forEach(image => {
      if (image.previewUrl) {
        URL.revokeObjectURL(image.previewUrl);
      }
    });
  };

  useEffect(() => {
    return () => {
      cleanupObjectURLs();
    };
  }, []);

  const processImagesSequentially = async (
    files: File[], 
    targetFormat?: ImageFormat,
    targetQuality?: number
  ) => {
    const totalCount = files.length;
    setTotalImages(totalCount);
    setConvertedCount(0);
    setShowProgress(true);
    setProgress(0);

    const incrementPerImage = 100 / totalCount;
    let currentProgress = 0;
    let hasNonHeicFiles = false;

    for (let i = 0; i < files.length; i += CHUNK_SIZE) {
      const chunk = files.slice(i, i + CHUNK_SIZE);
      
      for (const file of chunk) {
        try {
          if (file.size > MAX_FILE_SIZE) {
            throw new Error(`File ${file.name} is too large (max ${MAX_FILE_SIZE / 1024 / 1024}MB)`);
          }

          const finalFormat = targetFormat || format;
          const finalQuality = finalFormat === 'png' ? 0.95 : (targetQuality ?? qualities[finalFormat]);

          const imageResult = await convertHeicToFormat(
            file,
            finalFormat,
            finalQuality,
            (fileProgress) => {
              const mappedProgress = currentProgress + (fileProgress * incrementPerImage / 100);
              setProgress(Math.min(mappedProgress, 100));
            }
          );

          hasNonHeicFiles = hasNonHeicFiles || !imageResult.isHeic;

          const newImage: ConvertedImage = {
            id: Math.random().toString(36).substr(2, 9),
            originalFile: file,
            previewUrl: imageResult.previewUrl,
            fileName: getNewFileName(file.name, finalFormat),
            exifData: null,
            convertedBlob: imageResult.blob,
            progress: 100,
          };

          setImages(prev => [...prev, newImage]);
          setConvertedCount(prev => prev + 1);
        } catch (error) {
          console.error(`Failed to convert ${file.name}:`, error);
          
          if (error instanceof Error && error.message.includes('out of memory')) {
            toast({
              title: "Memory Error",
              description: `Failed to convert ${file.name} - file may be too large`,
              variant: "destructive",
            });
          } else {
            toast({
              title: "Error",
              description: `Conversion failed for ${file.name}`,
              variant: "destructive",
            });
          }
        }

        currentProgress += incrementPerImage;
        setProgress(Math.min(currentProgress, 100));

        await new Promise(resolve => setTimeout(resolve, 100));
      }

      if (typeof window.gc === 'function') {
        window.gc();
      }
    }

    setTimeout(() => {
      setShowProgress(false);
      setProgress(0);
    }, 1000);

    return hasNonHeicFiles;
  };

  const handleReconversion = async (newQuality?: number, trigger: ConversionTrigger = 'quality', targetFormat?: ImageFormat) => {
    const finalFormat = targetFormat || format;
    // Ensure we always have a valid quality value
    const finalQuality = finalFormat === 'png' ? 0.95 : (newQuality ?? qualities[finalFormat]);
    
    cleanupObjectURLs();
    const currentImages = images.map(img => ({
      id: img.id,
      originalFile: img.originalFile,
      fileName: img.fileName.substring(0, img.fileName.lastIndexOf('.')),
    }));

    setImages([]);
    setIsConverting(true);

    toast({
      title: "Converting images...",
      description: getConversionStartMessage(trigger),
    });

    try {
      const hasNonHeic = await processImagesSequentially(
        currentImages.map(img => img.originalFile),
        finalFormat,
        finalQuality
      );

      toast({
        title: "Conversion complete",
        description: getConversionMessage(currentImages.length, finalFormat, finalQuality, hasNonHeic),
      });
    } catch (error) {
      console.error('Unexpected error during conversion:', error);
      toast({
        title: "Unexpected error",
        description: "An unexpected error occurred. Please try again",
        variant: "destructive",
      });
    } finally {
      setIsConverting(false);
    }
  };

  const handleFiles = async (files: File[]) => {
    const allFiles = Array.from(files);
    const filesToProcess = allFiles.slice(0, MAX_FILES);
    const excludedFiles = allFiles.slice(MAX_FILES);
    const excludedCount = excludedFiles.length;

    setIsConverting(true);
    cleanupObjectURLs();
    setImages([]);

    try {
      const hasNonHeic = await processImagesSequentially(filesToProcess);

      if (excludedCount > 0) {
        setTimeout(() => {
          toast({
            title: `Max upload limit is ${MAX_FILES} at a time`,
            description: `Other ${excludedCount} image${excludedCount > 1 ? 's' : ''} have been excluded`,
            duration: 7000,
          });
        }, 1000);
      }
    } catch (error) {
      console.error('Unexpected error during processing:', error);
      toast({
        title: "Unexpected error",
        description: "An unexpected error occurred. Please try again",
        variant: "destructive",
      });
    } finally {
      setIsConverting(false);
    }
  };

  const reset = () => {
    cleanupObjectURLs();
    setImages([]);
    setProgress(0);
    setShowProgress(false);
    setTotalImages(0);
    setConvertedCount(0);
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

  const startEditing = (imageId: string) => {
    setEditState({ imageId, isEditing: true });
  };

  const cancelEditing = () => {
    setEditState({ imageId: null, isEditing: false });
  };

  const validateFileName = (name: string, extension: string): string => {
    let sanitized = name.replace(/[<>:"/\\|?*]/g, '').trim();
    
    if (!sanitized) {
      sanitized = 'image';
    }
    
    return `${sanitized}.${extension}`;
  };

  const handleRename = (imageId: string, newName: string) => {
    const image = images.find(img => img.id === imageId);
    if (!image) return;

    const extension = image.fileName.split('.').pop() || format;
    const currentName = image.fileName.replace(`.${extension}`, '');
    
    if (newName === currentName) {
      cancelEditing();
      return;
    }

    const oldFileName = image.fileName;
    const validatedFileName = validateFileName(newName, extension);

    setImages(prev => prev.map(img => {
      if (img.id === imageId) {
        const newPreviewUrl = img.previewUrl 
          ? URL.createObjectURL(img.convertedBlob!)
          : img.previewUrl;

        if (img.previewUrl) {
          URL.revokeObjectURL(img.previewUrl);
        }

        return {
          ...img,
          fileName: validatedFileName,
          previewUrl: newPreviewUrl,
        };
      }
      return img;
    }));

    cancelEditing();

    toast({
      title: "File renamed",
      description: `Successfully renamed ${oldFileName} to ${validatedFileName}`,
    });
  };

  return {
    images,
    isDragging,
    format,
    isConverting,
    editState,
    quality,
    progress,
    showProgress,
    totalImages,
    convertedCount,
    setFormat: (newFormat: ImageFormat) => {
      if (newFormat === format) return;
      localStorage.setItem('heic-convert-format', newFormat);
      setFormat(newFormat);
      if (images.length > 0) {
        setIsConverting(true);
        handleReconversion(undefined, 'format', newFormat);
      }
    },
    setQuality: (newQuality: number) => {
      if (format === 'png') return;
      
      // First update the local state
      setQualities(prev => ({
        ...prev,
        [format]: newQuality
      }));
      localStorage.setItem(`heic-convert-quality-${format}`, newQuality.toString());
      
      // Then immediately start reconversion with the new quality
      if (images.length > 0) {
        setIsConverting(true);
        handleReconversion(newQuality, 'quality');
      }
    },
    handleFiles,
    handleDragOver,
    handleDragEnter,
    handleDragLeave,
    handleDrop,
    handleExifData,
    downloadImage,
    reset,
    openImageInNewTab,
    startEditing,
    cancelEditing,
    handleRename,
  };
};
