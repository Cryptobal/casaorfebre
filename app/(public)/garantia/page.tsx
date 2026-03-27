import { SectionHeading } from "@/components/shared/section-heading";
import { FadeIn } from "@/components/shared/fade-in";

export const metadata = {
  title: "Garantía",
  description:
    "Garantía de compra segura, envío protegido y política de devoluciones de Casa Orfebre.",
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
    <div className="mx-auto max-w-3xl px-4 pb-24 sm:px-6 lg:px-8">
      {/* ─── Hero ─── */}
      <section className="pt-20 pb-16 text-center">
        <FadeIn>
          <SectionHeading
            title="Garantía Casa Orfebre"
            subtitle="Tu compra está protegida de principio a fin"
          />
        </FadeIn>
      </section>

      <div className="space-y-0 divide-y divide-border">
        {/* ─── 1. Garantía de Compra Segura ─── */}
        <section className="py-16">
          <FadeIn>
            <div className="flex flex-col items-center text-center">
              <div className="text-accent">
                <ShieldIcon />
              </div>
              <h2 className="mt-6 font-serif text-2xl font-light text-text sm:text-3xl">
                Garantía de Compra Segura
              </h2>
              <ul className="mt-8 space-y-4 text-left text-sm font-light leading-relaxed text-text-secondary">
                <BulletItem>
                  <strong className="font-medium text-text">Pago protegido:</strong> toda transacción pasa por Mercado Pago — nunca transfieres a una cuenta desconocida.
                </BulletItem>
                <BulletItem>
                  Si el producto <strong className="font-medium text-text">no llega</strong>: reembolso completo.
                </BulletItem>
                <BulletItem>
                  Si llega algo <strong className="font-medium text-text">distinto a lo publicado</strong>: reembolso completo.
                </BulletItem>
                <BulletItem>
                  Si llega <strong className="font-medium text-text">dañado</strong>: reembolso completo o reposición, a tu elección.
                </BulletItem>
                <BulletItem>
                  Plazo para reclamar: <strong className="font-medium text-text">14 días</strong> desde la entrega confirmada.
                </BulletItem>
              </ul>
            </div>
          </FadeIn>
        </section>

        {/* ─── 2. Garantía de Envío ─── */}
        <section className="py-16">
          <FadeIn>
            <div className="flex flex-col items-center text-center">
              <div className="text-accent">
                <TruckIcon />
              </div>
              <h2 className="mt-6 font-serif text-2xl font-light text-text sm:text-3xl">
                Garantía de Envío
              </h2>
              <ul className="mt-8 space-y-4 text-left text-sm font-light leading-relaxed text-text-secondary">
                <BulletItem>
                  Todos los envíos incluyen <strong className="font-medium text-text">número de seguimiento obligatorio</strong>.
                </BulletItem>
                <BulletItem>
                  Plazo máximo de despacho: <strong className="font-medium text-text">5 días hábiles</strong> desde la confirmación de pago.
                </BulletItem>
                <BulletItem>
                  Si el orfebre no despacha en plazo: <strong className="font-medium text-text">cancelación automática + reembolso completo</strong>.
                </BulletItem>
                <BulletItem>
                  Si el paquete se pierde en tránsito: <strong className="font-medium text-text">reembolso completo</strong>.
                </BulletItem>
              </ul>
            </div>
          </FadeIn>
        </section>

        {/* ─── 3. Garantía de Calidad ─── */}
        <section className="py-16">
          <FadeIn>
            <div className="flex flex-col items-center text-center">
              <div className="text-accent">
                <BadgeIcon />
              </div>
              <h2 className="mt-6 font-serif text-2xl font-light text-text sm:text-3xl">
                Garantía de Calidad
              </h2>
              <ul className="mt-8 space-y-4 text-left text-sm font-light leading-relaxed text-text-secondary">
                <BulletItem>
                  Todos los orfebres son <strong className="font-medium text-text">verificados</strong> antes de publicar en la plataforma.
                </BulletItem>
                <BulletItem>
                  Todos los productos pasan por un proceso de <strong className="font-medium text-text">aprobación editorial</strong>.
                </BulletItem>
                <BulletItem>
                  Los materiales declarados en cada pieza son responsabilidad del orfebre.
                </BulletItem>
                <BulletItem>
                  <strong className="font-medium text-text">Certificado de autenticidad digital</strong> incluido con cada pieza, verificable por QR.
                </BulletItem>
              </ul>
            </div>
          </FadeIn>
        </section>

        {/* ─── 4. Política de Devoluciones ─── */}
        <section className="py-16">
          <FadeIn>
            <div className="flex flex-col items-center text-center">
              <div className="text-accent">
                <ReturnIcon />
              </div>
              <h2 className="mt-6 font-serif text-2xl font-light text-text sm:text-3xl">
                Política de Devoluciones
              </h2>

              <div className="mt-8 w-full space-y-6 text-left">
                {/* Product types */}
                <div className="space-y-3">
                  <p className="text-sm font-light text-text-secondary">
                    <strong className="font-medium text-text">Productos estándar:</strong>{" "}
                    14 días desde la entrega para solicitar devolución.
                  </p>
                  <p className="text-sm font-light text-text-secondary">
                    <strong className="font-medium text-accent">Productos personalizados (a pedido):</strong>{" "}
                    NO admiten devolución. Esta condición se informa claramente antes de confirmar la compra.
                  </p>
                </div>

                {/* Conditions */}
                <div className="space-y-2">
                  <p className="text-xs font-medium uppercase tracking-widest text-text-tertiary">
                    Condiciones
                  </p>
                  <ul className="space-y-3">
                    <BulletItem>El producto debe estar <strong className="font-medium text-text">sin uso</strong> y en su <strong className="font-medium text-text">empaque original</strong>.</BulletItem>
                  </ul>
                </div>

                {/* Shipping cost */}
                <div className="space-y-2">
                  <p className="text-xs font-medium uppercase tracking-widest text-text-tertiary">
                    ¿Quién paga el envío de devolución?
                  </p>
                  <ul className="space-y-3">
                    <BulletItem>
                      <strong className="font-medium text-text">La plataforma paga</strong> si el error es del orfebre: producto que no coincide con la descripción, pieza dañada, envío equivocado o defecto de fabricación.
                    </BulletItem>
                    <BulletItem>
                      <strong className="font-medium text-text">El comprador paga</strong> si la devolución es por arrepentimiento.
                    </BulletItem>
                  </ul>
                </div>

                {/* Flow */}
                <div className="space-y-2">
                  <p className="text-xs font-medium uppercase tracking-widest text-text-tertiary">
                    Flujo de devolución
                  </p>
                  <div className="flex flex-wrap items-center gap-2 text-sm font-light text-text-secondary">
                    <FlowStep>Solicitar</FlowStep>
                    <FlowArrow />
                    <FlowStep>Admin revisa</FlowStep>
                    <FlowArrow />
                    <FlowStep>Aprueba</FlowStep>
                    <FlowArrow />
                    <FlowStep>Envío de vuelta</FlowStep>
                    <FlowArrow />
                    <FlowStep>Reembolso</FlowStep>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        </section>

        {/* ─── 5. Soporte al Cliente ─── */}
        <section className="py-16">
          <FadeIn>
            <div className="flex flex-col items-center text-center">
              <div className="text-accent">
                <HeadphonesIcon />
              </div>
              <h2 className="mt-6 font-serif text-2xl font-light text-text sm:text-3xl">
                Soporte al Cliente
              </h2>
              <ul className="mt-8 space-y-4 text-left text-sm font-light leading-relaxed text-text-secondary">
                <BulletItem>
                  Email:{" "}
                  <a
                    href="mailto:soporte@casaorfebre.cl"
                    className="text-accent transition-colors hover:text-accent-dark"
                  >
                    soporte@casaorfebre.cl
                  </a>
                </BulletItem>
                <BulletItem>
                  Tiempo de respuesta: <strong className="font-medium text-text">24 horas hábiles</strong>.
                </BulletItem>
                <BulletItem>
                  La plataforma <strong className="font-medium text-text">siempre media</strong> entre comprador y orfebre para garantizar una resolución justa.
                </BulletItem>
              </ul>
            </div>
          </FadeIn>
        </section>
      </div>
    </div>
  );
}

/* ─── Layout helpers ─── */

function BulletItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent" />
      <span>{children}</span>
    </li>
  );
}

function FlowStep({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-border px-3 py-1 text-xs font-medium text-text">
      {children}
    </span>
  );
}

function FlowArrow() {
  return <span className="text-text-tertiary">&rarr;</span>;
}

/* ─── Icons ─── */

function ShieldIcon() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function TruckIcon() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M1 3h15v13H1z" />
      <path d="M16 8h4l3 3v5h-7V8z" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  );
}

function BadgeIcon() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3.85 8.62a4 4 0 014.78-4.77 4 4 0 016.74 0 4 4 0 014.78 4.78 4 4 0 010 6.74 4 4 0 01-4.77 4.78 4 4 0 01-6.75 0 4 4 0 01-4.78-4.77 4 4 0 010-6.76z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function ReturnIcon() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 14H4V9" />
      <path d="M4 14a10 10 0 107-7.41" />
    </svg>
  );
}

function HeadphonesIcon() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 18v-6a9 9 0 0118 0v6" />
      <path d="M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3z" />
      <path d="M3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3z" />
    </svg>
  );
}
