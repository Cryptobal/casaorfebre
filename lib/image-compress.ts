const MAX_EDGE = 1800;
const QUALITY = 0.82;
const MAX_BYTES = 2 * 1024 * 1024;

export class ImageCompressError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ImageCompressError";
  }
}

async function decodeToBitmap(file: File): Promise<ImageBitmap> {
  if (typeof createImageBitmap === "function") {
    try {
      return await createImageBitmap(file);
    } catch {
      // fall through to <img>
    }
  }

  const url = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("decode"));
      el.src = url;
    });
    return await createImageBitmap(image);
  } catch {
    throw new ImageCompressError(
      "Formato no soportado, intenta con otra foto"
    );
  } finally {
    URL.revokeObjectURL(url);
  }
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number
): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), type, quality);
  });
}

export async function compressImageFile(file: File): Promise<Blob> {
  const bitmap = await decodeToBitmap(file);
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    throw new ImageCompressError("No se pudo comprimir la imagen");
  }
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const qualities = [QUALITY, 0.7, 0.55];
  let jpegFallback: Blob | null = null;

  for (const quality of qualities) {
    const webp = await canvasToBlob(canvas, "image/webp", quality);
    if (webp && webp.size > 0 && webp.type === "image/webp") {
      if (webp.size <= MAX_BYTES) return webp;
    }
    const jpeg = await canvasToBlob(canvas, "image/jpeg", quality);
    if (jpeg && jpeg.size > 0) {
      jpegFallback = jpeg;
      if (jpeg.size <= MAX_BYTES) return jpeg;
    }
  }

  if (jpegFallback && jpegFallback.size <= MAX_BYTES) return jpegFallback;
  if (jpegFallback) {
    throw new ImageCompressError(
      "La foto sigue pesando más de 2 MB. Prueba con otra."
    );
  }

  throw new ImageCompressError("No se pudo comprimir la imagen");
}
