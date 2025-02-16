
export type ImageFormat = 'jpg' | 'png' | 'webp';

export interface ConvertedImage {
  id: string;
  originalFile: File;
  previewUrl: string;
  fileName: string;
  exifData: null | Record<string, any>;
  convertedBlob: Blob | null;
  progress: number;
}

export interface EditState {
  imageId: string | null;
  isEditing: boolean;
}
