/**
 * Photo enhancement utilities for artisan product images.
 * Currently supports background removal via external API.
 */

const REMOVE_BG_API_KEY = process.env.REMOVE_BG_API_KEY;

/**
 * Removes the background from an image using remove.bg API.
 * Returns a base64-encoded PNG of the result.
 */
export async function removeBackground(imageUrl: string): Promise<Buffer> {
  if (!REMOVE_BG_API_KEY) {
    throw new Error("REMOVE_BG_API_KEY not configured");
  }

  const response = await fetch("https://api.remove.bg/v1.0/removebg", {
    method: "POST",
    headers: {
      "X-Api-Key": REMOVE_BG_API_KEY,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      image_url: imageUrl,
      size: "regular",
      type: "product",
      format: "png",
      bg_color: "",
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`remove.bg API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const base64Image = data.data?.result_b64;

  if (!base64Image) {
    throw new Error("No result from remove.bg");
  }

  return Buffer.from(base64Image, "base64");
}
