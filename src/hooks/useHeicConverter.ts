
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { ImageFormat, ConvertedImage, EditState } from "@/types/heicConverter";
import { ConversionTrigger, Qualities } from "@/types/conversion";
import { MAX_FILES } from "@/constants/upload";
import { convertHeicToFormat } from "@/services/heicConversionService";
import { useDragAndDrop } from "@/hooks/useDragAndDrop";
import { 
  formatQuality,
  getConversionMessage,
  getConversionStartMessage,
  validateFileName
} from "@/utils/conversionUtils";
import {
  cleanupObjectURLs,
  downloadImage as downloadImageUtil,
  openImageInNewTab as openImageInNewTabUtil
} from "@/utils/fileManagementUtils";

const CHUNK_SIZE = 2;

export const useHeicConverter = () => {
  const [images, setImages] = useState<ConvertedImage[]>([]);
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

  const setQuality = (newQuality: number) => {
    setQualities(prev => ({
      ...prev,
      [format]: newQuality
    }));
    localStorage.setItem(`heic-convert-quality-${format}`, newQuality.toString());
  };

  useEffect(() => {
    return () => {
      cleanupObjectURLs(images);
    };
  }, [images]);

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
            fileName: file.name.replace(/\.(heic|heif)$/i, `.${finalFormat}`),
            exifData: null,
            convertedBlob: imageResult.blob,
            progress: 100,
          };

          setImages(prev => [...prev, newImage]);
          setConvertedCount(prev => prev + 1);
        } catch (error) {
          console.error(`Failed to convert ${file.name}:`, error);
          toast({
            title: "Error",
            description: `Conversion failed for ${file.name}`,
            variant: "destructive",
          });
        }

        currentProgress += incrementPerImage;
        setProgress(Math.min(currentProgress, 100));
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

  const handleFiles = async (files: File[]) => {
    const allFiles = Array.from(files);
    const filesToProcess = allFiles.slice(0, MAX_FILES);
    const excludedCount = allFiles.length - filesToProcess.length;

    setIsConverting(true);
    cleanupObjectURLs(images);
    setImages([]);

    try {
      const hasNonHeic = await processImagesSequentially(filesToProcess);

      if (excludedCount > 0) {
        toast({
          title: `Max upload limit is ${MAX_FILES} at a time`,
          description: `Other ${excludedCount} image${excludedCount > 1 ? 's' : ''} have been excluded`,
          duration: 7000,
        });
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

  const handleReconversion = async (newQuality?: number, trigger: ConversionTrigger = 'quality', targetFormat?: ImageFormat) => {
    const finalFormat = targetFormat || format;
    const finalQuality = finalFormat === 'png' ? 0.95 : (newQuality ?? qualities[finalFormat]);
    
    cleanupObjectURLs(images);
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

  const downloadImage = (imageId: string) => {
    const image = images.find(img => img.id === imageId);
    if (image) {
      downloadImageUtil(image);
    }
  };

  const openImageInNewTab = (imageId: string) => {
    const image = images.find(img => img.id === imageId);
    if (image) {
      openImageInNewTabUtil(image);
    }
  };

  const startEditing = (imageId: string) => {
    setEditState({ imageId, isEditing: true });
  };

  const cancelEditing = () => {
    setEditState({ imageId: null, isEditing: false });
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

  const reset = () => {
    cleanupObjectURLs(images);
    setImages([]);
    setProgress(0);
    setShowProgress(false);
    setTotalImages(0);
    setConvertedCount(0);
  };

  const dragAndDrop = useDragAndDrop(handleFiles);

  return {
    images,
    isDragging: dragAndDrop.isDragging,
    format,
    isConverting,
    editState,
    quality,
    progress,
    showProgress,
    totalImages,
    convertedCount,
    setFormat,
    setQuality,
    handleFiles,
    handleDragOver: dragAndDrop.handleDragOver,
    handleDragEnter: dragAndDrop.handleDragEnter,
    handleDragLeave: dragAndDrop.handleDragLeave,
    handleDrop: dragAndDrop.handleDrop,
    downloadImage,
    reset,
    openImageInNewTab,
    startEditing,
    cancelEditing,
    handleRename,
  };
};
