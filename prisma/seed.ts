import { config } from "dotenv";
import path from "path";

// Load env.local (project root) before instantiating PrismaClient
config({ path: path.resolve(process.cwd(), "env.local") });

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  // ─── Admin Users ───
  const adminCarlos = await prisma.user.upsert({
    where: { email: "carlos.irigoyen@gmail.com" },
    update: { role: "ADMIN" },
    create: {
      email: "carlos.irigoyen@gmail.com",
      name: "Carlos Irigoyen",
      role: "ADMIN",
    },
  });

  const adminCamila = await prisma.user.upsert({
    where: { email: "camilatorrespuga@gmail.com" },
    update: { role: "ADMIN" },
    create: {
      email: "camilatorrespuga@gmail.com",
      name: "Camila Torres",
      role: "ADMIN",
    },
  });

  console.log(`✅ Admin users: ${adminCarlos.email}, ${adminCamila.email}`);

  // ─── Demo Artisan Users ───
  const hashedPassword = await bcrypt.hash("orfebre123", 12);

  const userValentina = await prisma.user.upsert({
    where: { email: "valentina@demo.casaorfebre.cl" },
    update: {},
    create: {
      email: "valentina@demo.casaorfebre.cl",
      name: "Valentina Ríos",
      hashedPassword,
      role: "ARTISAN",
    },
  });

  const userMatias = await prisma.user.upsert({
    where: { email: "matias@demo.casaorfebre.cl" },
    update: {},
    create: {
      email: "matias@demo.casaorfebre.cl",
      name: "Matías Sepúlveda",
      hashedPassword,
      role: "ARTISAN",
    },
  });

  const userIsidora = await prisma.user.upsert({
    where: { email: "isidora@demo.casaorfebre.cl" },
    update: {},
    create: {
      email: "isidora@demo.casaorfebre.cl",
      name: "Isidora Navarrete",
      hashedPassword,
      role: "ARTISAN",
    },
  });

  // ─── Artisan Profiles ───
  const artisanValentina = await prisma.artisan.upsert({
    where: { userId: userValentina.id },
    update: {},
    create: {
      userId: userValentina.id,
      slug: "valentina-rios",
      displayName: "Valentina Ríos",
      bio: "Orfebre autodidacta de Valparaíso. Trabajo con plata reciclada y piedras encontradas en la costa chilena. Cada pieza es un fragmento del paisaje porteño.",
      story: "Empecé a trabajar la plata a los 22 años, después de encontrar un anillo oxidado en la playa de Reñaca. Ese hallazgo despertó algo en mí. Hoy, cada pieza que creo lleva un trozo de costa.",
      location: "Valparaíso",
      specialty: "Plata & Piedras Costeras",
      materials: ["Plata 950", "Cobre", "Piedras de mar", "Cuarzo"],
      status: "APPROVED",
      approvedAt: new Date(),
      commissionRate: 0.18,
    },
  });

  const artisanMatias = await prisma.artisan.upsert({
    where: { userId: userMatias.id },
    update: {},
    create: {
      userId: userMatias.id,
      slug: "matias-sepulveda",
      displayName: "Matías Sepúlveda",
      bio: "Joyero de Santiago especializado en técnicas ancestrales mapuche. Fusiono la tradición con el diseño contemporáneo usando plata y cobre.",
      story: "Aprendí orfebrería de mi abuela en Temuco. Ella me enseñó el trarilonko y el trapelacucha. Hoy reinterpreto esos símbolos para una generación que busca identidad en lo que lleva puesto.",
      location: "Santiago",
      specialty: "Joyería Mapuche Contemporánea",
      materials: ["Plata 950", "Cobre", "Bronce", "Lapislázuli"],
      status: "APPROVED",
      approvedAt: new Date(),
      commissionRate: 0.18,
    },
  });

  const artisanIsidora = await prisma.artisan.upsert({
    where: { userId: userIsidora.id },
    update: {},
    create: {
      userId: userIsidora.id,
      slug: "isidora-navarrete",
      displayName: "Isidora Navarrete",
      bio: "Diseñadora de joyas en oro y piedras semipreciosas. Mi trabajo se inspira en la flora nativa del sur de Chile: copihues, araucarias, helechos.",
      story: "Estudié diseño en la UC y luego me formé en orfebrería en Florencia. Volví a Chile con la misión de crear alta joyería que cuente nuestra historia botánica.",
      location: "Pucón",
      specialty: "Alta Joyería Botánica",
      materials: ["Oro 18k", "Plata 950", "Amatista", "Turmalina", "Esmeralda"],
      status: "APPROVED",
      approvedAt: new Date(),
      commissionRate: 0.15,
    },
  });

  console.log(`✅ Artisans: ${artisanValentina.displayName}, ${artisanMatias.displayName}, ${artisanIsidora.displayName}`);

  // ─── Demo Products ───
  const products = [
    {
      artisanId: artisanValentina.id,
      slug: "aros-ola-de-plata",
      name: "Aros Ola de Plata",
      description: "Aros colgantes inspirados en las olas de Valparaíso. Plata 950 texturizada a mano con acabado mate. Cierre de gancho.",
      story: "Estos aros nacieron una mañana de invierno mirando las olas romper en el muelle Barón.",
      price: 67000,
      category: "AROS" as const,
      materials: ["Plata 950"],
      technique: "Texturizado a martillo",
      dimensions: "4.5 x 1.8 cm",
      weight: 8.5,
      isUnique: true,
      stock: 1,
      status: "APPROVED" as const,
      publishedAt: new Date(),
    },
    {
      artisanId: artisanValentina.id,
      slug: "collar-costa-brava",
      name: "Collar Costa Brava",
      description: "Collar con dije de plata y piedra de mar verde encontrada en la costa de Quintay. Cadena de plata 950 de 45 cm.",
      price: 89000,
      category: "COLLAR" as const,
      materials: ["Plata 950", "Piedra de mar"],
      technique: "Engaste en bisel",
      dimensions: "Dije: 2.5 x 1.5 cm",
      weight: 12.0,
      isUnique: true,
      stock: 1,
      status: "APPROVED" as const,
      publishedAt: new Date(),
    },
    {
      artisanId: artisanMatias.id,
      slug: "anillo-trapelacucha",
      name: "Anillo Trapelacucha",
      description: "Anillo ancho en plata 950 con grabado de trapelacucha. Diseño contemporáneo que honra la tradición.",
      story: "El trapelacucha es símbolo de fertilidad y protección. Lo reinterpreté en un anillo que puedes llevar todos los días.",
      price: 54000,
      category: "ANILLO" as const,
      materials: ["Plata 950"],
      technique: "Grabado y calado",
      dimensions: "Talla ajustable 14-18",
      weight: 10.0,
      isUnique: false,
      editionSize: 10,
      stock: 7,
      status: "APPROVED" as const,
      publishedAt: new Date(),
    },
    {
      artisanId: artisanMatias.id,
      slug: "pulsera-kultrung",
      name: "Pulsera Kultrun",
      description: "Pulsera rígida en cobre con diseño del kultrun. Acabado oxidado y pulido selectivo.",
      price: 42000,
      category: "PULSERA" as const,
      materials: ["Cobre", "Bronce"],
      technique: "Repujado",
      dimensions: "Diámetro interno: 6.5 cm",
      weight: 25.0,
      isUnique: false,
      editionSize: 5,
      stock: 3,
      status: "APPROVED" as const,
      publishedAt: new Date(),
    },
    {
      artisanId: artisanMatias.id,
      slug: "aros-pewma",
      name: "Aros Pewma",
      description: "Aros circulares en plata y cobre. \"Pewma\" significa sueño en mapudungun. Diseño geométrico con acabado satinado.",
      price: 38000,
      category: "AROS" as const,
      materials: ["Plata 950", "Cobre"],
      technique: "Soldadura y pulido",
      dimensions: "2.2 cm diámetro",
      weight: 6.0,
      isUnique: false,
      editionSize: 15,
      stock: 11,
      status: "APPROVED" as const,
      publishedAt: new Date(),
    },
    {
      artisanId: artisanIsidora.id,
      slug: "collar-copihue-oro",
      name: "Collar Copihue en Oro",
      description: "Collar con dije de copihue tallado en oro 18k con centro de rubí. Cadena de oro de 42 cm con extensión de 5 cm.",
      story: "El copihue es la flor nacional de Chile. Lo tallé en oro para que dure tanto como su belleza en la naturaleza.",
      price: 320000,
      category: "COLLAR" as const,
      materials: ["Oro 18k", "Rubí"],
      technique: "Tallado en cera perdida",
      dimensions: "Dije: 3.0 x 1.8 cm",
      weight: 6.5,
      isUnique: true,
      stock: 1,
      status: "APPROVED" as const,
      publishedAt: new Date(),
    },
    {
      artisanId: artisanIsidora.id,
      slug: "anillo-araucaria",
      name: "Anillo Araucaria",
      description: "Anillo en plata 950 con textura de corteza de araucaria y engaste de amatista oval. Pieza única.",
      price: 145000,
      category: "ANILLO" as const,
      materials: ["Plata 950", "Amatista"],
      technique: "Texturizado orgánico y engaste",
      dimensions: "Talla 12",
      weight: 9.0,
      isUnique: true,
      stock: 1,
      status: "APPROVED" as const,
      publishedAt: new Date(),
    },
    {
      artisanId: artisanIsidora.id,
      slug: "broche-helecho-austral",
      name: "Broche Helecho Austral",
      description: "Broche en forma de helecho en plata con baño de oro. Detalle de turmalina verde en la base.",
      price: 78000,
      category: "BROCHE" as const,
      materials: ["Plata 950", "Baño de oro", "Turmalina"],
      technique: "Calado y baño galvánico",
      dimensions: "5.5 x 2.0 cm",
      weight: 7.5,
      isUnique: true,
      stock: 1,
      status: "APPROVED" as const,
      publishedAt: new Date(),
    },
    {
      artisanId: artisanValentina.id,
      slug: "colgante-luna-portena",
      name: "Colgante Luna Porteña",
      description: "Colgante de media luna en plata 950 con textura de arena. Incluye cadena de 50 cm.",
      price: 52000,
      category: "COLGANTE" as const,
      materials: ["Plata 950"],
      technique: "Fundición y texturizado",
      dimensions: "3.0 x 2.0 cm",
      weight: 11.0,
      isUnique: false,
      editionSize: 8,
      stock: 5,
      status: "APPROVED" as const,
      publishedAt: new Date(),
    },
    {
      artisanId: artisanIsidora.id,
      slug: "aros-canelo-sagrado",
      name: "Aros Canelo Sagrado",
      description: "Aros largos inspirados en las hojas del canelo. Plata 950 con acabado espejo y esmeralda diminuta.",
      price: 185000,
      category: "AROS" as const,
      materials: ["Plata 950", "Esmeralda"],
      technique: "Laminado y engaste",
      dimensions: "5.0 x 1.2 cm",
      weight: 7.0,
      isUnique: true,
      stock: 1,
      isCustomMade: true,
      status: "APPROVED" as const,
      publishedAt: new Date(),
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: product,
    });
  }

  console.log(`✅ Products: ${products.length} created`);

  // ─── Demo Buyer ───
  await prisma.user.upsert({
    where: { email: "comprador@demo.casaorfebre.cl" },
    update: {},
    create: {
      email: "comprador@demo.casaorfebre.cl",
      name: "María González",
      hashedPassword,
      role: "BUYER",
    },
  });

  console.log("✅ Demo buyer created");
  console.log("🌱 Seed complete!");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
