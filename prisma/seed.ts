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

  // ─── Membership Plans ───
  const planEsencial = await prisma.membershipPlan.upsert({
    where: { name: "esencial" },
    update: {},
    create: {
      name: "esencial",
      price: 0,
      annualPrice: null,
      commissionRate: 0.18,
      features: ["10 productos activos", "3 fotos por pieza", "Soporte email", "Pago quincenal"],
      maxProducts: 10,
      maxPhotosPerProduct: 3,
      videoEnabled: false,
      badgeText: null,
      badgeType: null,
      searchWeight: 1.0,
      payoutFrequency: "quincenal",
      socialPostsPerMonth: 0,
      supportLevel: "email",
      hasCertificate: false,
      homeHighlight: false,
      hasBasicStats: false,
      hasAdvancedStats: false,
    },
  });

  const planArtesano = await prisma.membershipPlan.upsert({
    where: { name: "artesano" },
    update: {},
    create: {
      name: "artesano",
      price: 19990,
      annualPrice: 199990,
      commissionRate: 0.12,
      features: [
        "40 productos activos",
        "6 fotos por pieza",
        "Badge Artesano Verificado",
        "Estadísticas básicas",
        "Certificado de autenticidad",
        "Prioridad en búsqueda (1.5x)",
        "Soporte chat",
        "Pago semanal",
        "1 post redes sociales/mes",
      ],
      maxProducts: 40,
      maxPhotosPerProduct: 6,
      videoEnabled: false,
      badgeText: "Artesano Verificado",
      badgeType: "verificado",
      searchWeight: 1.5,
      payoutFrequency: "semanal",
      socialPostsPerMonth: 1,
      supportLevel: "chat",
      hasCertificate: true,
      homeHighlight: false,
      hasBasicStats: true,
      hasAdvancedStats: false,
    },
  });

  const planMaestro = await prisma.membershipPlan.upsert({
    where: { name: "maestro" },
    update: {},
    create: {
      name: "maestro",
      price: 49990,
      annualPrice: 499990,
      commissionRate: 0.09,
      features: [
        "Productos ilimitados",
        "Fotos ilimitadas por pieza",
        "Video por pieza",
        "Badge Maestro Orfebre",
        "Estadísticas avanzadas",
        "Certificado de autenticidad",
        "Destaque en home",
        "Máxima prioridad búsqueda (2x)",
        "Soporte dedicado",
        "Pago en 48h",
        "4 posts redes sociales/mes",
      ],
      maxProducts: 0,
      maxPhotosPerProduct: 0,
      videoEnabled: true,
      badgeText: "Maestro Orfebre",
      badgeType: "maestro",
      searchWeight: 2.0,
      payoutFrequency: "48h",
      socialPostsPerMonth: 4,
      supportLevel: "dedicado",
      hasCertificate: true,
      homeHighlight: true,
      hasBasicStats: true,
      hasAdvancedStats: true,
    },
  });

  console.log(`✅ Membership Plans: ${planEsencial.name}, ${planArtesano.name}, ${planMaestro.name}`);

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

  const userFrancisca = await prisma.user.upsert({
    where: { email: "francisca@demo.casaorfebre.cl" },
    update: {},
    create: {
      email: "francisca@demo.casaorfebre.cl",
      name: "Francisca Alvarado",
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
      story:
        "Empecé a trabajar la plata a los 22 años, después de encontrar un anillo oxidado en la playa de Reñaca. Ese hallazgo despertó algo en mí. Hoy, cada pieza que creo lleva un trozo de costa.",
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
      story:
        "Aprendí orfebrería de mi abuela en Temuco. Ella me enseñó el trarilonko y el trapelacucha. Hoy reinterpreto esos símbolos para una generación que busca identidad en lo que lleva puesto.",
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
      story:
        "Estudié diseño en la UC y luego me formé en orfebrería en Florencia. Volví a Chile con la misión de crear alta joyería que cuente nuestra historia botánica.",
      location: "Pucón",
      specialty: "Alta Joyería Botánica",
      materials: ["Oro 18k", "Plata 950", "Amatista", "Turmalina", "Esmeralda"],
      status: "APPROVED",
      approvedAt: new Date(),
      commissionRate: 0.15,
    },
  });

  const artisanFrancisca = await prisma.artisan.upsert({
    where: { userId: userFrancisca.id },
    update: {},
    create: {
      userId: userFrancisca.id,
      slug: "francisca-alvarado",
      displayName: "Francisca Alvarado",
      bio: "Artesana de Limache dedicada al cobre y materiales orgánicos. Creo joyería que respira naturaleza: semillas, maderas nativas y fibras vegetales se mezclan con metales trabajados a fuego.",
      story:
        "Crecí rodeada del campo en el Valle de Limache. Mi abuelo era herrero y de él heredé el amor por el fuego y el metal. Cada pieza que hago es un homenaje a esa vida sencilla y conectada con la tierra.",
      location: "Limache",
      specialty: "Joyería Orgánica en Cobre",
      materials: ["Cobre", "Bronce", "Semillas nativas", "Madera de lenga"],
      status: "APPROVED",
      approvedAt: new Date(),
      commissionRate: 0.2,
    },
  });

  console.log(
    `✅ Artisans: ${artisanValentina.displayName}, ${artisanMatias.displayName}, ${artisanIsidora.displayName}, ${artisanFrancisca.displayName}`
  );

  // ─── Demo Products (15) ───
  const products = [
    // Valentina Ríos — 4 products
    {
      artisanId: artisanValentina.id,
      slug: "aros-ola-de-plata",
      name: "Aros Ola de Plata",
      description:
        "Aros colgantes inspirados en las olas de Valparaíso. Plata 950 texturizada a mano con acabado mate. Cierre de gancho.",
      story:
        "Estos aros nacieron una mañana de invierno mirando las olas romper en el muelle Barón.",
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
      description:
        "Collar con dije de plata y piedra de mar verde encontrada en la costa de Quintay. Cadena de plata 950 de 45 cm.",
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
      artisanId: artisanValentina.id,
      slug: "colgante-luna-portena",
      name: "Colgante Luna Porteña",
      description:
        "Colgante de media luna en plata 950 con textura de arena. Incluye cadena de 50 cm.",
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
      artisanId: artisanValentina.id,
      slug: "anillo-marejada",
      name: "Anillo Marejada",
      description:
        "Anillo abierto en plata 950 con forma de ola envolvente. Acabado pulido espejo en la cresta y mate en la base. Ajustable.",
      story:
        "Diseñé este anillo después de una tormenta costera en Quintay. La fuerza del mar quedó atrapada en la plata.",
      price: 45000,
      category: "ANILLO" as const,
      materials: ["Plata 950"],
      technique: "Forjado a mano",
      dimensions: "Talla ajustable 12-16",
      weight: 7.0,
      isUnique: false,
      editionSize: 12,
      stock: 9,
      status: "APPROVED" as const,
      publishedAt: new Date(),
    },

    // Matías Sepúlveda — 4 products
    {
      artisanId: artisanMatias.id,
      slug: "anillo-trapelacucha",
      name: "Anillo Trapelacucha",
      description:
        "Anillo ancho en plata 950 con grabado de trapelacucha. Diseño contemporáneo que honra la tradición.",
      story:
        "El trapelacucha es símbolo de fertilidad y protección. Lo reinterpreté en un anillo que puedes llevar todos los días.",
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
      description:
        "Pulsera rígida en cobre con diseño del kultrun. Acabado oxidado y pulido selectivo.",
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
      description:
        'Aros circulares en plata y cobre. "Pewma" significa sueño en mapudungun. Diseño geométrico con acabado satinado.',
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
      artisanId: artisanMatias.id,
      slug: "collar-rewe-lapislazuli",
      name: "Collar Rewe con Lapislázuli",
      description:
        "Collar con colgante en forma de rewe tallado en plata 950 con cabujón de lapislázuli chileno. Cadena de 48 cm.",
      story:
        "El rewe es el altar sagrado mapuche. Este collar lleva un fragmento de lapislázuli del norte, uniendo dos mundos del territorio chileno.",
      price: 125000,
      category: "COLLAR" as const,
      materials: ["Plata 950", "Lapislázuli"],
      technique: "Cera perdida y engaste",
      dimensions: "Dije: 3.5 x 2.0 cm",
      weight: 14.0,
      isUnique: true,
      stock: 1,
      isCustomMade: true,
      status: "APPROVED" as const,
      publishedAt: new Date(),
    },

    // Isidora Navarrete — 4 products
    {
      artisanId: artisanIsidora.id,
      slug: "collar-copihue-oro",
      name: "Collar Copihue en Oro",
      description:
        "Collar con dije de copihue tallado en oro 18k con centro de rubí. Cadena de oro de 42 cm con extensión de 5 cm.",
      story:
        "El copihue es la flor nacional de Chile. Lo tallé en oro para que dure tanto como su belleza en la naturaleza.",
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
      description:
        "Anillo en plata 950 con textura de corteza de araucaria y engaste de amatista oval. Pieza única.",
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
      description:
        "Broche en forma de helecho en plata con baño de oro. Detalle de turmalina verde en la base.",
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
      artisanId: artisanIsidora.id,
      slug: "aros-canelo-sagrado",
      name: "Aros Canelo Sagrado",
      description:
        "Aros largos inspirados en las hojas del canelo. Plata 950 con acabado espejo y esmeralda diminuta.",
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

    // Francisca Alvarado — 3 products
    {
      artisanId: artisanFrancisca.id,
      slug: "pulsera-raices-de-cobre",
      name: "Pulsera Raíces de Cobre",
      description:
        "Pulsera abierta en cobre forjado con textura de raíces entrelazadas. Acabado oxidado natural que evoluciona con el uso. Cierre magnético oculto.",
      story:
        "Las raíces del boldo que crece junto a mi taller me inspiraron esta pieza. El cobre, como las raíces, cambia y se adapta al entorno.",
      price: 35000,
      category: "PULSERA" as const,
      materials: ["Cobre", "Bronce"],
      technique: "Forjado y oxidación natural",
      dimensions: "Diámetro interno: 6.0 cm",
      weight: 18.0,
      isUnique: false,
      editionSize: 20,
      stock: 14,
      status: "APPROVED" as const,
      publishedAt: new Date(),
    },
    {
      artisanId: artisanFrancisca.id,
      slug: "aros-semilla-nativa",
      name: "Aros Semilla Nativa",
      description:
        "Aros colgantes en cobre con incrustación de semilla de palma chilena encapsulada en resina transparente. Gancho de plata 950.",
      price: 28000,
      category: "AROS" as const,
      materials: ["Cobre", "Semillas nativas", "Plata 950"],
      technique: "Engaste en resina y soldadura",
      dimensions: "3.5 x 1.5 cm",
      weight: 5.5,
      isUnique: false,
      editionSize: 25,
      stock: 18,
      status: "APPROVED" as const,
      publishedAt: new Date(),
    },
    {
      artisanId: artisanFrancisca.id,
      slug: "collar-fuego-y-tierra",
      name: "Collar Fuego y Tierra",
      description:
        "Collar con medallón de cobre y bronce fundidos juntos, creando un patrón único de vetas. Engarzado con trozo de madera de lenga fosilizada. Cadena de cobre de 50 cm.",
      story:
        "Este collar une fuego y tierra: el cobre fundido representa el volcán, y la lenga fosilizada la paciencia del bosque. Cada medallón es irrepetible.",
      price: 58000,
      category: "COLLAR" as const,
      materials: ["Cobre", "Bronce", "Madera de lenga"],
      technique: "Fundición mixta y engaste orgánico",
      dimensions: "Medallón: 4.0 x 3.0 cm",
      weight: 22.0,
      isUnique: true,
      stock: 1,
      isCustomMade: true,
      status: "APPROVED" as const,
      publishedAt: new Date(),
    },
  ];

  const createdProducts: Record<string, string> = {};
  for (const product of products) {
    const created = await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: product,
    });
    createdProducts[product.slug] = created.id;
  }

  console.log(`✅ Products: ${products.length} created`);

  // ─── Demo Buyer ───
  const buyer = await prisma.user.upsert({
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

  // ─── Clean existing questions and reviews before re-seeding ───
  await prisma.productQuestion.deleteMany({});
  await prisma.review.deleteMany({});

  console.log("🗑️  Cleared existing questions and reviews");

  // ─── Product Questions (5) ───
  const questions = [
    {
      productId: createdProducts["collar-costa-brava"],
      userId: buyer.id,
      artisanId: artisanValentina.id,
      question: "¿La piedra de mar es natural o tratada? Me gustaría saber si cambia de color con el tiempo.",
      answer: "Es 100% natural, encontrada en la costa de Quintay. Con el uso puede pulirse levemente, pero mantiene su color verde. Te recomiendo no exponerla a químicos fuertes.",
      answeredAt: new Date(),
      isPublic: true,
    },
    {
      productId: createdProducts["anillo-trapelacucha"],
      userId: buyer.id,
      artisanId: artisanMatias.id,
      question: "¿Es posible grabarlo con una dedicatoria por dentro? Lo quiero para un regalo.",
      answer: "¡Por supuesto! Puedo grabar hasta 20 caracteres en el interior del anillo. Escríbeme por mensaje directo con el texto y lo coordino contigo.",
      answeredAt: new Date(),
      isPublic: true,
    },
    {
      productId: createdProducts["collar-copihue-oro"],
      userId: buyer.id,
      artisanId: artisanIsidora.id,
      question: "¿El rubí es natural o sintético? ¿Viene con algún certificado de autenticidad?",
      answer: "Es un rubí natural de talla cabujón. Cada pieza de alta joyería incluye certificado de autenticidad con detalle de materiales y técnica.",
      answeredAt: new Date(),
      isPublic: true,
    },
    {
      productId: createdProducts["pulsera-raices-de-cobre"],
      userId: buyer.id,
      artisanId: artisanFrancisca.id,
      question: "¿El cobre deja marca verde en la piel? Tengo piel sensible y me preocupa.",
      answer: null,
      answeredAt: null,
      isPublic: true,
    },
    {
      productId: createdProducts["aros-canelo-sagrado"],
      userId: buyer.id,
      artisanId: artisanIsidora.id,
      question: "¿Cuánto demora el proceso de fabricación a pedido? Necesito los aros para un evento en 3 semanas.",
      answer: null,
      answeredAt: null,
      isPublic: true,
    },
  ];

  for (const q of questions) {
    await prisma.productQuestion.create({ data: q });
  }

  console.log(`✅ Questions: ${questions.length} created`);

  // ─── Reviews (4) ───
  const reviews = [
    {
      productId: createdProducts["aros-ola-de-plata"],
      artisanId: artisanValentina.id,
      userId: buyer.id,
      rating: 5,
      comment:
        "Los aros son preciosos. La textura del martillo les da un brillo único. Se nota que están hechos con mucho cariño. Los uso casi todos los días.",
      images: [],
      isVerified: true,
    },
    {
      productId: createdProducts["anillo-trapelacucha"],
      artisanId: artisanMatias.id,
      userId: buyer.id,
      rating: 5,
      comment:
        "Increíble trabajo. El grabado del trapelacucha es finísimo y el anillo se siente muy sólido. Matías incluso me envió una nota explicando el significado cultural. 10/10.",
      images: [],
      isVerified: true,
    },
    {
      productId: createdProducts["broche-helecho-austral"],
      artisanId: artisanIsidora.id,
      userId: buyer.id,
      rating: 4,
      comment:
        "El broche es hermoso, el detalle del helecho es impresionante. Le doy 4 estrellas solo porque el cierre podría ser un poco más firme, pero la pieza en sí es una obra de arte.",
      images: [],
      isVerified: true,
    },
    {
      productId: createdProducts["aros-semilla-nativa"],
      artisanId: artisanFrancisca.id,
      userId: buyer.id,
      rating: 4,
      comment:
        "Me encantan estos aros. La combinación de cobre con la semilla encapsulada es muy original. Son livianos y cómodos para uso diario. Muy contenta con mi compra.",
      images: [],
      isVerified: true,
    },
  ];

  for (const r of reviews) {
    await prisma.review.create({ data: r });
  }

  console.log(`✅ Reviews: ${reviews.length} created`);

  // ─── Occasions ───
  const occasionData = [
    { name: "Uso diario", slug: "uso-diario" },
    { name: "Regalo", slug: "regalo" },
    { name: "Cumpleaños", slug: "cumpleanos" },
    { name: "Aniversario", slug: "aniversario" },
    { name: "Compromiso", slug: "compromiso" },
    { name: "Matrimonio", slug: "matrimonio" },
    { name: "Autoregalo", slug: "autoregalo" },
    { name: "Amistad", slug: "amistad" },
    { name: "Graduación", slug: "graduacion" },
    { name: "Nacimiento / Maternidad", slug: "nacimiento" },
    { name: "Protección / Amuleto", slug: "proteccion" },
    { name: "Significado especial", slug: "significado-especial" },
  ];

  for (let i = 0; i < occasionData.length; i++) {
    await prisma.occasion.upsert({
      where: { slug: occasionData[i].slug },
      update: { name: occasionData[i].name, position: i },
      create: { ...occasionData[i], position: i },
    });
  }
  console.log(`✅ ${occasionData.length} occasions seeded`);

  // ─── Specialties ───
  const specialtyData = [
    { name: "Joyería de autor", slug: "joyeria-de-autor" },
    { name: "Engastado de piedras", slug: "engastado-de-piedras" },
    { name: "Fundición y modelado", slug: "fundicion-y-modelado" },
    { name: "Orfebrería tradicional", slug: "orfebreria-tradicional" },
    { name: "Alta joyería", slug: "alta-joyeria" },
    { name: "Joyería contemporánea", slug: "joyeria-contemporanea" },
  ];

  for (let i = 0; i < specialtyData.length; i++) {
    await prisma.specialty.upsert({
      where: { slug: specialtyData[i].slug },
      update: { name: specialtyData[i].name, position: i },
      create: { ...specialtyData[i], position: i },
    });
  }
  console.log(`✅ ${specialtyData.length} specialties seeded`);

  // Connect artisans to specialties
  const joyeriaDeAutor = await prisma.specialty.findUnique({ where: { slug: "joyeria-de-autor" } });
  const engastado = await prisma.specialty.findUnique({ where: { slug: "engastado-de-piedras" } });
  const altaJoyeria = await prisma.specialty.findUnique({ where: { slug: "alta-joyeria" } });
  const orfebreriaTradicional = await prisma.specialty.findUnique({ where: { slug: "orfebreria-tradicional" } });

  if (joyeriaDeAutor && engastado && altaJoyeria && orfebreriaTradicional) {
    const artisans = await prisma.artisan.findMany();
    for (const artisan of artisans) {
      const specialtyIds: string[] = [];
      if (artisan.specialty.toLowerCase().includes("autor") || artisan.specialty.toLowerCase().includes("diseño")) {
        specialtyIds.push(joyeriaDeAutor.id);
      }
      if (artisan.specialty.toLowerCase().includes("piedra") || artisan.specialty.toLowerCase().includes("engast")) {
        specialtyIds.push(engastado.id);
      }
      if (artisan.specialty.toLowerCase().includes("alta") || artisan.specialty.toLowerCase().includes("botánic")) {
        specialtyIds.push(altaJoyeria.id);
      }
      if (artisan.specialty.toLowerCase().includes("tradicion") || artisan.specialty.toLowerCase().includes("orgánic")) {
        specialtyIds.push(orfebreriaTradicional.id);
      }
      if (specialtyIds.length === 0) specialtyIds.push(joyeriaDeAutor.id);

      await prisma.artisan.update({
        where: { id: artisan.id },
        data: {
          specialties: { set: specialtyIds.map(id => ({ id })) },
        },
      });
    }
    console.log("✅ Artisans connected to specialties");
  }

  // Connect some products to occasions
  const regalo = await prisma.occasion.findUnique({ where: { slug: "regalo" } });
  const usoDiario = await prisma.occasion.findUnique({ where: { slug: "uso-diario" } });
  const compromiso = await prisma.occasion.findUnique({ where: { slug: "compromiso" } });
  const aniversario = await prisma.occasion.findUnique({ where: { slug: "aniversario" } });

  if (regalo && usoDiario && compromiso && aniversario) {
    const allProducts = await prisma.product.findMany({ take: 15 });
    for (let i = 0; i < allProducts.length; i++) {
      const occasionIds: string[] = [];
      if (i % 2 === 0) occasionIds.push(regalo.id);
      if (i % 3 === 0) occasionIds.push(usoDiario.id);
      if (allProducts[i].category === "ANILLO" && i % 2 === 0) occasionIds.push(compromiso.id);
      if (i % 4 === 0) occasionIds.push(aniversario.id);
      if (occasionIds.length === 0) occasionIds.push(regalo.id);

      await prisma.product.update({
        where: { id: allProducts[i].id },
        data: {
          occasions: { set: occasionIds.map(id => ({ id })) },
        },
      });
    }
    console.log("✅ Products connected to occasions");
  }

  console.log("🌱 Seed complete!");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
