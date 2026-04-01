import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";

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
  private baseUrl = "https://api.pinterest.com/v5";

  /** Get token from DB first, fallback to env var */
  private async getAccessToken(): Promise<string> {
    try {
      const setting = await prisma.systemSetting.findUnique({
        where: { key: "PINTEREST_ACCESS_TOKEN" },
      });
      if (setting) return setting.value;
    } catch {
      // DB not available, fall back to env
    }
    return process.env.PINTEREST_ACCESS_TOKEN || "";
  }

  /** Refresh access token using refresh token */
  async refreshToken(): Promise<boolean> {
    const appId = process.env.PINTEREST_APP_ID;
    const appSecret = process.env.PINTEREST_APP_SECRET;
    if (!appId || !appSecret) {
      console.error("[Pinterest] Cannot refresh: APP_ID/APP_SECRET not set");
      return false;
    }

    // Get refresh token from DB or env
    let refreshToken = process.env.PINTEREST_REFRESH_TOKEN || "";
    try {
      const setting = await prisma.systemSetting.findUnique({
        where: { key: "PINTEREST_REFRESH_TOKEN" },
      });
      if (setting) refreshToken = setting.value;
    } catch {
      // use env fallback
    }

    if (!refreshToken) {
      console.error("[Pinterest] Cannot refresh: no refresh token");
      return false;
    }

    try {
      const credentials = Buffer.from(`${appId}:${appSecret}`).toString("base64");
      const res = await fetch(`${this.baseUrl}/oauth/token`, {
        method: "POST",
        headers: {
          Authorization: `Basic ${credentials}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "refresh_token",
          refresh_token: refreshToken,
        }),
      });

      if (!res.ok) {
        const body = await res.text();
        console.error(`[Pinterest] Token refresh failed: ${res.status} ${body}`);
        return false;
      }

      const data = await res.json();

      await prisma.systemSetting.upsert({
        where: { key: "PINTEREST_ACCESS_TOKEN" },
        update: { value: data.access_token },
        create: { key: "PINTEREST_ACCESS_TOKEN", value: data.access_token },
      });

      if (data.refresh_token) {
        await prisma.systemSetting.upsert({
          where: { key: "PINTEREST_REFRESH_TOKEN" },
          update: { value: data.refresh_token },
          create: { key: "PINTEREST_REFRESH_TOKEN", value: data.refresh_token },
        });
      }

      console.log("[Pinterest] Token refrescado exitosamente");
      return true;
    } catch (error) {
      console.error("[Pinterest] Token refresh error:", error);
      return false;
    }
  }

  /** Make an authenticated request, auto-retry on 401 */
  private async request(
    url: string,
    init?: RequestInit,
  ): Promise<Response | null> {
    const token = await this.getAccessToken();
    if (!token) return null;

    const headers = {
      ...((init?.headers as Record<string, string>) || {}),
      Authorization: `Bearer ${token}`,
    };

    try {
      let res = await fetch(url, { ...init, headers });

      if (res.status === 401) {
        const refreshed = await this.refreshToken();
        if (refreshed) {
          const newToken = await this.getAccessToken();
          headers.Authorization = `Bearer ${newToken}`;
          res = await fetch(url, { ...init, headers });
        }
      }

      return res;
    } catch (error) {
      console.error("[Pinterest] request error:", error);
      return null;
    }
  }

  async createPin(pin: PinterestPin): Promise<{ id: string } | null> {
    const res = await this.request(`${this.baseUrl}/pins`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(pin),
    });

    if (!res || !res.ok) {
      if (res) {
        const body = await res.text();
        console.error(`[Pinterest] createPin failed: ${res.status} ${body}`);
      }
      return null;
    }

    const data = await res.json();
    return { id: data.id };
  }

  async getPinAnalytics(
    pinId: string,
    startDate: string,
    endDate: string,
  ): Promise<unknown> {
    const params = new URLSearchParams({
      start_date: startDate,
      end_date: endDate,
      metric_types: "IMPRESSION,SAVE,PIN_CLICK",
    });
    const res = await this.request(
      `${this.baseUrl}/pins/${pinId}/analytics?${params}`,
    );
    if (!res || !res.ok) return null;
    return res.json();
  }

  async getBoardPins(boardId: string, pageSize = 25): Promise<unknown[]> {
    const res = await this.request(
      `${this.baseUrl}/boards/${boardId}/pins?page_size=${pageSize}`,
    );
    if (!res || !res.ok) return [];
    const data = await res.json();
    return data.items ?? [];
  }

  /** Verify current token is valid */
  async verifyToken(): Promise<boolean> {
    const res = await this.request(`${this.baseUrl}/user_account`);
    return res !== null && res.ok;
  }
}

export const pinterestClient = new PinterestClient();

// ── Blog pin tracking (JSON file) ──

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
