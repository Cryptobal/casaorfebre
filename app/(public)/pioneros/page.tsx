import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Sé Pionero de Casa Orfebre | Acceso Anticipado",
  description:
    "Los primeros en Casa Orfebre. Acceso anticipado, beneficios exclusivos y la oportunidad de dar forma a la plataforma de joyería artesanal chilena más importante.",
  openGraph: {
    title: "Sé Pionero de Casa Orfebre",
    description:
      "Acceso anticipado al ecosistema de joyería artesanal chilena más completo. Solo para los primeros.",
    url: "https://casaorfebre.cl/pioneros",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Pioneros — Casa Orfebre",
  description: "Programa de acceso anticipado de Casa Orfebre",
};

export default async function PionerosPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── HERO ── */}
      <section className="bg-background px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-medium uppercase tracking-[0.3em] text-accent">
            &#10022;&nbsp; Acceso anticipado &nbsp;&#10022;
          </p>
          <h1 className="mt-6 font-serif text-4xl font-light leading-tight text-text sm:text-5xl lg:text-6xl">
            Sé parte de los primeros
          </h1>
          <p className="mx-auto mt-6 max-w-xl font-sans text-lg leading-relaxed text-text-secondary">
            Los Pioneros son quienes están antes de que algo se vuelva obvio.
            Casa Orfebre es el marketplace de joyería artesanal chilena más completo
            del país — y tú llegas antes que todos.
          </p>

          {token && (
            <div className="mx-auto mt-8 max-w-md rounded-lg border border-accent/30 bg-accent/5 px-6 py-4">
              <p className="text-sm font-medium text-accent">
                Tu invitación está activa.
              </p>
              <p className="mt-1 text-sm text-text-secondary">
                Regístrate ahora para activar tus beneficios de Pionero.
              </p>
            </div>
          )}

          <div className="mt-10">
            {token ? (
              <Link
                href={`/registro?type=pioneer&token=${token}`}
                className="inline-block rounded-md bg-text px-8 py-3 text-sm font-medium text-background transition-colors hover:bg-text/90"
              >
                Activar mi cuenta de Pionero
              </Link>
            ) : (
              <a
                href="#solicitar-acceso"
                className="inline-block rounded-md bg-text px-8 py-3 text-sm font-medium text-background transition-colors hover:bg-text/90"
              >
                Solicitar acceso
              </a>
            )}
          </div>
        </div>
      </section>

      {/* ── QUÉ SIGNIFICA SER PIONERO ── */}
      <section className="border-t border-border bg-surface px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center font-serif text-3xl font-light text-text">
            No es un descuento. Es una posición.
          </h2>
          <div className="mt-16 grid gap-16 md:grid-cols-3">
            <div>
              <p className="font-serif text-5xl font-light text-accent/40">Primero</p>
              <p className="mt-4 text-sm leading-relaxed text-text-secondary">
                Accedes a orfebres y piezas antes que el público general.
                Cuando un nuevo artesano se incorpora, tú eres parte de los que lo descubren.
              </p>
            </div>
            <div>
              <p className="font-serif text-5xl font-light text-accent/40">Influyente</p>
              <p className="mt-4 text-sm leading-relaxed text-text-secondary">
                Tu feedback llega directo al equipo. Las funcionalidades que construimos en los próximos
                meses las construimos con los Pioneros, no para los Pioneros.
                Hay una diferencia enorme entre esas dos preposiciones.
              </p>
            </div>
            <div>
              <p className="font-serif text-5xl font-light text-accent/40">Permanente</p>
              <p className="mt-4 text-sm leading-relaxed text-text-secondary">
                Los beneficios de Pionero acompañan tu cuenta para siempre.
                No son un período de prueba. Son el reconocimiento de haber estado cuando importaba.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── EL ECOSISTEMA ── */}
      <section className="border-t border-border bg-background px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-serif text-3xl font-light text-text">
              Casa Orfebre en una página
            </h2>
            <p className="mt-4 text-text-secondary">
              Somos un ecosistema de tres actores que se necesitan mutuamente.
              Como Pionero, puedes ser cualquiera de ellos — o los tres.
            </p>
          </div>
          <div className="mt-16 grid gap-8 md:grid-cols-3">
            <div className="rounded-lg border border-border p-8">
              <h3 className="font-serif text-xl font-medium text-text">
                Para compradores
              </h3>
              <p className="mt-4 text-sm leading-relaxed text-text-secondary">
                El buscador más inteligente de joyería artesanal chilena. Piezas únicas de orfebres
                verificados, con certificado de autenticidad digital y garantía real.
                La IA entiende lo que buscas incluso cuando no sabes cómo describirlo.
              </p>
              <Link href="/coleccion" className="mt-4 inline-block text-sm font-medium text-accent hover:text-accent-dark">
                Ver la colección &rarr;
              </Link>
            </div>
            <div className="rounded-lg border border-border p-8">
              <h3 className="font-serif text-xl font-medium text-text">
                Para orfebres
              </h3>
              <p className="mt-4 text-sm leading-relaxed text-text-secondary">
                Una vitrina profesional con herramientas de inteligencia artificial que trabajan
                para el artesano: análisis de imágenes, fichas auto-completadas, sugerencias de
                catálogo y generación de blog. Más tiempo en el taller, menos en la pantalla.
              </p>
              <Link href="/para-orfebres" className="mt-4 inline-block text-sm font-medium text-accent hover:text-accent-dark">
                Saber más &rarr;
              </Link>
            </div>
            <div className="rounded-lg border border-accent/20 bg-accent/5 p-8">
              <h3 className="font-serif text-xl font-medium text-text">
                Para pioneros
              </h3>
              <p className="mt-4 text-sm leading-relaxed text-text-secondary">
                Acceso anticipado, voz en el producto y beneficios permanentes.
                Los primeros en una plataforma que va a ser imposible ignorar.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── IA DE CASA ORFEBRE ── */}
      <section className="border-t border-border bg-surface px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center font-serif text-3xl font-light text-text">
            La plataforma tecnológicamente más avanzada de joyería artesanal en Chile
          </h2>
          <p className="mt-4 text-center text-text-secondary">
            La IA no es un feature. Es la columna vertebral de cómo Casa Orfebre
            conecta lo que el comprador necesita con lo que el orfebre crea.
          </p>
          <div className="mt-12 space-y-6 text-sm leading-relaxed text-text-secondary">
            <p>
              Para el comprador, la IA es invisible pero constante. Está en el buscador
              que entiende &ldquo;algo para regalar a mi mamá que le gusta el mar&rdquo; y devuelve
              piezas con lapislázuli y texturas costeras. Está en las recomendaciones
              que mejoran con cada visita. Está en el blog donde orfebres explican
              su oficio con palabras que cualquiera entiende.
            </p>
            <p>
              Para el orfebre, la IA es una asistente que nunca se cansa. Analiza
              las fotos antes de publicar — iluminación, fondo, nitidez — y da
              retroalimentación específica. Completa las fichas de producto a partir
              de imágenes y una descripción breve. Sugiere precios justos basados
              en materiales y mercado. Ayuda a escribir artículos de blog desde
              el conocimiento del artesano. Y analiza el catálogo como un todo
              para sugerir colecciones con coherencia.
            </p>
            <p className="font-medium text-text">
              Como Pionero, serás el primero en probar cada nueva funcionalidad
              antes que el resto de la comunidad.
            </p>
          </div>
        </div>
      </section>

      {/* ── ROADMAP ── */}
      <section className="border-t border-border bg-background px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-center font-serif text-3xl font-light text-text">
            Dónde estamos y hacia dónde vamos
          </h2>
          <div className="mt-14 space-y-0">
            {[
              { icon: "done", text: "Plataforma en producción con orfebres verificados" },
              { icon: "done", text: "Sistema de pedidos, pagos y certificados operativo" },
              { icon: "done", text: "Blog editorial de joyería artesanal chilena" },
              { icon: "progress", text: "Búsqueda semántica con IA (en desarrollo)" },
              { icon: "progress", text: "Análisis de imágenes y fichas IA para orfebres" },
              { icon: "progress", text: "Blog generado con asistencia IA por los propios orfebres" },
              { icon: "future", text: "App móvil iOS y Android" },
              { icon: "future", text: "Programa de embajadores y referidos" },
              { icon: "future", text: "Expansión internacional (Argentina, Colombia)" },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-4 py-3">
                <div className="relative flex flex-col items-center">
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                      item.icon === "done"
                        ? "bg-green-100 text-green-700"
                        : item.icon === "progress"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {item.icon === "done" ? "\u2713" : item.icon === "progress" ? "\u27F3" : "\u25A1"}
                  </span>
                  {i < 8 && (
                    <span className="absolute top-6 h-6 w-px bg-border" />
                  )}
                </div>
                <p className={`text-sm ${item.icon === "future" ? "text-text-tertiary" : "text-text-secondary"}`}>
                  {item.text}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-8 text-center text-xs text-text-tertiary">
            Los Pioneros son los primeros en acceder a cada item de esta lista.
          </p>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section id="solicitar-acceso" className="bg-text px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          {token ? (
            <>
              <h2 className="font-serif text-3xl font-light text-background">
                Ya tienes tu invitación.
              </h2>
              <p className="mt-4 text-background/70">
                Crea tu cuenta ahora y activa tus beneficios de Pionero antes de que expire.
              </p>
              <div className="mt-10">
                <Link
                  href={`/registro?type=pioneer&token=${token}`}
                  className="inline-block rounded-md bg-accent px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-accent-dark"
                >
                  Activar mi cuenta
                </Link>
              </div>
            </>
          ) : (
            <>
              <h2 className="font-serif text-3xl font-light text-background">
                Solicita tu acceso
              </h2>
              <p className="mt-4 text-background/70">
                Los lugares de Pionero son limitados. Deja tu email y te avisamos.
              </p>
              <WaitlistForm />
            </>
          )}
        </div>
      </section>
    </>
  );
}

/* ── Waitlist form (simple client island) ── */

function WaitlistForm() {
  return (
    <form
      action={async (formData: FormData) => {
        "use server";
        const email = formData.get("email") as string;
        if (!email) return;
        const { resend, FROM_EMAIL } = await import("@/lib/resend");
        try {
          await resend.emails.send({
            from: FROM_EMAIL,
            to: "contacto@casaorfebre.cl",
            subject: `[Waitlist Pionero] ${email}`,
            html: `<p>Nuevo interesado en el programa Pionero:</p><p><strong>${email}</strong></p>`,
          });
        } catch (e) {
          console.error("[WAITLIST] Failed:", e);
        }
      }}
      className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row"
    >
      <input
        type="email"
        name="email"
        required
        placeholder="tu@email.com"
        className="flex-1 rounded-md border border-background/20 bg-background/10 px-4 py-3 text-sm text-background placeholder-background/50 outline-none focus:border-accent"
      />
      <button
        type="submit"
        className="rounded-md bg-accent px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-accent-dark"
      >
        Solicitar acceso
      </button>
    </form>
  );
}
