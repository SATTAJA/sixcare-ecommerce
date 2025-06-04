export const cropImageToSquare = async (file: File): Promise<File> => {
  const imageBitmap = await createImageBitmap(file);

  const size = Math.min(imageBitmap.width, imageBitmap.height);
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to get canvas context');

  ctx.drawImage(
    imageBitmap,
    (imageBitmap.width - size) / 2,
    (imageBitmap.height - size) / 2,
    size,
    size,
    0,
    0,
    size,
    size
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) throw new Error('Failed to convert image');
      resolve(new File([blob], file.name, { type: 'image/jpeg' }));
    }, 'image/jpeg');
  });
};
