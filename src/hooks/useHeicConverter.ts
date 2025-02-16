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

  const handleFormatChange = async (newFormat: ImageFormat) => {
    if (isConverting) return;
    
    try {
      if (images.length > 0) {
        setIsConverting(true);
        
        const toastId = toast({
          title: "Converting images...",
          description: "Please wait while we convert your images to the new format.",
        });

        images.forEach(image => {
          URL.revokeObjectURL(image.previewUrl);
        });

        const results = await Promise.allSettled(
          images.map(async (image) => {
            try {
              const { blob, previewUrl } = await convertHeicToFormat(image.originalFile, newFormat);
              return {
                id: image.id,
                originalFile: image.originalFile,
                previewUrl,
                fileName: getNewFileName(image.originalFile.name, newFormat),
                exifData: null,
                convertedBlob: blob,
              };
            } catch (error) {
              console.error(`Failed to reconvert ${image.originalFile.name}:`, error);
              throw new Error(`Failed to reconvert ${image.originalFile.name}`);
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
          setImages(successfulConversions);
          setFormat(newFormat);
          
          toast({
            title: "Conversion complete",
            description: `Successfully converted ${successfulConversions.length} image${successfulConversions.length > 1 ? 's' : ''} to ${newFormat.toUpperCase()}.`,
          });
        }

        if (failedConversions.length > 0) {
          toast({
            title: "Some conversions failed",
            description: `${failedConversions.length} image${failedConversions.length > 1 ? 's' : ''} failed to convert.`,
            variant: "destructive",
          });
        }
      } else {
        setFormat(newFormat);
      }
    } catch (error) {
      console.error('Unexpected error during conversion:', error);
      toast({
        title: "Unexpected error",
        description: "An unexpected error occurred. Please try again.",
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
    const toastId = toast({
      title: "Converting images...",
      description: "Please wait while we convert your images.",
    });

    try {
      const results = await Promise.allSettled(
        validFiles.map(async (file) => {
          try {
            const { blob, previewUrl } = await convertHeicToFormat(file, format);
            return {
              id: Math.random().toString(36).substr(2, 9),
              originalFile: file,
              previewUrl,
              fileName: getNewFileName(file.name, format),
              exifData: null,
              convertedBlob: blob,
            };
          } catch (error) {
            console.error(`Failed to convert ${file.name}:`, error);
            throw new Error(`Failed to convert ${file.name}`);
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
        setImages(prev => [...successfulConversions, ...prev]);
        toast({
          title: "Conversion complete",
          description: `Successfully converted ${successfulConversions.length} image${successfulConversions.length > 1 ? 's' : ''} to ${format.toUpperCase()}.`,
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

      if (failedConversions.length > 0) {
        toast({
          title: "Some conversions failed",
          description: `${failedConversions.length} image${failedConversions.length > 1 ? 's' : ''} failed to convert.`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Unexpected error during conversion:', error);
      toast({
        title: "Unexpected error",
        description: "An unexpected error occurred. Please try again.",
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
    
    // Clean up the URL after a short delay to ensure the new tab has loaded the image
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
    setFormat: handleFormatChange,
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
