
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
