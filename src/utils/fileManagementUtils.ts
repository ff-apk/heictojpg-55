
import { ConvertedImage } from "@/types/heicConverter";

export const cleanupObjectURLs = (images: ConvertedImage[]) => {
  images.forEach(image => {
    if (image.previewUrl) {
      URL.revokeObjectURL(image.previewUrl);
    }
  });
};

export const downloadImage = async (image: ConvertedImage) => {
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

export const openImageInNewTab = (image: ConvertedImage) => {
  if (!image || !image.convertedBlob) return;

  const url = URL.createObjectURL(image.convertedBlob);
  window.open(url, '_blank');
  
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1000);
};

export const downloadAllImages = async (images: ConvertedImage[]) => {
  for (const image of images) {
    if (image.convertedBlob) {
      await downloadImage(image);
      // Small delay between downloads to prevent browser throttling
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
};
