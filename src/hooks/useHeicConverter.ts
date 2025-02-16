
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { ImageFormat, ConvertedImage, EditState } from "@/types/heicConverter";
import { isHeicOrHeif, getNewFileName } from "@/utils/heicConverterUtils";
import { convertHeicToFormat } from "@/services/heicConversionService";
import { MAX_FILES } from "@/constants/upload";

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
  const { toast } = useToast();

  // Format change effect
  useEffect(() => {
    localStorage.setItem('heic-convert-format', format);
    
    // If there are images and we're not in the initial mount
    if (images.length > 0) {
      // Store current file order and names
      const currentImages = images.map(img => ({
        id: img.id,
        originalFile: img.originalFile,
        fileName: img.fileName.substring(0, img.fileName.lastIndexOf('.')), // Keep base name without extension
      }));

      setIsConverting(true);
      
      const processImages = async () => {
        const results = await Promise.allSettled(
          currentImages.map(async (image) => {
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

              // Clean up old preview URL
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
          setImages(successfulConversions);
          toast({
            title: "Format changed",
            description: `Successfully converted ${successfulConversions.length} image${successfulConversions.length > 1 ? 's' : ''} to ${format.toUpperCase()}.`,
          });
        }

        if (failedConversions.length > 0) {
          toast({
            title: "Some conversions failed",
            description: `${failedConversions.length} image${failedConversions.length > 1 ? 's' : ''} failed to convert.`,
            variant: "destructive",
          });
        }

        setIsConverting(false);
      };

      processImages();
    }
  }, [format]);

  const startEditing = (imageId: string) => {
    setEditState({ imageId, isEditing: true });
  };

  const cancelEditing = () => {
    setEditState({ imageId: null, isEditing: false });
  };

  const validateFileName = (name: string, extension: string): string => {
    // Remove invalid characters and trim
    let sanitized = name.replace(/[<>:"/\\|?*]/g, '').trim();
    
    // Ensure we have a valid name
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

    const validatedFileName = validateFileName(newName, extension);

    setImages(prev => prev.map(img => {
      if (img.id === imageId) {
        // Create new preview URL with the updated filename
        const newPreviewUrl = img.previewUrl 
          ? URL.createObjectURL(img.convertedBlob!)
          : img.previewUrl;

        // Clean up old preview URL
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
      description: `Successfully renamed to ${validatedFileName}`,
    });
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
    editState,
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
    startEditing,
    cancelEditing,
    handleRename,
  };
};
