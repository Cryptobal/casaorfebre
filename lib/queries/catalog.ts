import { prisma } from "@/lib/prisma";

export async function getActiveCategories() {
  return prisma.category.findMany({
    where: { isActive: true },
    orderBy: { position: "asc" },
  });
}

export async function getActiveMaterials() {
  return prisma.material.findMany({
    where: { isActive: true },
    orderBy: { position: "asc" },
  });
}

export async function getActiveOccasions() {
  return prisma.occasion.findMany({
    where: { isActive: true },
    orderBy: { position: "asc" },
  });
}

export async function getActiveSpecialties() {
  return prisma.specialty.findMany({
    where: { isActive: true },
    orderBy: { position: "asc" },
  });
}

export async function getAllCategories() {
  return prisma.category.findMany({ orderBy: { position: "asc" } });
}

export async function getAllMaterials() {
  return prisma.material.findMany({ orderBy: { position: "asc" } });
}

export async function getAllOccasions() {
  return prisma.occasion.findMany({ orderBy: { position: "asc" } });
}

export async function getAllSpecialties() {
  return prisma.specialty.findMany({ orderBy: { position: "asc" } });
}
