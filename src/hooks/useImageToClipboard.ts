import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export const useImageToClipboard = () => {
  const [image, setImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();

  const fetchImage = async (url: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch image');
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.startsWith('image/')) {
        throw new Error('URL does not point to a valid image');
      }

      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);
      setImage(imageUrl);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch image",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    const imageUrl = URL.createObjectURL(file);
    setImage(imageUrl);
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

    const items = e.dataTransfer.items;
    let foundImage = false;

    for (const item of items) {
      if (item.kind === 'file' && item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) {
          handleFileUpload(file);
          foundImage = true;
          break;
        }
      }
    }

    if (!foundImage) {
      toast({
        title: "Invalid File",
        description: "Please drop an image file",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = async () => {
    if (!image) return;

    try {
      const response = await fetch(image);
      const originalBlob = await response.blob();
      
      // Convert to PNG using canvas
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Failed to create canvas context');
      }

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = image;
      });

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      
      const pngBlob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Failed to convert image to PNG'));
        }, 'image/png');
      });

      await navigator.clipboard.write([
        new ClipboardItem({
          'image/png': pngBlob
        })
      ]);

      toast({
        title: "Image copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy image to clipboard. Make sure you're using a supported browser.",
        variant: "destructive",
        duration: 8000,
      });
      console.error('Clipboard error:', error);
    }
  };

  const reset = () => {
    if (image) {
      URL.revokeObjectURL(image);
      setImage(null);
    }
  };

  return {
    image,
    isLoading,
    isDragging,
    fetchImage,
    handleFileUpload,
    copyToClipboard,
    reset,
    handleDragOver,
    handleDragEnter,
    handleDragLeave,
    handleDrop,
  };
};
