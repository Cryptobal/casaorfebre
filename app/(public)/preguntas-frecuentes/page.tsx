import type { Metadata } from "next";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Preguntas Frecuentes | Casa Orfebre",
  description:
    "Resuelve tus dudas sobre compras, envíos, devoluciones, garantía y más en Casa Orfebre. Joyería artesanal chilena con certificado de autenticidad.",
  alternates: { canonical: "/preguntas-frecuentes" },
  openGraph: {
    title: "Preguntas Frecuentes | Casa Orfebre",
    description:
      "Resuelve tus dudas sobre compras, envíos, devoluciones, garantía y más en Casa Orfebre.",
    images: [{ url: "/casaorfebre-og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Preguntas Frecuentes | Casa Orfebre",
    description:
      "Resuelve tus dudas sobre compras, envíos, devoluciones, garantía y más en Casa Orfebre.",
    images: ["/casaorfebre-og-image.png"],
  },
};

interface FaqItem {
  question: string;
  answer: string;
}

interface FaqSection {
  title: string;
  items: FaqItem[];
}

const faqSections: FaqSection[] = [
  {
    title: "Compras",
    items: [
      {
        question: "¿Cómo compro en Casa Orfebre?",
        answer:
          "Navega nuestra colección, selecciona la pieza que te encanta y agrégala al carrito. Puedes comprar como invitado o crear una cuenta para guardar tus favoritos y hacer seguimiento de tus pedidos. El proceso de pago es seguro y te guiará paso a paso hasta confirmar tu compra.",
      },
      {
        question: "¿Qué medios de pago aceptan?",
        answer:
          "Aceptamos tarjetas de crédito y débito (Visa, Mastercard, American Express) a través de nuestra pasarela de pago segura. También puedes pagar con transferencia bancaria. Todos los pagos se procesan en pesos chilenos (CLP) con encriptación SSL para proteger tu información financiera.",
      },
      {
        question: "¿Cuánto demora el envío?",
        answer:
          "Los envíos dentro de la Región Metropolitana toman entre 2 y 4 días hábiles. Para regiones, el plazo es de 4 a 7 días hábiles dependiendo de la ubicación. Las piezas personalizadas o hechas a pedido pueden tener plazos adicionales de producción que se indican en cada producto.",
      },
      {
        question: "¿Hacen envíos a todo Chile?",
        answer:
          "Sí, realizamos envíos a todo Chile continental. Cada pieza es cuidadosamente empacada en un estuche protector para garantizar que llegue en perfectas condiciones. Recibirás un número de seguimiento por correo electrónico una vez que tu pedido sea despachado.",
      },
      {
        question: "¿Puedo hacer seguimiento de mi pedido?",
        answer:
          "Por supuesto. Una vez despachado tu pedido, recibirás un correo electrónico con el número de seguimiento y un enlace directo para rastrear tu envío en tiempo real. Si tienes una cuenta, también puedes ver el estado de todos tus pedidos desde tu panel personal.",
      },
    ],
  },
  {
    title: "Devoluciones",
    items: [
      {
        question: "¿Cuál es la política de devoluciones?",
        answer:
          "Tienes 14 días naturales desde la recepción de tu pedido para solicitar una devolución, siempre que la pieza esté en su estado original, sin uso y con su empaque completo. Una vez recibida y verificada la devolución, procesamos el reembolso en un plazo de 5 a 10 días hábiles al mismo medio de pago utilizado.",
      },
      {
        question:
          "¿Cuál es la diferencia entre una devolución y una disputa?",
        answer:
          "La devolución es para cuando quieres devolver físicamente una pieza y recibir un reembolso (por ejemplo, por arrepentimiento o porque no era lo que esperabas). La disputa es para reportar un problema que requiere mediación de Casa Orfebre (producto dañado, no coincide con la descripción, producto equivocado). En ambos casos, tienes 14 días desde la entrega para iniciar el proceso desde tu portal de comprador.",
      },
      {
        question: "¿Las piezas personalizadas tienen devolución?",
        answer:
          "Las piezas personalizadas o hechas a pedido no admiten devolución, ya que son creadas específicamente según tus indicaciones. Sin embargo, si la pieza presenta algún defecto de fabricación, será reparada o reemplazada sin costo adicional bajo nuestra garantía de calidad artesanal.",
      },
      {
        question: "¿Quién paga el envío de devolución?",
        answer:
          "Si la devolución es por un defecto de fabricación o un error en el despacho, Casa Orfebre cubre el costo total del envío de devolución. En caso de devoluciones por cambio de preferencia, el costo del envío de retorno es asumido por el comprador.",
      },
    ],
  },
  {
    title: "Para Orfebres",
    items: [
      {
        question: "¿Cómo puedo vender en Casa Orfebre?",
        answer:
          "Completa el formulario de postulación en nuestra sección para orfebres. Nuestro equipo curatorial revisará tu portafolio, técnicas y materiales. Buscamos orfebres que trabajen con materiales nobles y demuestren un compromiso con la calidad artesanal. El proceso de revisión toma entre 5 y 10 días hábiles.",
      },
      {
        question: "¿Qué comisión cobra Casa Orfebre?",
        answer:
          "Casa Orfebre cobra una comisión sobre cada venta realizada a través de la plataforma. Esta comisión cubre los costos de tecnología, marketing, procesamiento de pagos y atención al cliente. Los detalles específicos de la comisión se comunican durante el proceso de incorporación del orfebre.",
      },
      {
        question: "¿Cuándo recibo el pago de mis ventas?",
        answer:
          "Los pagos se procesan de forma periódica. Una vez confirmada la entrega del producto al comprador y transcurrido el período de garantía de devolución, el monto correspondiente se transfiere a tu cuenta bancaria registrada. Puedes ver el detalle de tus ventas y pagos pendientes desde tu panel de orfebre.",
      },
      {
        question: "¿Qué tipo de fotos necesito?",
        answer:
          "Necesitas al menos 3 fotografías de alta calidad por producto: una vista frontal, una de detalle y una que muestre la escala de la pieza. Las fotos deben tener fondo neutro, buena iluminación natural y una resolución mínima de 1200x1600 píxeles. Piezas bien fotografiadas tienen hasta 3 veces más probabilidades de venta.",
      },
    ],
  },
  {
    title: "Garantía",
    items: [
      {
        question: "¿Qué es el certificado de autenticidad?",
        answer:
          "Cada pieza vendida en Casa Orfebre incluye un certificado digital de autenticidad que acredita al orfebre creador, los materiales utilizados, la técnica de elaboración y un código único de verificación. Este certificado garantiza que estás adquiriendo una pieza original de joyería artesanal chilena.",
      },
      {
        question: "¿Cómo verifico un certificado?",
        answer:
          "Cada certificado incluye un código QR y un código alfanumérico único que puedes verificar directamente en nuestra plataforma. Al ingresar el código, podrás ver los datos completos de la pieza, su orfebre creador y la fecha de emisión del certificado. Esto protege tanto al comprador como al artesano.",
      },
      {
        question: "¿Qué cubre la garantía?",
        answer:
          "Nuestra garantía cubre defectos de fabricación durante 6 meses desde la fecha de compra. Esto incluye problemas con soldaduras, engastes sueltos o defectos en el acabado que no sean resultado del uso normal. El desgaste natural de los materiales, como la pátina en plata o cobre, no está cubierto ya que es parte de la vida de la pieza.",
      },
    ],
  },
  {
    title: "Cuenta",
    items: [
      {
        question: "¿Cómo creo una cuenta?",
        answer:
          'Puedes crear una cuenta haciendo clic en "Iniciar Sesión" y registrándote con tu correo electrónico o directamente con tu cuenta de Google. Tener una cuenta te permite guardar piezas como favoritos, hacer seguimiento de tus pedidos, acceder a tu historial de compras y recibir notificaciones sobre nuevas colecciones.',
      },
      {
        question: "¿Puedo eliminar mi cuenta y datos?",
        answer:
          "Sí, respetamos tu derecho a la privacidad y protección de datos personales. Puedes solicitar la eliminación completa de tu cuenta y todos los datos asociados contactándonos directamente. Procesaremos tu solicitud en un plazo máximo de 30 días, conforme a la legislación chilena de protección de datos.",
      },
    ],
  },
];

// Build all FAQ items for JSON-LD structured data
const allFaqItems = faqSections.flatMap((section) => section.items);

// Static JSON-LD — all values are hardcoded constants, no user input involved
const jsonLd = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: allFaqItems.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  })),
});

export default function PreguntasFrecuentesPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd }}
      />
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-12 max-w-2xl">
          <h1 className="font-serif text-3xl font-light sm:text-4xl">
            Preguntas Frecuentes
          </h1>
          <p className="mt-4 text-lg font-light leading-relaxed text-text-secondary">
            Encuentra respuestas a las dudas más comunes sobre compras, envíos,
            devoluciones, garantía y cómo vender en Casa Orfebre.
          </p>
        </div>

        {faqSections.map((section) => (
          <section key={section.title}>
            <h2 className="mb-6 mt-12 text-xs font-medium uppercase tracking-widest text-text-tertiary">
              {section.title}
            </h2>
            <div className="divide-y divide-border">
              {section.items.map((item) => (
                <details key={item.question} className="group">
                  <summary className="flex cursor-pointer items-center justify-between py-4 font-medium text-text transition-colors hover:text-accent">
                    <span>{item.question}</span>
                    <span className="ml-4 flex-shrink-0 text-text-tertiary transition-transform group-open:rotate-45">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      >
                        <line x1="8" y1="2" x2="8" y2="14" />
                        <line x1="2" y1="8" x2="14" y2="8" />
                      </svg>
                    </span>
                  </summary>
                  <p className="pb-4 font-light leading-relaxed text-text-secondary">
                    {item.answer}
                  </p>
                </details>
              ))}
            </div>
          </section>
        ))}

        <div className="mt-16 rounded-lg border border-border bg-surface p-8 text-center">
          <h2 className="font-serif text-xl font-light">
            ¿No encontraste lo que buscabas?
          </h2>
          <p className="mt-2 font-light text-text-secondary">
            Escríbenos a{" "}
            <a
              href="mailto:contacto@casaorfebre.cl"
              className="text-accent underline underline-offset-4 transition-colors hover:text-accent/80"
            >
              contacto@casaorfebre.cl
            </a>{" "}
            y te responderemos a la brevedad.
          </p>
        </div>
      </div>
    </>
  );
}
