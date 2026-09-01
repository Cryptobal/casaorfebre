import { prisma } from "@/lib/prisma";
import {
  emptyConcepts,
  HOME_DEFAULT_MANIFESTO,
  HOME_DEFAULTS,
  splitManifesto,
  suggestedGalleryCaption,
  type HomeConcept,
} from "@/lib/home-defaults";
import { GALLERY_IMAGES, type GalleryImage } from "@/lib/site-config";

export type StoredHomeTexts = {
  heroPhrase: string | null;
  manifesto: string | null;
  concepts: HomeConcept[];
  galleryIntro: string | null;
  contactInstagramText: string | null;
  contactWhatsappText: string | null;
};

export type ResolvedHomeContent = {
  heroPhrase: string;
  manifestoLead: string;
  manifestoParagraphs: string[];
  manifesto: string;
  concepts: HomeConcept[];
  galleryIntro: string;
  contactInstagramText: string;
  contactWhatsappText: string;
  gallery: GalleryImage[];
};

export type AdminHomeGalleryImage = {
  id: string;
  url: string;
  caption: string | null;
  sortOrder: number;
  focalX: number;
  focalY: number;
  zoom: number;
  productImageId: string | null;
};

export type GalleryProductPhoto = {
  id: string;
  url: string;
  productName: string;
  suggestedCaption: string;
  inGallery: boolean;
};

const FALLBACK_LAYOUT: Pick<GalleryImage, "aspectClass" | "offsetClass"> = {
  aspectClass: "aspect-[3/4]",
};

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function readConceptField(
  item: Record<string, unknown>,
  keys: string[]
): string {
  for (const key of keys) {
    const value = item[key];
    if (typeof value === "string") return value;
  }
  return "";
}

/** Slots for the admin form: stored strings, empty if the field is unused. */
export function parseStoredConcepts(json: unknown): HomeConcept[] {
  const slots = emptyConcepts();
  if (!Array.isArray(json)) return slots;

  return slots.map((slot, index) => {
    const item = asRecord(json[index]);
    if (!item) return slot;
    return {
      title: readConceptField(item, ["title"]),
      text: readConceptField(item, ["text", "body"]),
    };
  });
}

/** Public merge: corrupt or empty slots fall back to HOME_DEFAULTS. */
export function resolveConcepts(json: unknown): HomeConcept[] {
  const stored = parseStoredConcepts(json);
  return HOME_DEFAULTS.concepts.map((fallback, index) => {
    const slot = stored[index];
    return {
      title: slot.title.trim() || fallback.title,
      text: slot.text.trim() || fallback.text,
    };
  });
}

function fallback<T extends string>(value: string | null | undefined, def: T): string {
  const trimmed = value?.trim();
  return trimmed ? trimmed : def;
}

function layoutForIndex(
  index: number
): Pick<GalleryImage, "aspectClass" | "offsetClass"> {
  if (GALLERY_IMAGES.length === 0) return FALLBACK_LAYOUT;
  const layout = GALLERY_IMAGES[index % GALLERY_IMAGES.length];
  return {
    aspectClass: layout.aspectClass,
    offsetClass: layout.offsetClass,
  };
}

function mapDbGallery(images: AdminHomeGalleryImage[]): GalleryImage[] {
  return images.map((image, index) => {
    const layout = layoutForIndex(index);
    const caption = image.caption?.trim() ?? "";
    return {
      id: image.id,
      src: image.url,
      alt: caption || "Pieza de joyería",
      caption,
      aspectClass: layout.aspectClass,
      offsetClass: layout.offsetClass,
      focalX: image.focalX,
      focalY: image.focalY,
      zoom: image.zoom,
    };
  });
}

function emptyResolved(): ResolvedHomeContent {
  return {
    heroPhrase: HOME_DEFAULTS.heroPhrase,
    manifestoLead: HOME_DEFAULTS.manifestoLead,
    manifestoParagraphs: [...HOME_DEFAULTS.manifestoParagraphs],
    manifesto: HOME_DEFAULT_MANIFESTO,
    concepts: HOME_DEFAULTS.concepts.map((c) => ({ title: c.title, text: c.text })),
    galleryIntro: HOME_DEFAULTS.galleryIntro,
    contactInstagramText: HOME_DEFAULTS.contactInstagramText,
    contactWhatsappText: HOME_DEFAULTS.contactWhatsappText,
    gallery: [],
  };
}

export function mergeHomeContent(
  stored: {
    heroPhrase: string | null;
    manifesto: string | null;
    concepts: unknown;
    galleryIntro: string | null;
    contactInstagramText: string | null;
    contactWhatsappText: string | null;
  } | null,
  images: AdminHomeGalleryImage[]
): ResolvedHomeContent {
  const manifesto = fallback(stored?.manifesto, HOME_DEFAULT_MANIFESTO);
  const { lead, paragraphs } = splitManifesto(manifesto);

  return {
    heroPhrase: fallback(stored?.heroPhrase, HOME_DEFAULTS.heroPhrase),
    manifestoLead: lead,
    manifestoParagraphs: paragraphs,
    manifesto,
    concepts: resolveConcepts(stored?.concepts),
    galleryIntro: fallback(stored?.galleryIntro, HOME_DEFAULTS.galleryIntro),
    contactInstagramText: fallback(
      stored?.contactInstagramText,
      HOME_DEFAULTS.contactInstagramText
    ),
    contactWhatsappText: fallback(
      stored?.contactWhatsappText,
      HOME_DEFAULTS.contactWhatsappText
    ),
    gallery: mapDbGallery(images),
  };
}

export async function getHomeGalleryImages(): Promise<AdminHomeGalleryImage[]> {
  try {
    return await prisma.homeGalleryImage.findMany({
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        url: true,
        caption: true,
        sortOrder: true,
        focalX: true,
        focalY: true,
        zoom: true,
        productImageId: true,
      },
    });
  } catch (error) {
    console.error("[home-content] Failed to load gallery images:", error);
    return [];
  }
}

export async function getStoredHomeTexts(): Promise<StoredHomeTexts> {
  try {
    const row = await prisma.homeContent.findUnique({
      where: { id: "home" },
    });
    if (!row) {
      return {
        heroPhrase: null,
        manifesto: null,
        concepts: emptyConcepts(),
        galleryIntro: null,
        contactInstagramText: null,
        contactWhatsappText: null,
      };
    }
    return {
      heroPhrase: row.heroPhrase,
      manifesto: row.manifesto,
      concepts: parseStoredConcepts(row.concepts),
      galleryIntro: row.galleryIntro,
      contactInstagramText: row.contactInstagramText,
      contactWhatsappText: row.contactWhatsappText,
    };
  } catch (error) {
    console.error("[home-content] Failed to load stored texts:", error);
    return {
      heroPhrase: null,
      manifesto: null,
      concepts: emptyConcepts(),
      galleryIntro: null,
      contactInstagramText: null,
      contactWhatsappText: null,
    };
  }
}

export async function getHomeContent(): Promise<ResolvedHomeContent> {
  const admin = await getAdminHomeContent();
  return admin.resolved;
}

export async function getAdminHomeContent(): Promise<{
  stored: StoredHomeTexts;
  resolved: ResolvedHomeContent;
  images: AdminHomeGalleryImage[];
}> {
  try {
    const [row, images] = await Promise.all([
      prisma.homeContent.findUnique({ where: { id: "home" } }),
      getHomeGalleryImages(),
    ]);
    return {
      stored: row
        ? {
            heroPhrase: row.heroPhrase,
            manifesto: row.manifesto,
            concepts: parseStoredConcepts(row.concepts),
            galleryIntro: row.galleryIntro,
            contactInstagramText: row.contactInstagramText,
            contactWhatsappText: row.contactWhatsappText,
          }
        : {
            heroPhrase: null,
            manifesto: null,
            concepts: emptyConcepts(),
            galleryIntro: null,
            contactInstagramText: null,
            contactWhatsappText: null,
          },
      resolved: mergeHomeContent(row, images),
      images,
    };
  } catch (error) {
    console.error("[home-content] Falling back to HOME_DEFAULTS:", error);
    return {
      stored: {
        heroPhrase: null,
        manifesto: null,
        concepts: emptyConcepts(),
        galleryIntro: null,
        contactInstagramText: null,
        contactWhatsappText: null,
      },
      resolved: emptyResolved(),
      images: [],
    };
  }
}

export async function getProductPhotosForGallery(): Promise<GalleryProductPhoto[]> {
  try {
    const [photos, used] = await Promise.all([
      prisma.productImage.findMany({
        where: { status: "APPROVED" },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          url: true,
          product: {
            select: {
              name: true,
              materials: { select: { name: true }, orderBy: { position: "asc" } },
            },
          },
        },
      }),
      prisma.homeGalleryImage.findMany({
        where: { productImageId: { not: null } },
        select: { productImageId: true },
      }),
    ]);

    const usedIds = new Set(
      used
        .map((row) => row.productImageId)
        .filter((id): id is string => Boolean(id))
    );

    return photos.map((photo) => ({
      id: photo.id,
      url: photo.url,
      productName: photo.product.name,
      suggestedCaption: suggestedGalleryCaption(
        photo.product.materials.map((material) => material.name),
        photo.product.name
      ),
      inGallery: usedIds.has(photo.id),
    }));
  } catch (error) {
    console.error("[home-content] Failed to load product photos:", error);
    return [];
  }
}
