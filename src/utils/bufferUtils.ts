
export const fileToBuffer = async (file: File): Promise<Buffer> => {
  const arrayBuffer = await file.arrayBuffer();
  return Buffer.from(arrayBuffer);
};

export const bufferToBlob = (buffer: Buffer, mimeType: string): Blob => {
  return new Blob([buffer], { type: mimeType });
};

