export const revalidate = 3600;

export const metadata = {
  title: "Acuerdo de Orfebre",
  description:
    "Acuerdo de Orfebre de Casa Orfebre. Términos que regulan la relación entre los orfebres y la plataforma de joyería artesanal chilena.",
  alternates: { canonical: "/acuerdo-orfebre" },
  twitter: {
    card: "summary_large_image" as const,
    title: "Acuerdo de Orfebre | Casa Orfebre",
    description:
      "Acuerdo de Orfebre de Casa Orfebre. Términos que regulan la relación entre los orfebres y la plataforma.",
  },
};

export default function AcuerdoOrfebrePage() {
  return (
    <main className="bg-background px-4 py-16 sm:px-6 lg:px-8">
      <article className="mx-auto max-w-4xl">
        <h1 className="font-serif text-3xl font-light text-text sm:text-4xl">
          Acuerdo de Orfebre
        </h1>
        <p className="mt-4 text-sm text-text-tertiary">
          Versi&oacute;n 1.0 &mdash; Abril 2026
        </p>
        <p className="mt-4 text-sm italic font-light text-text-secondary">
          Este Acuerdo regula la relaci&oacute;n entre t&uacute; (el Orfebre) y
          Casa Orfebre (la Plataforma). Al aceptar este Acuerdo, te comprometes
          a cumplir con las obligaciones aqu&iacute; descritas. Si tienes dudas,
          escr&iacute;benos a contacto@casaorfebre.cl antes de aceptar.
        </p>

        <div className="mt-12 space-y-10 break-words text-base leading-relaxed sm:text-lg">
          {/* ── 1. Quiénes somos ── */}
          <section>
            <h2 className="mb-4 font-serif text-xl font-light text-text">
              1. Qui&eacute;nes somos y c&oacute;mo funciona esto
            </h2>
            <p className="mb-4 font-light text-text-secondary">
              1.1. Casa Orfebre es un marketplace de intermediaci&oacute;n.
              Nosotros conectamos a orfebres independientes con compradores.{" "}
              <strong className="font-medium text-text">
                No somos el vendedor
              </strong>{" "}
              de tus piezas: t&uacute; vendes directamente al comprador a
              trav&eacute;s de nuestra plataforma tecnol&oacute;gica.
            </p>
            <p className="mb-4 font-light text-text-secondary">
              1.2.{" "}
              <strong className="font-medium text-text">
                Eres independiente.
              </strong>{" "}
              Este Acuerdo no crea una relaci&oacute;n laboral, societaria ni de
              agencia entre t&uacute; y Casa Orfebre. T&uacute; manejas tu
              taller, tus horarios, tus precios y tus t&eacute;cnicas de manera
              aut&oacute;noma. No tienes exclusividad con la Plataforma: puedes
              vender en otros canales simult&aacute;neamente.
            </p>
            <p className="font-light text-text-secondary">
              1.3.{" "}
              <strong className="font-medium text-text">
                Eres persona natural o jur&iacute;dica.
              </strong>{" "}
              Si operas como persona natural (con o sin inicio de actividades en
              SII), o como empresa (EIRL, SPA, SpA, Ltda.), el presente Acuerdo
              aplica de la misma manera.
            </p>
          </section>

          {/* ── 2. Requisitos para vender ── */}
          <section>
            <h2 className="mb-4 font-serif text-xl font-light text-text">
              2. Requisitos para vender
            </h2>
            <p className="mb-4 font-light text-text-secondary">
              2.1.{" "}
              <strong className="font-medium text-text">
                Ser mayor de 18 a&ntilde;os
              </strong>{" "}
              y tener capacidad legal para celebrar contratos en Chile.
            </p>
            <p className="mb-2 font-light text-text-secondary">
              2.2.{" "}
              <strong className="font-medium text-text">
                Vender piezas de tu propia autor&iacute;a o taller.
              </strong>{" "}
              Cada pieza publicada en Casa Orfebre debe ser fabricada
              artesanalmente por ti o tu taller. Queda estrictamente prohibido:
            </p>
            <ul className="mb-4 list-disc space-y-2 pl-6 font-light text-text-secondary">
              <li>
                Revender piezas industriales o fabricadas en serie por terceros.
              </li>
              <li>
                Publicar piezas compradas a mayoristas o importadas como si
                fueran propias.
              </li>
              <li>
                Presentar fotograf&iacute;as de piezas que no correspondan al
                producto real que recibir&aacute; el comprador.
              </li>
            </ul>
            <p className="mb-4 font-light text-text-secondary">
              2.3.{" "}
              <strong className="font-medium text-text">
                Declarar materiales con veracidad.
              </strong>{" "}
              Los materiales que declares (tipo de metal, ley de la plata/oro,
              piedras, aleaciones) deben ser exactos. La declaraci&oacute;n
              falsa de materiales es causal de suspensi&oacute;n inmediata y
              puede dar lugar a acciones legales.
            </p>
            <p className="font-light text-text-secondary">
              2.4.{" "}
              <strong className="font-medium text-text">
                Mantener tus datos actualizados.
              </strong>{" "}
              Nombre, email, direcci&oacute;n, tel&eacute;fono y datos bancarios
              deben estar al d&iacute;a. Cualquier cambio debe actualizarse
              dentro de 5 d&iacute;as h&aacute;biles.
            </p>
          </section>

          {/* ── 3. Comisiones y pagos ── */}
          <section>
            <h2 className="mb-4 font-serif text-xl font-light text-text">
              3. Comisiones y pagos
            </h2>
            <p className="mb-4 font-light text-text-secondary">
              3.1.{" "}
              <strong className="font-medium text-text">
                Comisi&oacute;n por venta.
              </strong>{" "}
              Casa Orfebre cobra una comisi&oacute;n sobre cada venta realizada a
              trav&eacute;s de la Plataforma. La tasa de comisi&oacute;n depende
              de tu plan de membres&iacute;a:
            </p>
            <div className="mb-4 overflow-x-auto">
              <table className="w-full text-sm font-light text-text-secondary">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="pb-2 pr-8 font-medium text-text">Plan</th>
                    <th className="pb-2 font-medium text-text">
                      Comisi&oacute;n
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  <tr>
                    <td className="py-2 pr-8">Esencial (gratuito)</td>
                    <td className="py-2">18%</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-8">Artesano</td>
                    <td className="py-2">12%</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-8">Maestro</td>
                    <td className="py-2">9%</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mb-4 font-light text-text-secondary">
              La comisi&oacute;n se calcula sobre el precio de venta del producto
              (sin incluir el costo de env&iacute;o). Esta comisi&oacute;n ya
              incluye el costo de procesamiento de pagos de MercadoPago &mdash;
              t&uacute; no pagas comisi&oacute;n adicional de MercadoPago.
            </p>
            <p className="mb-4 font-light text-text-secondary">
              3.2.{" "}
              <strong className="font-medium text-text">
                Comisi&oacute;n personalizada.
              </strong>{" "}
              En casos excepcionales, Casa Orfebre podr&aacute; acordar una
              comisi&oacute;n personalizada diferente a la de tu plan. Esta se
              registrar&aacute; en tu cuenta y prevalecer&aacute; sobre la tasa
              est&aacute;ndar del plan.
            </p>
            <p className="mb-4 font-light text-text-secondary">
              3.3.{" "}
              <strong className="font-medium text-text">
                Retenci&oacute;n de fondos.
              </strong>{" "}
              Como medida de protecci&oacute;n al comprador, los fondos de cada
              venta son retenidos desde la fecha en que el comprador confirma la
              recepci&oacute;n del producto (o se auto-confirma a los 10
              d&iacute;as del despacho). El per&iacute;odo de retenci&oacute;n
              var&iacute;a seg&uacute;n tu plan:
            </p>
            <div className="mb-4 overflow-x-auto">
              <table className="w-full text-sm font-light text-text-secondary">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="pb-2 pr-8 font-medium text-text">Plan</th>
                    <th className="pb-2 font-medium text-text">
                      Fondos disponibles
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  <tr>
                    <td className="py-2 pr-8">Maestro</td>
                    <td className="py-2">
                      2 d&iacute;as despu&eacute;s de confirmar
                      recepci&oacute;n
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-8">Artesano</td>
                    <td className="py-2">
                      7 d&iacute;as despu&eacute;s de confirmar
                      recepci&oacute;n
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-8">Esencial</td>
                    <td className="py-2">
                      14 d&iacute;as despu&eacute;s de confirmar
                      recepci&oacute;n
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mb-4 font-light text-text-secondary">
              3.4.{" "}
              <strong className="font-medium text-text">
                Liberaci&oacute;n de fondos.
              </strong>{" "}
              Los fondos se liberan autom&aacute;ticamente a tu cuenta de
              MercadoPago una vez transcurrido el per&iacute;odo de
              retenci&oacute;n, siempre que no exista un reclamo o solicitud de
              devoluci&oacute;n pendiente sobre ese pedido.
            </p>
            <p className="mb-4 font-light text-text-secondary">
              3.5.{" "}
              <strong className="font-medium text-text">
                Devoluciones y comisiones.
              </strong>{" "}
              Si una venta resulta en devoluci&oacute;n con reembolso, Casa
              Orfebre devolver&aacute; la comisi&oacute;n cobrada sobre esa
              venta. Si el reembolso es parcial, la devoluci&oacute;n de
              comisi&oacute;n ser&aacute; proporcional.
            </p>
            <p className="mb-4 font-light text-text-secondary">
              3.6.{" "}
              <strong className="font-medium text-text">
                M&eacute;todo de pago.
              </strong>{" "}
              Todos los pagos se procesan a trav&eacute;s de MercadoPago. Para
              recibir pagos, debes conectar tu cuenta de MercadoPago a la
              Plataforma mediante el proceso OAuth que te indicaremos.
            </p>
            <p className="font-light text-text-secondary">
              3.7.{" "}
              <strong className="font-medium text-text">
                Cambios de comisi&oacute;n.
              </strong>{" "}
              Casa Orfebre podr&aacute; modificar las tasas de comisi&oacute;n
              con un preaviso m&iacute;nimo de 30 d&iacute;as calendario,
              notificado por email. Si no est&aacute;s de acuerdo, podr&aacute;s
              dar de baja tu cuenta sin penalizaci&oacute;n antes de que el
              cambio entre en vigor.
            </p>
          </section>

          {/* ── 4. Suscripciones y planes ── */}
          <section>
            <h2 className="mb-4 font-serif text-xl font-light text-text">
              4. Suscripciones y planes
            </h2>
            <p className="mb-4 font-light text-text-secondary">
              4.1.{" "}
              <strong className="font-medium text-text">
                Planes disponibles.
              </strong>{" "}
              Casa Orfebre ofrece planes de membres&iacute;a con distintos
              beneficios y niveles de servicio. Los detalles de cada plan
              (precio, l&iacute;mites, beneficios) est&aacute;n disponibles en
              la secci&oacute;n &quot;Plan&quot; de tu portal.
            </p>
            <p className="mb-4 font-light text-text-secondary">
              4.2.{" "}
              <strong className="font-medium text-text">
                Facturaci&oacute;n.
              </strong>{" "}
              El pago de la suscripci&oacute;n se realiza a trav&eacute;s de
              MercadoPago, con periodicidad mensual o anual seg&uacute;n tu
              elecci&oacute;n.
            </p>
            <p className="mb-4 font-light text-text-secondary">
              4.3.{" "}
              <strong className="font-medium text-text">
                Cambio de plan.
              </strong>{" "}
              Puedes subir de plan en cualquier momento. Si bajas de plan y
              tienes m&aacute;s productos activos que el l&iacute;mite del nuevo
              plan, tendr&aacute;s 7 d&iacute;as de gracia para seleccionar
              cu&aacute;les mantener activos. Los dem&aacute;s se
              pausar&aacute;n (no se eliminan).
            </p>
            <p className="font-light text-text-secondary">
              4.4.{" "}
              <strong className="font-medium text-text">
                Promociones y c&oacute;digos.
              </strong>{" "}
              Las condiciones especiales de c&oacute;digos promocionales (como
              el programa Pioneros) se detallan al momento de su uso y tienen
              vigencia limitada.
            </p>
          </section>

          {/* ── 5. Obligaciones ── */}
          <section>
            <h2 className="mb-4 font-serif text-xl font-light text-text">
              5. Tus obligaciones como orfebre
            </h2>
            <p className="mb-2 font-light text-text-secondary">
              5.1.{" "}
              <strong className="font-medium text-text">
                Calidad artesanal.
              </strong>{" "}
              Cada pieza debe cumplir con est&aacute;ndares m&iacute;nimos de
              calidad:
            </p>
            <ul className="mb-4 list-disc space-y-2 pl-6 font-light text-text-secondary">
              <li>
                Terminaci&oacute;n prolija (soldaduras limpias, engastes firmes,
                cierres funcionales).
              </li>
              <li>Materiales reales coincidentes con la declaraci&oacute;n.</li>
              <li>
                Fotograf&iacute;as reales del producto (no renders, no fotos de
                stock, no fotos de cat&aacute;logo de terceros).
              </li>
              <li>Descripciones honestas y completas.</li>
            </ul>
            <p className="mb-2 font-light text-text-secondary">
              5.2.{" "}
              <strong className="font-medium text-text">Despacho.</strong> Te
              comprometes a:
            </p>
            <ul className="mb-4 list-disc space-y-2 pl-6 font-light text-text-secondary">
              <li>
                Despachar cada pieza dentro de los{" "}
                <strong className="font-medium text-text">
                  3 d&iacute;as h&aacute;biles
                </strong>{" "}
                siguientes a la confirmaci&oacute;n del pedido (salvo piezas a
                medida, donde indicar&aacute;s el plazo de elaboraci&oacute;n).
              </li>
              <li>
                Embalar adecuadamente para proteger la pieza durante el
                transporte.
              </li>
              <li>
                Proporcionar un n&uacute;mero de seguimiento (tracking)
                v&aacute;lido al despachar.
              </li>
              <li>
                Usar un courier con cobertura y seguimiento (Chilexpress,
                Starken, Blue Express u otro de servicio equivalente).
              </li>
            </ul>
            <p className="mb-4 font-light text-text-secondary">
              5.3.{" "}
              <strong className="font-medium text-text">
                Atenci&oacute;n al comprador.
              </strong>{" "}
              Responder&aacute;s consultas y mensajes a trav&eacute;s de la
              Plataforma dentro de 48 horas h&aacute;biles. La
              comunicaci&oacute;n con compradores debe ser respetuosa y
              profesional.
            </p>
            <p className="mb-4 font-light text-text-secondary">
              5.4.{" "}
              <strong className="font-medium text-text">Devoluciones.</strong>{" "}
              Aceptar&aacute;s las devoluciones aprobadas por Casa Orfebre
              conforme a la pol&iacute;tica de devoluciones vigente. Al recibir
              un producto devuelto, confirmar&aacute;s su recepci&oacute;n
              dentro de 3 d&iacute;as h&aacute;biles.
            </p>
            <p className="font-light text-text-secondary">
              5.5.{" "}
              <strong className="font-medium text-text">
                Garant&iacute;a.
              </strong>{" "}
              Al publicar una pieza, puedes configurar la garant&iacute;a que
              ofreces. Si no configuras garant&iacute;a, se aplica la
              garant&iacute;a legal m&iacute;nima seg&uacute;n la Ley 19.496.
            </p>
          </section>

          {/* ── 6. Prohibiciones ── */}
          <section>
            <h2 className="mb-4 font-serif text-xl font-light text-text">
              6. Prohibiciones
            </h2>
            <p className="mb-2 font-light text-text-secondary">
              6.1.{" "}
              <strong className="font-medium text-text">
                Anti-intermediaci&oacute;n.
              </strong>{" "}
              Queda estrictamente prohibido:
            </p>
            <ul className="mb-4 list-disc space-y-2 pl-6 font-light text-text-secondary">
              <li>
                Solicitar, compartir u obtener datos de contacto personales del
                comprador (tel&eacute;fono, email, redes sociales,
                direcci&oacute;n) fuera de lo estrictamente necesario para el
                despacho.
              </li>
              <li>
                Invitar al comprador a realizar transacciones fuera de la
                Plataforma.
              </li>
              <li>
                Incluir materiales promocionales de otros canales de venta
                dentro del empaque.
              </li>
              <li>
                Intentar eludir los filtros de comunicaci&oacute;n de la
                Plataforma.
              </li>
            </ul>
            <p className="mb-4 font-light text-text-secondary">
              La Plataforma aplica filtros autom&aacute;ticos a las
              comunicaciones. Los datos de env&iacute;o (nombre y
              direcci&oacute;n) se proporcionan exclusivamente para el despacho
              del pedido.
            </p>
            <p className="mb-2 font-light text-text-secondary">
              6.2.{" "}
              <strong className="font-medium text-text">
                Productos prohibidos.
              </strong>{" "}
              No podr&aacute;s publicar:
            </p>
            <ul className="mb-4 list-disc space-y-2 pl-6 font-light text-text-secondary">
              <li>
                Piezas industriales, fabricadas en serie o importadas de
                cat&aacute;logos.
              </li>
              <li>
                Joyas con piedras o metales de procedencia ilegal o no
                declarada.
              </li>
              <li>Falsificaciones o r&eacute;plicas de marcas registradas.</li>
              <li>
                Productos que no sean joyer&iacute;a artesanal u
                orfebrer&iacute;a.
              </li>
            </ul>
            <p className="mb-2 font-light text-text-secondary">
              6.3.{" "}
              <strong className="font-medium text-text">
                Manipulaci&oacute;n.
              </strong>{" "}
              No podr&aacute;s:
            </p>
            <ul className="list-disc space-y-2 pl-6 font-light text-text-secondary">
              <li>Crear cuentas m&uacute;ltiples.</li>
              <li>
                Inflar artificialmente precios para luego
                &quot;rebajarlos&quot;.
              </li>
              <li>
                Publicar rese&ntilde;as falsas o incentivar rese&ntilde;as a
                cambio de beneficios.
              </li>
              <li>
                Manipular el sistema de b&uacute;squeda o ranking.
              </li>
            </ul>
          </section>

          {/* ── 7. Propiedad intelectual ── */}
          <section>
            <h2 className="mb-4 font-serif text-xl font-light text-text">
              7. Propiedad intelectual
            </h2>
            <p className="mb-4 font-light text-text-secondary">
              7.1.{" "}
              <strong className="font-medium text-text">
                Tu contenido es tuyo.
              </strong>{" "}
              T&uacute; retienes la propiedad intelectual de tus
              fotograf&iacute;as, descripciones, dise&ntilde;os y todo contenido
              que publiques en Casa Orfebre.
            </p>
            <p className="mb-2 font-light text-text-secondary">
              7.2.{" "}
              <strong className="font-medium text-text">
                Licencia a la Plataforma.
              </strong>{" "}
              Al publicar contenido, nos otorgas una licencia no exclusiva,
              gratuita, mundial y por el tiempo que dure nuestra relaci&oacute;n
              comercial, para:
            </p>
            <ul className="mb-4 list-disc space-y-2 pl-6 font-light text-text-secondary">
              <li>Exhibir tu contenido en la Plataforma.</li>
              <li>
                Usar tus fotograf&iacute;as y descripciones en nuestros canales
                de marketing (redes sociales, newsletters, publicidad digital).
              </li>
              <li>
                Redimensionar, optimizar y adaptar las im&aacute;genes para
                diferentes formatos.
              </li>
            </ul>
            <p className="mb-4 font-light text-text-secondary">
              7.3.{" "}
              <strong className="font-medium text-text">Tras tu baja.</strong>{" "}
              Si das de baja tu cuenta, retiraremos tu contenido de la
              Plataforma dentro de 30 d&iacute;as calendario. Podremos conservar
              copias de respaldo para fines legales y administrativos, pero no
              las usaremos con fines comerciales.
            </p>
            <p className="font-light text-text-secondary">
              7.4.{" "}
              <strong className="font-medium text-text">Originalidad.</strong>{" "}
              Declaras que todo contenido que publicas es de tu autor&iacute;a o
              tienes los derechos necesarios para publicarlo. Si un tercero
              reclama derechos sobre tu contenido, ser&aacute;s responsable de
              resolver la disputa y mantendr&aacute;s a Casa Orfebre libre de
              responsabilidad.
            </p>
          </section>

          {/* ── 8. Suspensión y baja ── */}
          <section>
            <h2 className="mb-4 font-serif text-xl font-light text-text">
              8. Suspensi&oacute;n y baja
            </h2>
            <p className="mb-2 font-light text-text-secondary">
              8.1.{" "}
              <strong className="font-medium text-text">
                Causales de suspensi&oacute;n.
              </strong>{" "}
              Casa Orfebre podr&aacute; suspender temporal o definitivamente tu
              cuenta en los siguientes casos:
            </p>
            <ul className="mb-4 list-disc space-y-2 pl-6 font-light text-text-secondary">
              <li>
                Venta de piezas que no sean artesanales o de tu
                autor&iacute;a.
              </li>
              <li>Declaraci&oacute;n falsa de materiales.</li>
              <li>
                Intentos reiterados de intermediaci&oacute;n o bypass.
              </li>
              <li>
                Incumplimiento reiterado de plazos de despacho (3 o m&aacute;s
                pedidos con demora en 90 d&iacute;as).
              </li>
              <li>
                Acumulaci&oacute;n de reclamos o devoluciones (tasa superior al
                15% en un trimestre).
              </li>
              <li>
                Conducta irrespetuosa o abusiva con compradores.
              </li>
              <li>
                Cualquier infracci&oacute;n grave a este Acuerdo o a la ley.
              </li>
            </ul>
            <p className="mb-2 font-light text-text-secondary">
              8.2.{" "}
              <strong className="font-medium text-text">Procedimiento.</strong>{" "}
              Antes de una suspensi&oacute;n definitiva, Casa Orfebre:
            </p>
            <ol className="mb-4 list-decimal space-y-2 pl-6 font-light text-text-secondary">
              <li>
                Te notificar&aacute; por email con detalle de la
                infracci&oacute;n.
              </li>
              <li>
                Te dar&aacute; 5 d&iacute;as h&aacute;biles para responder o
                corregir (salvo casos graves que justifiquen suspensi&oacute;n
                inmediata).
              </li>
              <li>
                Evaluar&aacute; tu respuesta y tomar&aacute; una decisi&oacute;n
                final.
              </li>
            </ol>
            <p className="mb-2 font-light text-text-secondary">
              8.3.{" "}
              <strong className="font-medium text-text">
                Fondos pendientes tras suspensi&oacute;n.
              </strong>{" "}
              Si tu cuenta es suspendida:
            </p>
            <ul className="mb-4 list-disc space-y-2 pl-6 font-light text-text-secondary">
              <li>
                Los pedidos en curso se completar&aacute;n normalmente.
              </li>
              <li>
                Los fondos retenidos que no tengan reclamo pendiente se
                liberar&aacute;n seg&uacute;n el calendario de tu plan.
              </li>
              <li>
                Los fondos asociados a reclamos o disputas quedar&aacute;n
                retenidos hasta la resoluci&oacute;n.
              </li>
            </ul>
            <p className="mb-2 font-light text-text-secondary">
              8.4.{" "}
              <strong className="font-medium text-text">
                Baja voluntaria.
              </strong>{" "}
              Puedes dar de baja tu cuenta en cualquier momento notificando a
              contacto@casaorfebre.cl con 15 d&iacute;as de
              anticipaci&oacute;n. Deber&aacute;s:
            </p>
            <ul className="mb-4 list-disc space-y-2 pl-6 font-light text-text-secondary">
              <li>Completar todos los pedidos pendientes.</li>
              <li>
                Resolver o aceptar las devoluciones en curso.
              </li>
              <li>
                Desconectar tu cuenta de MercadoPago una vez liberados todos los
                fondos.
              </li>
            </ul>
            <p className="mb-2 font-light text-text-secondary">
              8.5.{" "}
              <strong className="font-medium text-text">
                Efecto de la baja.
              </strong>{" "}
              Al darte de baja:
            </p>
            <ul className="list-disc space-y-2 pl-6 font-light text-text-secondary">
              <li>Tus productos se despublicar&aacute;n.</li>
              <li>
                Tu perfil dejar&aacute; de ser visible en la Plataforma.
              </li>
              <li>
                Los certificados de autenticidad emitidos seguir&aacute;n siendo
                verificables.
              </li>
              <li>
                La suscripci&oacute;n vigente no ser&aacute; reembolsada por el
                per&iacute;odo restante.
              </li>
            </ul>
          </section>

          {/* ── 9. Responsabilidad tributaria ── */}
          <section>
            <h2 className="mb-4 font-serif text-xl font-light text-text">
              9. Responsabilidad tributaria
            </h2>
            <p className="mb-2 font-light text-text-secondary">
              9.1.{" "}
              <strong className="font-medium text-text">
                T&uacute; eres responsable.
              </strong>{" "}
              Como vendedor independiente, eres el &uacute;nico responsable de
              cumplir con tus obligaciones tributarias ante el Servicio de
              Impuestos Internos (SII), incluyendo:
            </p>
            <ul className="mb-4 list-disc space-y-2 pl-6 font-light text-text-secondary">
              <li>
                Emitir boleta o factura al comprador si corresponde seg&uacute;n
                tu situaci&oacute;n tributaria.
              </li>
              <li>
                Declarar y pagar el IVA si eres contribuyente de este impuesto.
              </li>
              <li>
                Declarar los ingresos obtenidos a trav&eacute;s de la Plataforma
                en tus declaraciones de impuestos.
              </li>
              <li>
                Realizar inicio de actividades en el SII si corresponde
                seg&uacute;n el volumen de tus ventas.
              </li>
            </ul>
            <p className="mb-4 font-light text-text-secondary">
              9.2.{" "}
              <strong className="font-medium text-text">
                Casa Orfebre como intermediario.
              </strong>{" "}
              Casa Orfebre no act&uacute;a como agente de retenci&oacute;n de
              impuestos. La comisi&oacute;n cobrada por Casa Orfebre corresponde
              a un servicio de intermediaci&oacute;n tecnol&oacute;gica.
            </p>
            <p className="mb-4 font-light text-text-secondary">
              9.3.{" "}
              <strong className="font-medium text-text">
                Documentaci&oacute;n.
              </strong>{" "}
              Casa Orfebre pondr&aacute; a tu disposici&oacute;n un resumen
              mensual de tus ventas, comisiones y pagos netos para facilitar tu
              gesti&oacute;n tributaria. Este resumen no constituye un documento
              tributario.
            </p>
            <p className="font-light text-text-secondary">
              9.4.{" "}
              <strong className="font-medium text-text">
                Facturaci&oacute;n de la comisi&oacute;n.
              </strong>{" "}
              Casa Orfebre emitir&aacute; el documento tributario correspondiente
              (boleta o factura) por el servicio de intermediaci&oacute;n
              cobrado, seg&uacute;n la normativa vigente.
            </p>
          </section>

          {/* ── 10. Protección de datos ── */}
          <section>
            <h2 className="mb-4 font-serif text-xl font-light text-text">
              10. Protecci&oacute;n de datos
            </h2>
            <p className="mb-2 font-light text-text-secondary">
              10.1.{" "}
              <strong className="font-medium text-text">
                Datos del comprador.
              </strong>{" "}
              Los datos personales del comprador (nombre, direcci&oacute;n de
              env&iacute;o) que recibes para cumplir con el despacho son
              confidenciales. Solo podr&aacute;s usarlos para el fin de enviar
              el pedido correspondiente. Queda prohibido:
            </p>
            <ul className="mb-4 list-disc space-y-2 pl-6 font-light text-text-secondary">
              <li>
                Almacenar datos de compradores fuera de la Plataforma.
              </li>
              <li>Contactar compradores por canales externos.</li>
              <li>Compartir datos de compradores con terceros.</li>
              <li>Usar datos de compradores para marketing propio.</li>
            </ul>
            <p className="mb-4 font-light text-text-secondary">
              10.2.{" "}
              <strong className="font-medium text-text">Tus datos.</strong> Casa
              Orfebre tratar&aacute; tus datos personales conforme a la
              Pol&iacute;tica de Privacidad disponible en
              casaorfebre.cl/privacidad.
            </p>
            <p className="font-light text-text-secondary">
              10.3.{" "}
              <strong className="font-medium text-text">Ley aplicable.</strong>{" "}
              El tratamiento de datos personales se rige por la Ley N&deg;
              19.628 sobre Protecci&oacute;n de la Vida Privada.
            </p>
          </section>

          {/* ── 11. Modificaciones ── */}
          <section>
            <h2 className="mb-4 font-serif text-xl font-light text-text">
              11. Modificaciones
            </h2>
            <p className="mb-4 font-light text-text-secondary">
              11.1. Casa Orfebre podr&aacute; modificar este Acuerdo con un
              preaviso m&iacute;nimo de 15 d&iacute;as calendario, notificado
              por email. Si la modificaci&oacute;n es sustancial (cambio de
              comisiones, cambio de pol&iacute;tica de retenci&oacute;n, cambio
              de obligaciones), el preaviso ser&aacute; de 30 d&iacute;as.
            </p>
            <p className="mb-4 font-light text-text-secondary">
              11.2. Si no est&aacute;s de acuerdo con los nuevos
              t&eacute;rminos, podr&aacute;s dar de baja tu cuenta antes de que
              entren en vigor, sin penalizaci&oacute;n.
            </p>
            <p className="font-light text-text-secondary">
              11.3. El uso continuado de la Plataforma tras la entrada en vigor
              constituye aceptaci&oacute;n del Acuerdo modificado.
            </p>
          </section>

          {/* ── 12. Ley aplicable y jurisdicción ── */}
          <section>
            <h2 className="mb-4 font-serif text-xl font-light text-text">
              12. Ley aplicable y jurisdicci&oacute;n
            </h2>
            <p className="mb-2 font-light text-text-secondary">
              12.1. Este Acuerdo se rige por las leyes de la Rep&uacute;blica de
              Chile, en particular:
            </p>
            <ul className="mb-4 list-disc space-y-2 pl-6 font-light text-text-secondary">
              <li>
                Ley N&deg; 19.496 sobre Protecci&oacute;n de los Derechos de los
                Consumidores.
              </li>
              <li>C&oacute;digo Civil y C&oacute;digo de Comercio.</li>
              <li>
                Ley N&deg; 19.628 sobre Protecci&oacute;n de la Vida Privada.
              </li>
              <li>Ley N&deg; 20.169 sobre Competencia Desleal.</li>
            </ul>
            <p className="mb-4 font-light text-text-secondary">
              12.2. Para la resoluci&oacute;n de cualquier controversia, las
              partes se someten a la jurisdicci&oacute;n de los tribunales
              ordinarios de la ciudad de Santiago de Chile.
            </p>
            <p className="font-light text-text-secondary">
              12.3. Este Acuerdo no limita los derechos del consumidor final
              conforme a la Ley 19.496.
            </p>
          </section>

          {/* ── 13. Contacto ── */}
          <section>
            <h2 className="mb-4 font-serif text-xl font-light text-text">
              13. Contacto
            </h2>
            <p className="font-light text-text-secondary">
              Para consultas sobre este Acuerdo: contacto@casaorfebre.cl
            </p>
          </section>

          {/* ── Declaración final ── */}
          <section className="border-t border-border pt-8">
            <p className="text-sm italic font-light text-text-tertiary">
              Al aceptar este Acuerdo, declaro que he le&iacute;do y comprendido
              todas sus cl&aacute;usulas, y me comprometo a cumplir con las
              obligaciones aqu&iacute; establecidas.
            </p>
            <p className="mt-2 text-sm italic font-light text-text-tertiary">
              Fecha de aceptaci&oacute;n: registrada autom&aacute;ticamente.
            </p>
          </section>
        </div>
      </article>
    </main>
  );
}
