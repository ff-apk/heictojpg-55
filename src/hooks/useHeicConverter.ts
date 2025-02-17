import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { ImageFormat, ConvertedImage, EditState } from "@/types/heicConverter";
import { isHeicOrHeif, getNewFileName } from "@/utils/heicConverterUtils";
import { convertHeicToFormat } from "@/services/heicConversionService";
import { MAX_FILES } from "@/constants/upload";

interface Qualities {
  [key: string]: number;
}

const getConversionMessage = (count: number, format: string, quality: number) => {
  const pluralSuffix = count > 1 ? 's' : '';
  if (format === 'png') {
    return `Successfully converted ${count} image${pluralSuffix} to PNG`;
  }
  return `Successfully converted ${count} image${pluralSuffix} to ${format.toUpperCase()} with quality ${quality}`;
};

export const useHeicConverter = () => {
  const [images, setImages] = useState<ConvertedImage[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [editState, setEditState] = useState<EditState>({
    imageId: null,
    isEditing: false,
  });
  const [format, setFormat] = useState<ImageFormat>(() => {
    const savedFormat = localStorage.getItem('heic-convert-format');
    return (savedFormat as ImageFormat) || 'jpg';
  });
  const [qualities, setQualities] = useState<Qualities>(() => ({
    jpg: parseFloat(localStorage.getItem('heic-convert-quality-jpg') || '1'),
    png: 0.95,
    webp: parseFloat(localStorage.getItem('heic-convert-quality-webp') || '1'),
  }));
  
  const { toast } = useToast();

  const quality = qualities[format];

  const handleReconversion = async (newQuality?: number) => {
    const currentQuality = format === 'png' ? 0.95 : (newQuality ?? qualities[format]);
    
    const currentImages = images.map(img => ({
      id: img.id,
      originalFile: img.originalFile,
      fileName: img.fileName.substring(0, img.fileName.lastIndexOf('.')),
    }));

    setImages(prev => prev.map(img => ({
      ...img,
      fileName: `${img.fileName.substring(0, img.fileName.lastIndexOf('.'))}.${format}`
    })));

    const toastId = toast({
      title: "Converting images...",
      description: "Please wait while we convert your images to the new format",
    });

    try {
      const results = await Promise.allSettled(
        currentImages.map(async (image) => {
          try {
            const { blob, previewUrl } = await convertHeicToFormat(
              image.originalFile,
              format,
              currentQuality,
              (progress) => {
                setImages(prev => prev.map(img =>
                  img.id === image.id ? {
                    ...img,
                    progress,
                    fileName: `${image.fileName}.${format}`
                  } : img
                ));
              }
            );

            const oldImage = images.find(img => img.id === image.id);
            if (oldImage?.previewUrl) {
              URL.revokeObjectURL(oldImage.previewUrl);
            }

            return {
              id: image.id,
              originalFile: image.originalFile,
              previewUrl,
              fileName: `${image.fileName}.${format}`,
              exifData: null,
              convertedBlob: blob,
              progress: 100,
            };
          } catch (error) {
            console.error(`Failed to convert ${image.originalFile.name}:`, error);
            throw new Error(`Failed to convert ${image.originalFile.name}`);
          }
        })
      );

      const successfulConversions = results
        .filter((result): result is PromiseFulfilledResult<ConvertedImage> => 
          result.status === 'fulfilled'
        )
        .map(result => result.value);

      const failedConversions = results.filter(
        result => result.status === 'rejected'
      );

      if (successfulConversions.length > 0) {
        setImages(prev => {
          const nonNewImages = prev.filter(p => !currentImages.find(n => n.id === p.id));
          return [...successfulConversions, ...nonNewImages];
        });

        toast({
          title: "Conversion complete",
          description: getConversionMessage(successfulConversions.length, format, currentQuality),
        });
      }

      if (failedConversions.length > 0) {
        toast({
          title: "Some conversions failed",
          description: `${failedConversions.length} image${failedConversions.length > 1 ? 's' : ''} failed to convert`,
          variant: "destructive",
        });
      }
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

  const setQuality = (newQuality: number) => {
    if (format === 'png') return;

    setQualities(prev => ({
      ...prev,
      [format]: newQuality
    }));
    
    localStorage.setItem(`heic-convert-quality-${format}`, newQuality.toString());

    if (images.length > 0) {
      setIsConverting(true);
      handleReconversion(newQuality);
    }
  };

  useEffect(() => {
    localStorage.setItem('heic-convert-format', format);
    
    if (format === 'png') {
      setQualities(prev => ({
        ...prev,
        png: 0.95
      }));
    }
    
    if (images.length > 0) {
      setIsConverting(true);
      handleReconversion();
    }
  }, [format]);

  const handleFiles = async (files: File[]) => {
    const allFiles = Array.from(files);
    const filesToProcess = allFiles.slice(0, MAX_FILES);
    const excludedFiles = allFiles.slice(MAX_FILES);
    const excludedCount = excludedFiles.length;

    const validationPromises = filesToProcess.map(isHeicOrHeif);
    const validationResults = await Promise.all(validationPromises);
    const validFiles = filesToProcess.filter((_, index) => validationResults[index]);

    if (validFiles.length === 0) {
      toast({
        title: "Invalid files",
        description: "Please select HEIC or HEIF images only",
        variant: "destructive",
      });
      return;
    }

    setIsConverting(true);
    const toastId = toast({
      title: "Converting images...",
      description: "Please wait while we convert your images",
    });

    try {
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

      const results = await Promise.allSettled(
        newImages.map(async (image) => {
          try {
            const { blob, previewUrl } = await convertHeicToFormat(
              image.originalFile, 
              format,
              qualities[format],
              (progress) => {
                setImages(prev => prev.map(img => 
                  img.id === image.id ? { ...img, progress } : img
                ));
              }
            );
            return {
              ...image,
              previewUrl,
              convertedBlob: blob,
              progress: 100,
            };
          } catch (error) {
            console.error(`Failed to convert ${image.originalFile.name}:`, error);
            throw new Error(`Failed to convert ${image.originalFile.name}`);
          }
        })
      );

      const successfulConversions = results
        .filter((result): result is PromiseFulfilledResult<ConvertedImage> => 
          result.status === 'fulfilled'
        )
        .map(result => result.value);

      const failedConversions = results.filter(
        result => result.status === 'rejected'
      );

      setImages(prev => {
        const nonNewImages = prev.filter(p => !newImages.find(n => n.id === p.id));
        return [...successfulConversions, ...nonNewImages];
      });

      if (successfulConversions.length > 0) {
        toast({
          title: "Conversion complete",
          description: getConversionMessage(successfulConversions.length, format, qualities[format]),
        });

        if (excludedCount > 0) {
          setTimeout(() => {
            toast({
              title: `Max upload limit is ${MAX_FILES} at a time`,
              description: `Other ${excludedCount} image${excludedCount > 1 ? 's' : ''} have been excluded`,
              duration: 7000,
            });
          }, 4000);
        }
      }

      if (failedConversions.length > 0) {
        toast({
          title: "Some conversions failed",
          description: `${failedConversions.length} image${failedConversions.length > 1 ? 's' : ''} failed to convert`,
          variant: "destructive",
        });
      }
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
    setFormat,
    setQuality,
    handleFiles,
    handleDragOver,
    handleDragEnter,
    handleDragLeave,
    handleDrop,
    handleExifData,
    downloadImage,
    openImageInNewTab,
    reset,
    startEditing,
    cancelEditing,
    handleRename,
  };
};
