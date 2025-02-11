
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useImageToClipboard = () => {
  const [image, setImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchImageWithProxy = async (url: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('fetch-image-proxy', {
        body: { url }
      });

      if (error) throw error;

      // The response is the image binary data with proper content type
      const blob = new Blob([data], { type: 'image/png' });
      const imageUrl = URL.createObjectURL(blob);
      return imageUrl;
    } catch (error) {
      console.error('Proxy error:', error);
      throw error;
    }
  };

  const fetchImage = async (url: string) => {
    try {
      setIsLoading(true);
      let imageUrl: string;

      try {
        // First try direct fetch
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch image');
        
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.startsWith('image/')) {
          throw new Error('URL does not point to a valid image');
        }

        const blob = await response.blob();
        imageUrl = URL.createObjectURL(blob);
      } catch (error) {
        console.log('Direct fetch failed, trying proxy:', error);
        // If direct fetch fails, try using the proxy
        imageUrl = await fetchImageWithProxy(url);
      }

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
        title: "Success",
        description: "Image copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy image to clipboard. Make sure you're using a supported browser.",
        variant: "destructive",
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
    fetchImage,
    handleFileUpload,
    copyToClipboard,
    reset,
  };
};
