import type { DriveStep } from "driver.js";

export const buyerTourStepsDesktop: DriveStep[] = [
  {
    popover: {
      title: "¡Bienvenido a Casa Orfebre!",
      description:
        "Te mostramos cómo encontrar la pieza perfecta. Son solo unos segundos.",
      side: "over",
      align: "center",
    },
  },
  {
    element: '[data-tour="nav-coleccion"]',
    popover: {
      title: "Explora la Colección",
      description:
        "Navega todas las piezas disponibles. Puedes filtrar por material, tipo de pieza, rango de precio y orfebre.",
    },
  },
  {
    element: '[data-tour="nav-orfebres"]',
    popover: {
      title: "Conoce a los Orfebres",
      description:
        "Cada artesano tiene su perfil con su historia, especialidades y todas sus piezas. Compra directamente de quien crea.",
    },
  },
  {
    element: '[data-tour="nav-curador"]',
    popover: {
      title: "Selección del Curador",
      description:
        "Nuestras piezas favoritas, elegidas a mano. Si no sabes por dónde empezar, este es el lugar.",
    },
  },
  {
    element: '[data-tour="nav-regalar"]',
    popover: {
      title: "Regalos Especiales",
      description:
        "Encuentra la pieza perfecta para cada ocasión: compromiso, aniversario, día de la madre y más.",
    },
  },
  {
    element: '[data-tour="nav-search"]',
    popover: {
      title: "Búsqueda Rápida",
      description:
        "Busca por nombre, material, estilo o incluso describe lo que imaginas. Usa ⌘K en cualquier momento.",
    },
  },
  {
    element: '[data-tour="hero-garantias"]',
    popover: {
      title: "Compra con Confianza",
      description:
        "Pago seguro con Mercado Pago, garantía de 14 días, certificado de autenticidad y seguimiento de envío.",
    },
  },
  {
    popover: {
      title: "¡Listo para explorar!",
      description:
        "Disfruta descubriendo joyería única hecha por manos chilenas. Si necesitas ayuda, el botón de WhatsApp está siempre disponible.",
      side: "over",
      align: "center",
    },
  },
];

export const buyerTourStepsMobile: DriveStep[] = [
  {
    popover: {
      title: "¡Bienvenido a Casa Orfebre!",
      description:
        "Joyería artesanal chilena, directo del orfebre a tus manos. Te mostramos lo esencial.",
      side: "over",
      align: "center",
    },
  },
  {
    popover: {
      title: "Explora y Descubre",
      description:
        "Usa el menú ☰ para navegar la colección, conocer orfebres, ver la selección del curador y encontrar regalos por ocasión.",
      side: "over",
      align: "center",
    },
  },
  {
    element: '[data-tour="nav-search"]',
    popover: {
      title: "Búsqueda Rápida",
      description:
        "Busca por nombre, material o estilo. Toca la lupa para abrir el buscador.",
    },
  },
  {
    element: '[data-tour="hero-garantias"]',
    popover: {
      title: "Compra con Confianza",
      description:
        "Pago seguro con Mercado Pago, garantía de 14 días, certificado de autenticidad y seguimiento de envío.",
    },
  },
  {
    popover: {
      title: "¡A explorar!",
      description:
        "Descubre joyería única hecha por manos chilenas. Si necesitas ayuda, el botón de WhatsApp está siempre disponible.",
      side: "over",
      align: "center",
    },
  },
];
