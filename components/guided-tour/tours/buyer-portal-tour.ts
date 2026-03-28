import type { DriveStep } from "driver.js";

export const buyerPortalSteps: DriveStep[] = [
  {
    popover: {
      title: "¡Bienvenido a tu cuenta!",
      description:
        "Te mostramos las principales funciones de tu espacio personal. Toma menos de un minuto.",
      side: "over",
      align: "center",
    },
  },
  {
    element: '[data-tour="buyer-pedidos"]',
    popover: {
      title: "Mis Pedidos",
      description:
        "Aquí puedes seguir el estado de todas tus compras: en preparación, enviado, entregado. Cada pedido incluye su tracking de envío.",
    },
  },
  {
    element: '[data-tour="buyer-giftcards"]',
    popover: {
      title: "Gift Cards",
      description:
        "Revisa tus gift cards activas y su saldo disponible. También puedes regalar una desde aquí.",
    },
  },
  {
    element: '[data-tour="buyer-mensajes"]',
    popover: {
      title: "Mensajes",
      description:
        "Comunícate directamente con los orfebres sobre tus compras, personalizaciones o consultas.",
    },
  },
  {
    element: '[data-tour="buyer-favoritos"]',
    popover: {
      title: "Favoritos",
      description:
        "Las piezas que te gustaron quedan guardadas aquí. Perfectas para cuando estés listo para comprar o quieras compartirlas.",
    },
  },
  {
    element: '[data-tour="buyer-listas"]',
    popover: {
      title: "Mis Listas",
      description:
        "Crea listas de deseos y compártelas con amigos o familia. Ideal para cumpleaños, navidad o cualquier ocasión especial.",
    },
  },
  {
    element: '[data-tour="buyer-referidos"]',
    popover: {
      title: "Invita Amigos",
      description:
        "Comparte tu código de referido y gana recompensas cuando tus amigos hagan su primera compra.",
    },
  },
  {
    element: '[data-tour="buyer-perfil"]',
    popover: {
      title: "Mi Cuenta",
      description:
        "Edita tu nombre, email y dirección de envío. Mantener tu info actualizada ayuda a que tus envíos lleguen sin problemas.",
    },
  },
  {
    popover: {
      title: "¡Todo listo!",
      description:
        "Ya conoces tu espacio personal. Si tienes dudas sobre un pedido, puedes escribirnos por WhatsApp en cualquier momento.",
      side: "over",
      align: "center",
    },
  },
];
