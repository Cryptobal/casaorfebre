export interface RingSize {
  size: string;
  diameterMm: number;
}

export const RING_SIZES: readonly RingSize[] = [
  { size: "4",  diameterMm: 14.0 },
  { size: "5",  diameterMm: 14.3 },
  { size: "6",  diameterMm: 14.6 },
  { size: "7",  diameterMm: 14.9 },
  { size: "8",  diameterMm: 15.3 },
  { size: "9",  diameterMm: 15.6 },
  { size: "10", diameterMm: 15.9 },
  { size: "11", diameterMm: 16.2 },
  { size: "12", diameterMm: 16.5 },
  { size: "13", diameterMm: 16.8 },
  { size: "14", diameterMm: 17.1 },
  { size: "15", diameterMm: 17.5 },
  { size: "16", diameterMm: 17.8 },
  { size: "17", diameterMm: 18.1 },
  { size: "18", diameterMm: 18.4 },
  { size: "19", diameterMm: 18.8 },
  { size: "20", diameterMm: 19.1 },
  { size: "21", diameterMm: 19.4 },
  { size: "22", diameterMm: 19.7 },
  { size: "23", diameterMm: 20.0 },
  { size: "24", diameterMm: 20.3 },
  { size: "25", diameterMm: 20.7 },
  { size: "26", diameterMm: 21.0 },
  { size: "27", diameterMm: 21.3 },
] as const;

export const RING_SIZE_VALUES: readonly string[] = RING_SIZES.map((r) => r.size);

export function isValidRingSize(value: string): boolean {
  return RING_SIZE_VALUES.includes(value.trim());
}

export function ringDiameterMm(size: string): number | null {
  const entry = RING_SIZES.find((r) => r.size === size.trim());
  return entry?.diameterMm ?? null;
}
