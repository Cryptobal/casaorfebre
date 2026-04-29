export const revalidate = 3600;
export const dynamic = "force-static";

export const metadata = {
  title: "Política de Devoluciones",
  description:
    "Política de devoluciones de Casa Orfebre: 14 días para solicitar la devolución, condiciones, costos de envío y plazos de reembolso.",
  alternates: { canonical: "/politica-devoluciones" },
  twitter: {
    card: "summary_large_image" as const,
    title: "Política de Devoluciones | Casa Orfebre",
    description:
      "14 días para devolver tu compra. Reembolso íntegro al medio de pago original.",
  },
};

export default function PoliticaDevolucionesPage() {
  return (
    <main className="bg-background px-4 py-16 sm:px-6 lg:px-8">
      <article className="mx-auto max-w-4xl">
        <h1 className="font-serif text-3xl font-light text-text sm:text-4xl">
          Política de Devoluciones
        </h1>
        <p className="mt-4 text-sm text-text-tertiary">
          Última actualización: 27 de abril de 2026
        </p>

        <div className="mt-12 space-y-10 break-words text-base leading-relaxed sm:text-lg">
          {/* ── 1. Plazo y solicitud ── */}
          <section>
            <h2 className="mb-4 font-serif text-xl font-light text-text">
              1. Plazo para solicitar una devolución
            </h2>
            <p className="mb-4 font-light text-text-secondary">
              El comprador dispone de un plazo de 14 (catorce) días calendario
              contados desde la recepción efectiva de la pieza para solicitar
              una devolución. La solicitud deberá realizarse a través del
              portal de comprador en Casa Orfebre, indicando el motivo de la
              devolución y adjuntando fotografías del producto recibido.
            </p>
            <p className="font-light text-text-secondary">
              Este plazo aplica a todas las compras realizadas en el sitio
              casaorfebre.cl con destino dentro de Chile.
            </p>
          </section>

          {/* ── 2. Condiciones para que la devolución sea procedente ── */}
          <section>
            <h2 className="mb-4 font-serif text-xl font-light text-text">
              2. Condiciones para que la devolución sea procedente
            </h2>
            <p className="mb-4 font-light text-text-secondary">
              Para que la devolución sea procedente, la pieza debe encontrarse
              en su estado original, sin uso, sin alteraciones y con todos sus
              embalajes y accesorios (certificados, estuches, etiquetas).
            </p>
            <p className="font-light text-text-secondary">
              No serán admitidas devoluciones de piezas personalizadas o hechas
              a medida, salvo que presenten defectos de fabricación.
            </p>
          </section>

          {/* ── 3. Costos del envío de devolución ── */}
          <section>
            <h2 className="mb-4 font-serif text-xl font-light text-text">
              3. Costos del envío de devolución
            </h2>
            <p className="mb-4 font-light text-text-secondary">
              En caso de devolución por defecto del producto (pieza dañada,
              materiales diferentes a los declarados, defectos de fabricación),
              el costo del envío de devolución será asumido por el orfebre.
            </p>
            <p className="font-light text-text-secondary">
              En caso de devolución por derecho de retracto o arrepentimiento
              del comprador, el costo del envío de devolución será de cargo del
              comprador.
            </p>
          </section>

          {/* ── 4. Plazo y forma del reembolso ── */}
          <section>
            <h2 className="mb-4 font-serif text-xl font-light text-text">
              4. Plazo y forma del reembolso
            </h2>
            <p className="font-light text-text-secondary">
              Una vez recibida la pieza devuelta por el orfebre y verificado su
              estado, Casa Orfebre procederá a gestionar el reembolso al
              comprador a través de Mercado Pago dentro de los 10 (diez) días
              hábiles siguientes. El reembolso se realizará por el mismo medio
              de pago utilizado en la compra original.
            </p>
          </section>

          {/* ── 5. Reembolso por envíos no recibidos ── */}
          <section>
            <h2 className="mb-4 font-serif text-xl font-light text-text">
              5. Reembolso por envíos no recibidos
            </h2>
            <p className="mb-4 font-light text-text-secondary">
              Casa Orfebre procesa el reembolso íntegro de pedidos no recibidos
              una vez confirmada una de las siguientes situaciones objetivas:
            </p>
            <ol className="mb-4 list-decimal space-y-2 pl-6 font-light text-text-secondary">
              <li>
                Devolución a remitente (RTS) confirmada por el courier y
                recepción de la pieza por el orfebre.
              </li>
              <li>
                Acta formal de extravío emitida por la empresa de transporte y
                activación del seguro del envío.
              </li>
              <li>
                Recepción del paquete por el comprador y devolución dentro del
                plazo de 14 días establecido en la presente garantía.
              </li>
            </ol>
            <p className="font-light text-text-secondary">
              El plazo estimado entre la confirmación de cualquiera de estas
              situaciones y el procesamiento del reembolso al medio de pago
              original es de 5 a 7 días hábiles. Casa Orfebre gestiona la
              totalidad del proceso con el courier sin intervención adicional
              del comprador.
            </p>
          </section>

          {/* ── 6. Productos dañados durante el transporte ── */}
          <section>
            <h2 className="mb-4 font-serif text-xl font-light text-text">
              6. Productos dañados durante el transporte
            </h2>
            <p className="font-light text-text-secondary">
              Si la pieza llega dañada, el comprador deberá reportar la
              situación con fotografías dentro de las 48 horas siguientes a la
              recepción. Casa Orfebre evaluará el caso y gestionará el
              reembolso o reenvío según corresponda. Si el daño se debe a
              empaque insuficiente, el costo recae en el orfebre. Si el daño
              es atribuible al courier, Casa Orfebre apoya al orfebre en el
              reclamo ante la empresa de transporte.
            </p>
          </section>

          {/* ── 7. Cómo solicitar una devolución ── */}
          <section>
            <h2 className="mb-4 font-serif text-xl font-light text-text">
              7. Cómo solicitar una devolución
            </h2>
            <ol className="list-decimal space-y-2 pl-6 font-light text-text-secondary">
              <li>
                Ingresa a tu portal de comprador en casaorfebre.cl y abre el
                pedido correspondiente.
              </li>
              <li>
                Selecciona la opción para iniciar una devolución o disputa,
                indica el motivo y adjunta las fotografías que respalden tu
                solicitud.
              </li>
              <li>
                Recibirás instrucciones para enviar la pieza al orfebre. Una
                vez verificado el estado, gestionamos el reembolso por el
                mismo medio de pago.
              </li>
            </ol>
          </section>

          {/* ── 8. Contacto ── */}
          <section>
            <h2 className="mb-4 font-serif text-xl font-light text-text">
              8. Contacto
            </h2>
            <p className="mb-4 font-light text-text-secondary">
              Para cualquier consulta sobre esta política o sobre una
              devolución en curso, puedes escribirnos a:
            </p>
            <p className="font-light text-text-secondary">
              Correo electrónico:{" "}
              <a
                href="mailto:contacto@casaorfebre.cl"
                className="text-accent underline-offset-2 hover:underline"
              >
                contacto@casaorfebre.cl
              </a>
            </p>
            <p className="mt-6 text-sm font-light text-text-tertiary">
              Esta política forma parte de los{" "}
              <a
                href="/terminos"
                className="text-accent underline-offset-2 hover:underline"
              >
                Términos y Condiciones
              </a>{" "}
              de Casa Orfebre.
            </p>
          </section>
        </div>
      </article>
    </main>
  );
}
