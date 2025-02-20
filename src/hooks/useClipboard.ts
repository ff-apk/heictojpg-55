import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

type ImageFormat = 'png' | 'jpg' | 'webp';

export const useClipboard = () => {
  const [image, setImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [format, setFormat] = useState<ImageFormat>(() => {
    const savedFormat = localStorage.getItem('clipboard-image-format');
    return (savedFormat as ImageFormat) || 'png';
  });
  const { toast } = useToast();

  useEffect(() => {
    localStorage.setItem('clipboard-image-format', format);
  }, [format]);

  const checkClipboardPermission = async () => {
    try {
      const result = await navigator.permissions.query({
        name: "clipboard-read" as PermissionName,
      });
      
      // Only return false if explicitly denied
      return result.state !== "denied";
    } catch (error) {
      // For browsers that don't support the Permissions API,
      // return true and let the actual clipboard operation handle any errors
      return true;
    }
  };

  const handlePaste = async () => {
    try {
      const hasPermission = await checkClipboardPermission();
      
      if (!hasPermission) {
        toast({
          title: "Permission Denied",
          description: "Please allow clipboard access in your browser settings",
          variant: "destructive",
          duration: 7000,
        });
        return;
      }

      const items = await navigator.clipboard.read();
      let foundImage = false;
      
      for (const item of items) {
        if (item.types.includes("image/png") || item.types.includes("image/jpeg")) {
          const blob = await item.getType(
            item.types.includes("image/png") ? "image/png" : "image/jpeg"
          );
          const url = URL.createObjectURL(blob);
          setImage(url);
          foundImage = true;
          break;
        }
      }

      if (!foundImage) {
        toast({
          title: "No Image Found",
          description: "Please copy an image to your clipboard first",
          variant: "destructive",
          duration: 7000,
        });
      }
    } catch (error: any) {
      if (error.name === "NotAllowedError") {
        toast({
          title: "Access Denied",
          description: "Please allow clipboard access when prompted",
          variant: "destructive",
          duration: 7000,
        });
      } else if (error.name === "SecurityError") {
        toast({
          title: "Security Error",
          description: "Clipboard access is restricted in this context",
          variant: "destructive",
          duration: 7000,
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to read from clipboard. Please try again.",
          variant: "destructive",
          duration: 7000,
        });
      }
      console.error("Clipboard error:", error);
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

    const items = e.dataTransfer.items;
    let foundImage = false;

    for (const item of items) {
      if (item.kind === 'file' && item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) {
          const url = URL.createObjectURL(file);
          setImage(url);
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

  const convertImageToFormat = async (imageUrl: string, format: ImageFormat): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }
        ctx.drawImage(img, 0, 0);
        
        let mimeType: string;
        let quality: number;
        
        switch (format) {
          case 'jpg':
            mimeType = 'image/jpeg';
            quality = 0.9;
            break;
          case 'webp':
            mimeType = 'image/webp';
            quality = 0.9;
            break;
          default:
            mimeType = 'image/png';
            quality = 1;
        }
        
        const dataUrl = canvas.toDataURL(mimeType, quality);
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = imageUrl;
    });
  };

  const downloadImage = async () => {
    if (!image) return;
    
    try {
      const convertedImage = await convertImageToFormat(image, format);
      const link = document.createElement("a");
      link.href = convertedImage;
      link.download = `copied-image-${Date.now()}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      toast({
        title: "Download Error",
        description: "Failed to download the image. Please try again.",
        variant: "destructive",
        duration: 7000,
      });
    }
  };

  const resetImage = () => {
    if (image) {
      URL.revokeObjectURL(image);
      setImage(null);
    }
  };

  return {
    image,
    isDragging,
    format,
    setFormat,
    handlePaste,
    downloadImage,
    resetImage,
    handleDragOver,
    handleDragEnter,
    handleDragLeave,
    handleDrop,
  };
};
