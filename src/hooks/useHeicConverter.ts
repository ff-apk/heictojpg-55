import { useState, useEffect } from "react";
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

export const useHeicConverter = () => {
  const [images, setImages] = useState<ConvertedImage[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [format, setFormat] = useState<ImageFormat>(() => {
    const savedFormat = localStorage.getItem('heic-convert-format');
    return (savedFormat as ImageFormat) || 'jpg';
  });
  const { toast } = useToast();

  useEffect(() => {
    localStorage.setItem('heic-convert-format', format);
  }, [format]);

  const isHeicOrHeif = (file: File) => {
    return file.type === 'image/heic' || 
           file.type === 'image/heif' || 
           file.name.toLowerCase().endsWith('.heic') || 
           file.name.toLowerCase().endsWith('.heif');
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
      let convertedBlob: Blob;

      if (format === 'webp') {
        const pngBlob = await heic2any({
          blob: file,
          toType: 'image/png',
          quality: 0.95,
        }) as Blob;

        convertedBlob = await convertPngToWebp(pngBlob);
      } else {
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

  const handleFormatChange = async (newFormat: ImageFormat) => {
    setFormat(newFormat);
    
    if (images.length > 0) {
      const toastId = toast({
        title: "Reconverting images...",
        description: "Please wait while we convert your images to the new format.",
      });

      try {
        images.forEach(image => {
          URL.revokeObjectURL(image.previewUrl);
        });

        const results = await Promise.allSettled(
          images.map(async (image) => {
            try {
              const { blob, previewUrl } = await convertHeicToFormat(image.originalFile);
              return {
                id: image.id,
                originalFile: image.originalFile,
                previewUrl,
                fileName: getNewFileName(image.originalFile.name),
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
          toast({
            title: "Reconversion complete",
            description: `Successfully converted ${successfulConversions.length} image${successfulConversions.length > 1 ? 's' : ''} to ${newFormat.toUpperCase()}.`,
          });
        }

        if (failedConversions.length > 0) {
          toast({
            title: "Some reconversions failed",
            description: `${failedConversions.length} image${failedConversions.length > 1 ? 's' : ''} failed to convert.`,
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Unexpected error during reconversion:', error);
        toast({
          title: "Unexpected error",
          description: "An unexpected error occurred during reconversion. Please try again.",
          variant: "destructive",
        });
      }
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

    const toastId = toast({
      title: "Converting images...",
      description: "Please wait while we convert your images.",
    });

    try {
      const results = await Promise.allSettled(
        validFiles.map(async (file) => {
          try {
            const { blob, previewUrl } = await convertHeicToFormat(file);
            return {
              id: Math.random().toString(36).substr(2, 9),
              originalFile: file,
              previewUrl,
              fileName: getNewFileName(file.name),
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
          description: `Successfully converted ${successfulConversions.length} image${successfulConversions.length > 1 ? 's' : ''}.`,
        });
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
    setFormat: handleFormatChange,
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
