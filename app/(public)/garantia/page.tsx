import Link from "next/link";
import { FadeIn } from "@/components/shared/fade-in";

export const metadata = {
  title: "Garantía",
  description:
    "Garantía de compra segura, envío protegido, certificado digital de trazabilidad y política de devoluciones de Casa Orfebre.",
  alternates: { canonical: "/garantia" },
  twitter: {
    card: "summary_large_image" as const,
    title: "Garantía | Casa Orfebre",
    description:
      "Garantía de compra segura, envío protegido y política de devoluciones de Casa Orfebre.",
  },
};

export default function GarantiaPage() {
  return (
    <main className="bg-background px-4 pb-24 pt-16 sm:px-6 lg:px-8 lg:pb-32 lg:pt-20">
      <article lang="es" className="mx-auto max-w-3xl text-left">
        <FadeIn>
          <header className="border-b border-border pb-10">
            <h1 className="font-serif text-3xl font-light tracking-tight text-text sm:text-4xl">
              Garantía Casa Orfebre
            </h1>
            <p className="mt-4 max-w-2xl text-base font-light leading-relaxed text-text-secondary">
              Tu compra está protegida de principio a fin. Aquí explicamos qué cubre la plataforma, cómo funciona el certificado digital y cómo pedir una devolución.
            </p>
          </header>
        </FadeIn>

        <div className="mt-12 space-y-10">
          <PolicyCard
            icon={<ShieldIcon />}
            title="Compra segura"
            children={
              <BulletList>
                <BulletItem>
                  <strong className="font-medium text-text">Pago protegido:</strong> toda transacción pasa por Mercado Pago; nunca transfieres a una cuenta desconocida.
                </BulletItem>
                <BulletItem>
                  Si el producto <strong className="font-medium text-text">no llega</strong>: reembolso completo.
                </BulletItem>
                <BulletItem>
                  Si llega algo <strong className="font-medium text-text">distinto a lo publicado</strong>: reembolso completo.
                </BulletItem>
                <BulletItem>
                  Si llega <strong className="font-medium text-text">dañado</strong>: reporta con fotos dentro de <strong className="font-medium text-text">48 horas</strong>. Casa Orfebre evaluará el caso y gestionará reembolso o reenvío. Si el daño se debe a empaque insuficiente, el costo recae en el orfebre; si es atribuible al courier, apoyamos al orfebre en el reclamo.
                </BulletItem>
                <BulletItem>
                  Plazo para reclamar: <strong className="font-medium text-text">14 días</strong> desde la entrega confirmada.
                </BulletItem>
              </BulletList>
            }
          />

          <PolicyCard
            icon={<TruckIcon />}
            title="Envío"
            children={
              <BulletList>
                <BulletItem>
                  Todos los envíos incluyen <strong className="font-medium text-text">número de seguimiento obligatorio</strong>.
                </BulletItem>
                <BulletItem>
                  Plazo máximo de despacho: <strong className="font-medium text-text">3 días hábiles</strong> desde la confirmación de pago.
                </BulletItem>
                <BulletItem>
                  Si el orfebre no despacha en plazo:{" "}
                  <strong className="font-medium text-text">cancelación automática y reembolso completo</strong>.
                </BulletItem>
                <BulletItem>
                  Si el paquete se pierde en tránsito: <strong className="font-medium text-text">reembolso completo</strong>.
                </BulletItem>
              </BulletList>
            }
          />

          <PolicyCard
            icon={<PackageSearchIcon />}
            title="Si tu pedido no llega a destino"
          >
            <div className="space-y-5 text-text-secondary">
              <p>
                Cada pieza que se vende en Casa Orfebre fue creada a mano por un orfebre chileno. Cuando un envío se demora o se extravía en tránsito, lo tratamos con la misma seriedad con la que tratamos la pieza misma.
              </p>
              <p>
                Casa Orfebre garantiza el reembolso íntegro de cualquier pedido que no llegue a destino. Para proteger tanto al comprador como al artesano que creó la pieza, el reembolso se procesa una vez confirmada una de estas tres situaciones:
              </p>
              <p>
                <strong className="font-medium text-text">Devolución del paquete al artesano.</strong>{" "}
                Cuando el courier devuelve el envío a su origen y el orfebre confirma la recepción de la pieza, procesamos el reembolso íntegro al medio de pago original.
              </p>
              <p>
                <strong className="font-medium text-text">Extravío formal declarado por el courier.</strong>{" "}
                Cuando la empresa de transporte emite un acta de extravío y activa la cobertura del seguro del envío, procesamos el reembolso íntegro.
              </p>
              <p>
                <strong className="font-medium text-text">Recepción tardía con devolución dentro de plazo.</strong>{" "}
                Si el paquete finalmente llega, cuentas con 14 días para devolverlo sin costo. Una vez que el orfebre recibe la devolución, procesamos el reembolso íntegro.
              </p>
              <p>
                Mientras se confirma alguna de estas tres situaciones, Casa Orfebre gestiona directamente el caso con el courier y mantiene comunicación constante con el comprador. El plazo estimado entre la confirmación y el reembolso es de <strong className="font-medium text-text">5 a 7 días hábiles</strong>. La trazabilidad completa de la gestión queda registrada en el panel de pedidos del comprador.
              </p>
              <p>
                Esta política existe por una razón simple: cada orfebre de nuestra comunidad necesita saber que su trabajo está protegido, y cada comprador necesita saber que su dinero está respaldado por una garantía concreta y verificable.
              </p>
            </div>
          </PolicyCard>

          <PolicyCard
            icon={<BadgeIcon />}
            title="Orfebres, publicaciones y materiales"
            children={
              <>
                <BulletList>
                  <BulletItem>
                    Los orfebres son <strong className="font-medium text-text">verificados</strong> antes de publicar en la plataforma.
                  </BulletItem>
                  <BulletItem>
                    Las piezas pasan por <strong className="font-medium text-text">aprobación editorial</strong> (fotos y descripción acordes a lo que recibirás).
                  </BulletItem>
                  <BulletItem>
                    <strong className="font-medium text-text">Los materiales declarados</strong> (oro, plata, piedras, aleaciones) son informados por el orfebre en cada ficha. Casa Orfebre no puede garantizar el contenido metalúrgico de cada pieza: eso depende del criterio y la honestidad del artesano, igual que en una joyería física.
                  </BulletItem>
                </BulletList>
                <div className="mt-8 rounded-xl border border-border bg-background/80 p-5 sm:p-6">
                  <div className="flex gap-3 sm:gap-4">
                    <div className="mt-0.5 shrink-0 text-accent">
                      <QrSparkIcon />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-serif text-lg font-light text-text">
                        Certificado digital (QR)
                      </h3>
                      <p className="mt-2 text-sm font-light leading-relaxed text-text-secondary">
                        Con muchas piezas recibes un <strong className="font-medium text-text">certificado digital</strong> con código y QR. Ese documento <strong className="font-medium text-text">vincula la joya a su ficha y a la compra en Casa Orfebre</strong>: puedes comprobar que el registro existe y que coincide con el producto y el orfebre publicados.
                      </p>
                      <p className="mt-3 text-sm font-light leading-relaxed text-text-secondary">
                        <strong className="font-medium text-text">No es un ensayo de laboratorio.</strong> La plataforma no funde ni analiza metal en cada envío: validar quilates, pureza de oro o plata o tratamiento de piedras requiere un servicio especializado fuera de Casa Orfebre. Si necesitas ese nivel de certeza, puedes acudir a un tasador o laboratorio independiente.
                      </p>
                      <p className="mt-4 text-xs leading-relaxed text-text-tertiary">
                        En resumen: el certificado digital <strong className="font-medium text-text-tertiary">autentica el vínculo</strong> entre la pieza, la publicación y el orfebre en nuestra plataforma; la declaración de materiales sigue siendo <strong className="font-medium text-text-tertiary">responsabilidad del orfebre</strong>.
                      </p>
                    </div>
                  </div>
                </div>
              </>
            }
          />

          <PolicyCard
            icon={<ReturnIcon />}
            title="Política de devoluciones"
            children={
              <div className="space-y-8">
                <div className="grid gap-4 sm:grid-cols-2 sm:items-stretch">
                  <div className="flex h-full flex-col rounded-xl border border-border bg-surface p-4">
                    <p className="text-xs font-medium uppercase tracking-widest text-text-tertiary">
                      Productos estándar
                    </p>
                    <p className="mt-2 flex-1 text-sm font-light leading-relaxed text-text-secondary">
                      <strong className="font-medium text-text">14 días</strong> desde la entrega para solicitar devolución, salvo excepciones legales.
                    </p>
                  </div>
                  <div className="flex h-full flex-col rounded-xl border border-amber-200/80 bg-amber-50/50 p-4">
                    <p className="text-xs font-medium uppercase tracking-widest text-amber-900/70">
                      Personalizados (a pedido)
                    </p>
                    <p className="mt-2 flex-1 text-sm font-light leading-relaxed text-amber-950/80">
                      <strong className="font-medium text-amber-950">No admiten devolución.</strong> Se informa antes de pagar.
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-medium uppercase tracking-widest text-text-tertiary">
                    Condiciones
                  </h3>
                  <BulletList className="mt-3">
                    <BulletItem>
                      El producto debe estar <strong className="font-medium text-text">sin uso</strong> y en su <strong className="font-medium text-text">empaque original</strong>.
                    </BulletItem>
                  </BulletList>
                </div>

                <div>
                  <h3 className="text-xs font-medium uppercase tracking-widest text-text-tertiary">
                    ¿Quién paga el envío de devolución?
                  </h3>
                  <ul className="mt-3 max-w-full space-y-3 text-sm font-light leading-relaxed text-text-secondary">
                    <li className="flex items-start gap-3 rounded-lg bg-background/90 px-3 py-2.5">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden />
                      <span className="min-w-0 flex-1">
                        <strong className="font-medium text-text">La plataforma asume el costo</strong> cuando el motivo es error del orfebre: descripción incorrecta, pieza dañada, envío equivocado o defecto claro de fabricación.
                      </span>
                    </li>
                    <li className="flex items-start gap-3 rounded-lg bg-background/90 px-3 py-2.5">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden />
                      <span className="min-w-0 flex-1">
                        <strong className="font-medium text-text">El comprador asume el costo</strong> en caso de arrepentimiento (cambio de opinión) y la devolución procede según las condiciones anteriores.
                      </span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xs font-medium uppercase tracking-widest text-text-tertiary">
                    Cómo es el proceso
                  </h3>
                  <ol className="mt-4 list-none space-y-4 p-0">
                    <ReturnStep n={1}>
                      Escribes a{" "}
                      <a
                        href="mailto:soporte@casaorfebre.cl"
                        className="break-all text-accent underline decoration-accent/30 underline-offset-2 hover:decoration-accent sm:break-normal"
                      >
                        soporte@casaorfebre.cl
                      </a>{" "}
                      o abres una solicitud desde tu cuenta, con fotos si aplica.
                    </ReturnStep>
                    <ReturnStep n={2}>
                      Revisamos tu caso y el plazo de 14 días; te respondemos en hasta{" "}
                      <strong className="font-medium text-text">24 horas hábiles</strong>.
                    </ReturnStep>
                    <ReturnStep n={3}>
                      Si el caso aplica, te enviamos instrucciones de envío y, cuando corresponda, etiqueta o reembolso del porte de vuelta.
                    </ReturnStep>
                    <ReturnStep n={4}>
                      El orfebre o la plataforma recibe la pieza y comprueba el estado.
                    </ReturnStep>
                    <ReturnStep n={5}>
                      Se procesa el <strong className="font-medium text-text">reembolso</strong> por el mismo medio de pago usado en la compra.
                    </ReturnStep>
                  </ol>
                </div>
              </div>
            }
          />

          <PolicyCard
            icon={<HeadphonesIcon />}
            title="Soporte"
            children={
              <BulletList>
                <BulletItem>
                  Email:{" "}
                  <a
                    href="mailto:soporte@casaorfebre.cl"
                    className="text-accent underline decoration-accent/30 underline-offset-2 hover:decoration-accent"
                  >
                    soporte@casaorfebre.cl
                  </a>
                </BulletItem>
                <BulletItem>
                  Tiempo de respuesta orientativo: <strong className="font-medium text-text">24 horas hábiles</strong>.
                </BulletItem>
                <BulletItem>
                  La plataforma <strong className="font-medium text-text">media entre comprador y orfebre</strong> para buscar una solución justa. Más información en&nbsp;
                  <Link
                    href="/contacto"
                    className="text-accent underline decoration-accent/30 underline-offset-2 hover:decoration-accent"
                  >
                    contacto
                  </Link>
                  .
                </BulletItem>
              </BulletList>
            }
          />
        </div>
      </article>
    </main>
  );
}

function PolicyCard({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <FadeIn>
      <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-6">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent sm:h-14 sm:w-14">
            {icon}
          </div>
          <div className="min-w-0 w-full flex-1 text-left">
            <h2 className="font-serif text-xl font-light text-text sm:text-2xl">{title}</h2>
            <div className="mt-5 w-full text-sm leading-relaxed sm:text-[0.9375rem]">{children}</div>
          </div>
        </div>
      </section>
    </FadeIn>
  );
}

function BulletList({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <ul className={`list-none space-y-3 pl-0 text-sm font-light leading-relaxed ${className ?? ""}`}>
      {children}
    </ul>
  );
}

/** Viñeta + un solo bloque de texto (evita huecos tipo “dos columnas” entre strong y el resto). */
function BulletItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-[0.55em] h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden />
      <span className="min-w-0 flex-1 text-text-secondary">{children}</span>
    </li>
  );
}

function ReturnStep({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3 sm:gap-4">
      <span
        className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-background text-xs font-medium tabular-nums text-text"
        aria-hidden
      >
        {n}
      </span>
      <div className="min-w-0 flex-1 text-sm font-light leading-relaxed text-text-secondary [&_a]:break-words">
        {children}
      </div>
    </li>
  );
}

function QrSparkIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 7V5a2 2 0 012-2h2M21 7V5a2 2 0 00-2-2h-2M3 17v2a2 2 0 002 2h2M21 17v2a2 2 0 01-2 2h-2" />
      <path d="M7 12h.01M12 12h.01M17 12h.01M7 16h.01M12 16h.01M17 16h.01" strokeLinecap="round" />
      <rect x="7" y="7" width="5" height="5" rx="1" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function TruckIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M1 3h15v13H1z" />
      <path d="M16 8h4l3 3v5h-7V8z" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  );
}

function PackageSearchIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M16.5 9.4 7.55 4.24" />
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="M12 22V12" />
      <circle cx="18.5" cy="17.5" r="2.5" />
      <path d="M22 22 20.3 20.3" strokeLinecap="round" />
    </svg>
  );
}

function BadgeIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3.85 8.62a4 4 0 014.78-4.77 4 4 0 016.74 0 4 4 0 014.78 4.78 4 4 0 010 6.74 4 4 0 01-4.77 4.78 4 4 0 01-6.75 0 4 4 0 01-4.78-4.77 4 4 0 010-6.76z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function ReturnIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M9 14H4V9" />
      <path d="M4 14a10 10 0 107-7.41" />
    </svg>
  );
}

function HeadphonesIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 18v-6a9 9 0 0118 0v6" />
      <path d="M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3z" />
      <path d="M3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3z" />
    </svg>
  );
}
