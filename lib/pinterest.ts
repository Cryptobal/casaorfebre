interface PinterestPin {
  title: string;
  description: string;
  link: string;
  board_id: string;
  media_source: {
    source_type: "image_url";
    url: string;
  };
}

class PinterestClient {
  private accessToken: string;
  private baseUrl = "https://api.pinterest.com/v5";

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  async createPin(pin: PinterestPin): Promise<{ id: string } | null> {
    try {
      const res = await fetch(`${this.baseUrl}/pins`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(pin),
      });

      if (!res.ok) {
        const body = await res.text();
        console.error(`[Pinterest] createPin failed: ${res.status} ${body}`);
        return null;
      }

      const data = await res.json();
      return { id: data.id };
    } catch (error) {
      console.error("[Pinterest] createPin error:", error);
      return null;
    }
  }

  async getPinAnalytics(
    pinId: string,
    startDate: string,
    endDate: string,
  ): Promise<unknown> {
    try {
      const params = new URLSearchParams({
        start_date: startDate,
        end_date: endDate,
        metric_types: "IMPRESSION,SAVE,PIN_CLICK",
      });
      const res = await fetch(
        `${this.baseUrl}/pins/${pinId}/analytics?${params}`,
        {
          headers: { Authorization: `Bearer ${this.accessToken}` },
        },
      );
      if (!res.ok) return null;
      return res.json();
    } catch {
      return null;
    }
  }

  async getBoardPins(boardId: string, pageSize = 25): Promise<unknown[]> {
    try {
      const res = await fetch(
        `${this.baseUrl}/boards/${boardId}/pins?page_size=${pageSize}`,
        {
          headers: { Authorization: `Bearer ${this.accessToken}` },
        },
      );
      if (!res.ok) return [];
      const data = await res.json();
      return data.items ?? [];
    } catch {
      return [];
    }
  }
}

export const pinterestClient = new PinterestClient(
  process.env.PINTEREST_ACCESS_TOKEN || "",
);

// ── Blog pin tracking (JSON file) ──

import fs from "fs";
import path from "path";

const BLOG_PINS_FILE = path.join(
  process.cwd(),
  "content/blog/.pinterest-published.json",
);

export function getPublishedBlogPins(): Record<string, string> {
  try {
    if (!fs.existsSync(BLOG_PINS_FILE)) return {};
    return JSON.parse(fs.readFileSync(BLOG_PINS_FILE, "utf-8"));
  } catch {
    return {};
  }
}

export function markBlogPinPublished(slug: string, pinId: string): void {
  const data = getPublishedBlogPins();
  data[slug] = pinId;
  fs.mkdirSync(path.dirname(BLOG_PINS_FILE), { recursive: true });
  fs.writeFileSync(BLOG_PINS_FILE, JSON.stringify(data, null, 2));
}
