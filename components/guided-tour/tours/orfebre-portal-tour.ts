import type { DriveStep } from "driver.js";

export const orfebrePortalSteps: DriveStep[] = [
  {
    popover: {
      title: "¡Bienvenido a tu Portal de Orfebre!",
      description:
        "Te guiaremos por las principales funciones de tu panel. Toma menos de 2 minutos. Puedes repetir este tour cuando quieras.",
      side: "over",
      align: "center",
    },
  },
  {
    element: '[data-tour="orfebre-dashboard"]',
    popover: {
      title: "Tu Taller",
      description:
        "Aquí ves un resumen de tus ventas, visitas a tus productos y pedidos pendientes. Todo de un vistazo.",
    },
  },
  {
    element: '[data-tour="orfebre-productos"]',
    popover: {
      title: "Gestión de Piezas",
      description:
        "Crea y edita tus piezas. Sube fotos, define materiales, precios, y tipo de pieza (única, edición limitada, personalizada).",
    },
  },
  {
    element: '[data-tour="orfebre-pedidos"]',
    popover: {
      title: "Tus Pedidos",
      description:
        "Cuando un cliente compra tu pieza, aparece aquí. Podrás ver los detalles, actualizar el estado de envío y comunicarte con el comprador.",
    },
  },
  {
    element: '[data-tour="orfebre-preguntas"]',
    popover: {
      title: "Preguntas",
      description:
        "Los compradores pueden hacerte preguntas sobre tus piezas. Respóndelas para generar confianza y cerrar ventas.",
    },
  },
  {
    element: '[data-tour="orfebre-mensajes"]',
    popover: {
      title: "Mensajes",
      description:
        "Comunícate directamente con tus compradores. Coordina detalles de envío, personalización y más.",
    },
  },
  {
    element: '[data-tour="orfebre-finanzas"]',
    popover: {
      title: "Finanzas",
      description:
        "Revisa tus ingresos, comisiones y el detalle de cada transacción. Todo transparente.",
    },
  },
  {
    element: '[data-tour="orfebre-estadisticas"]',
    popover: {
      title: "Estadísticas",
      description:
        "Revisa cuántas visitas reciben tus productos, qué piezas son las más vistas y tu historial de ventas.",
    },
  },
  {
    element: '[data-tour="orfebre-calculadora"]',
    popover: {
      title: "Calculadora de Precios",
      description:
        "Calcula el precio ideal para tus piezas considerando materiales, tiempo de trabajo y la comisión de Casa Orfebre.",
    },
  },
  {
    element: '[data-tour="orfebre-perfil"]',
    popover: {
      title: "Tu Perfil de Orfebre",
      description:
        "Edita tu bio, especialidades, foto de perfil y redes sociales. Este perfil es visible para todos los compradores.",
    },
  },
  {
    popover: {
      title: "¡Estás listo!",
      description:
        "Ya conoces lo esencial. Si tienes dudas, escríbenos por WhatsApp. Puedes repetir este tour desde el botón «Guía del Portal».",
      side: "over",
      align: "center",
    },
  },
];
