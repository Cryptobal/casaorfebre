/**
 * Micro-copy editorial unificado.
 * Fuente: brief editorial v1 §2.7. Importar desde acá en lugar de hard-codear
 * strings en componentes — cambios futuros suceden en un solo lugar.
 */
export const UI_COPY = {
  cart: {
    add: "Agregar a la bolsa",
    addUnique: "Reservar pieza",          // productionType === "UNIQUE"
    addCommission: "Encargar pieza",      // productionType === "MADE_TO_ORDER"
    view: "Ver pieza",
    viewDetails: "Ver ficha completa",
    buyNow: "Adquirir ahora",
    remove: "Quitar de la bolsa",
  },

  status: {
    available: "Disponible",
    soldUnique: "Adquirida",              // pieza única vendida
    soldOut: "Agotada",                   // edición limitada agotada
    madeToOrder: "Se hace por encargo",
    reserved: "Reservada",
    lastOne: "Última disponible",         // SOLO en ficha, nunca en grid
  },

  bag: {
    empty: "Tu bolsa está vacía.",
    emptyHint: "La galería está abierta.",
    total: "Total",
    subtotal: "Subtotal",
    checkout: "Finalizar compra",
    continue: "Seguir explorando",
    itemAdded: "Pieza agregada",
    itemRemoved: "Pieza quitada",
  },

  wishlist: {
    add: "Guardar en favoritos",
    remove: "Quitar de favoritos",
    empty: "Aún no tienes favoritos.",
    emptyHint: "Las piezas que guardes aparecerán acá.",
    title: "Mis favoritos",
  },

  search: {
    placeholder: "Busca por autor, pieza, material…",
    empty: "No encontramos piezas que coincidan.",
    emptyHint: "Prueba con otro material, otra técnica, o escríbenos.",
    results: (n: number) => (n === 1 ? "1 pieza" : `${n} piezas`),
    loading: "Buscando piezas…",
  },

  filters: {
    title: "Filtros",
    clear: "Limpiar filtros",
    apply: "Aplicar",
    close: "Cerrar",
    showMore: "Ver más",
    showLess: "Ver menos",
    resultsFound: (n: number) => `${n} piezas encontradas`,
  },

  loading: {
    default: "Cargando…",
    pieces: "Buscando piezas…",
    artisans: "Cargando orfebres…",
  },

  errors: {
    generic: "Algo no se cargó. Intenta de nuevo.",
    network: "Sin conexión. Verifica tu red.",
    notFound: "No encontramos lo que buscas.",
    serverError: "Tuvimos un problema de nuestro lado. Vuelve en un momento.",
  },

  newsletter: {
    title:
      "Piezas nuevas, historias, y la primera invitación a las ediciones limitadas.",
    placeholder: "tu correo",
    button: "Suscribirse",
    fineprint: "Solo correo editorial. Baja intensidad. Podés salirte en un click.",
    success: "Gracias. Te escribimos pronto.",
    error: "No pudimos suscribirte. Intenta de nuevo.",
    alreadySubscribed: "Ya estás suscrita.",
  },

  auth: {
    signIn: "Ingresar",
    signOut: "Salir",
    signInPrompt: "Ingresa para guardar favoritos y ver tu historial.",
    continueWithEmail: "Continuar con correo",
    orContinueWith: "o continúa con",
  },

  buyer: {
    guarantee14: "Garantía de 14 días",
    authenticityCert: "Certificado de autenticidad",
    trackedShipping: "Envío con seguimiento",
    securePayment: "Pago seguro",
  },

  artisan: {
    commissionCTA: "¿Una pieza hecha para ti?",
    commissionHint: (name: string) => `${name} acepta encargos personalizados.`,
    commissionButton: "Consultar un encargo",
    viewAll: "Ver toda su obra",
    contact: "Contactar",
  },

  breadcrumb: {
    home: "Casa Orfebre",
    collection: "Colección",
    artisans: "Orfebres",
    stories: "Historias",
    about: "Sobre",
  },
} as const;

/** Etiqueta del CTA "Añadir" según el tipo de producción. */
export function getAddToBagLabel(
  productionType: "UNIQUE" | "MADE_TO_ORDER" | "LIMITED",
): string {
  switch (productionType) {
    case "UNIQUE":
      return UI_COPY.cart.addUnique;
    case "MADE_TO_ORDER":
      return UI_COPY.cart.addCommission;
    case "LIMITED":
    default:
      return UI_COPY.cart.add;
  }
}
