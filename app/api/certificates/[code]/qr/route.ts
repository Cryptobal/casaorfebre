import { NextResponse } from "next/server";
import { generateQRCodeBuffer } from "@/lib/certificates";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;

  const buffer = await generateQRCodeBuffer(code);

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
