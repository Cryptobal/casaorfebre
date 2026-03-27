import { uploadToR2 } from "@/lib/r2";
import { applicationPhotoLimiter } from "@/lib/rate-limit";
import { NextResponse } from "next/server";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

function clientIp(request: Request): string {
  const xf = request.headers.get("x-forwarded-for");
  if (xf) return xf.split(",")[0]!.trim();
  const real = request.headers.get("x-real-ip");
  if (real) return real;
  return "unknown";
}

/**
 * Subida pública para el formulario de postulación (sin login).
 * Rate limit por IP; archivos en R2 bajo applications/postulaciones/
 */
export async function POST(request: Request) {
  const ip = clientIp(request);
  try {
    const { success } = await applicationPhotoLimiter.limit(ip);
    if (!success) {
      return NextResponse.json(
        { error: "Demasiadas subidas desde esta red. Intenta más tarde." },
        { status: 429 }
      );
    }
  } catch {
    // Sin Redis en dev: permitir con log
    console.warn("[application-photo] rate limit skipped");
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida" }, { status: 400 });
  }

  const file = formData.get("file") as File | null;
  if (!file || !(file instanceof Blob)) {
    return NextResponse.json({ error: "Archivo requerido" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "Solo JPG, PNG o WebP" },
      { status: 400 }
    );
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: "La imagen no debe superar 5 MB" },
      { status: 400 }
    );
  }

  try {
    const ext = file.name.split(".").pop() || "jpg";
    const key = `applications/postulaciones/${crypto.randomUUID()}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    const url = await uploadToR2(buffer, key, file.type);
    return NextResponse.json({ url });
  } catch (e) {
    console.error("[application-photo]", e);
    return NextResponse.json(
      { error: "No se pudo subir la imagen" },
      { status: 500 }
    );
  }
}
