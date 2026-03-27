export const metadata = {
  title: "Términos y Condiciones",
  description:
    "Términos y condiciones de uso de Casa Orfebre, marketplace de joyería artesanal chilena. Conoce tus derechos y obligaciones como usuario.",
  alternates: { canonical: "/terminos" },
  twitter: {
    card: "summary_large_image" as const,
    title: "Términos y Condiciones | Casa Orfebre",
    description:
      "Términos y condiciones de uso de Casa Orfebre, marketplace de joyería artesanal chilena.",
  },
};

export default function TerminosPage() {
  return (
    <main className="bg-background px-4 py-16 sm:px-6 lg:px-8">
      <article className="mx-auto max-w-4xl">
        <h1 className="font-serif text-3xl font-light text-text sm:text-4xl">
          Términos y Condiciones
        </h1>
        <p className="mt-4 text-sm text-text-tertiary">
          Última actualización: 26 de marzo de 2026
        </p>

        <div className="mt-12 space-y-10 break-words text-base leading-relaxed sm:text-lg">
          {/* ── 1. Definiciones ── */}
          <section>
            <h2 className="mb-4 font-serif text-xl font-light text-text">
              1. Definiciones
            </h2>
            <p className="mb-4 font-light text-text-secondary">
              Para los efectos de estos Términos y Condiciones, los siguientes
              conceptos tendrán el significado que a continuación se indica:
            </p>
            <ul className="list-disc space-y-2 pl-6 font-light text-text-secondary">
              <li>
                <strong className="font-medium text-text">Casa Orfebre</strong>{" "}
                (en adelante, &quot;la Plataforma&quot; o &quot;el
                Marketplace&quot;): plataforma digital de intermediación
                comercial operada bajo el dominio casaorfebre.cl, cuyo objeto es
                conectar orfebres independientes chilenos con compradores
                interesados en joyería artesanal.
              </li>
              <li>
                <strong className="font-medium text-text">Orfebre</strong>:
                persona natural o jurídica que se registra en Casa Orfebre como
                vendedor para ofrecer y comercializar piezas de joyería
                artesanal de su propia autoría o taller.
              </li>
              <li>
                <strong className="font-medium text-text">Comprador</strong>:
                persona natural o jurídica que utiliza la Plataforma para
                adquirir piezas de joyería artesanal ofrecidas por los orfebres
                registrados.
              </li>
              <li>
                <strong className="font-medium text-text">Plataforma</strong>:
                el sitio web casaorfebre.cl, incluyendo todas sus páginas,
                funcionalidades, aplicaciones asociadas y servicios digitales.
              </li>
              <li>
                <strong className="font-medium text-text">Pieza</strong>:
                cualquier artículo de joyería artesanal, orfebrería o accesorio
                elaborado de manera manual o semi-manual por un orfebre
                registrado en la Plataforma.
              </li>
            </ul>
          </section>

          {/* ── 2. Naturaleza del servicio ── */}
          <section>
            <h2 className="mb-4 font-serif text-xl font-light text-text">
              2. Naturaleza del servicio
            </h2>
            <p className="mb-4 font-light text-text-secondary">
              Casa Orfebre opera exclusivamente como un marketplace de
              intermediación. Esto significa que Casa Orfebre no es el vendedor
              directo de las piezas publicadas en la Plataforma, no posee
              inventario propio ni participa en la fabricación, almacenamiento o
              envío de los productos.
            </p>
            <p className="mb-4 font-light text-text-secondary">
              La función de Casa Orfebre consiste en proporcionar la
              infraestructura tecnológica que permite a orfebres independientes
              publicar sus creaciones y a compradores descubrirlas, evaluarlas y
              adquirirlas. La relación comercial de compraventa se establece
              directamente entre el orfebre y el comprador; Casa Orfebre actúa
              como facilitador de dicha transacción.
            </p>
            <p className="font-light text-text-secondary">
              Al utilizar la Plataforma, tanto orfebres como compradores
              declaran conocer y aceptar esta naturaleza de intermediación y
              reconocen que Casa Orfebre no asume responsabilidad como vendedor
              ni como fabricante de las piezas.
            </p>
          </section>

          {/* ── 3. Registro y cuentas de usuario ── */}
          <section>
            <h2 className="mb-4 font-serif text-xl font-light text-text">
              3. Registro y cuentas de usuario
            </h2>
            <p className="mb-4 font-light text-text-secondary">
              Para realizar compras o publicar piezas en Casa Orfebre, el
              usuario debe crear una cuenta proporcionando información veraz,
              completa y actualizada. Es responsabilidad exclusiva del usuario
              mantener la confidencialidad de sus credenciales de acceso y
              notificar de inmediato a Casa Orfebre cualquier uso no autorizado
              de su cuenta.
            </p>
            <p className="mb-4 font-light text-text-secondary">
              El usuario declara ser mayor de 18 años o contar con la
              autorización de su representante legal. Al registrarse, el usuario
              acepta que los datos proporcionados podrán ser verificados por Casa
              Orfebre, y que la Plataforma se reserva el derecho de suspender o
              eliminar cuentas que contengan información falsa, incompleta o que
              infrinjan estos Términos.
            </p>
            <p className="font-light text-text-secondary">
              Los orfebres que deseen vender en la Plataforma deberán completar
              un proceso de postulación que incluye la verificación de su
              identidad, la descripción de su taller y técnicas, y la
              presentación de un portafolio inicial de sus creaciones. Casa
              Orfebre se reserva el derecho de aceptar o rechazar postulaciones
              según sus criterios de curación.
            </p>
          </section>

          {/* ── 4. Proceso de compra ── */}
          <section>
            <h2 className="mb-4 font-serif text-xl font-light text-text">
              4. Proceso de compra
            </h2>
            <p className="mb-4 font-light text-text-secondary">
              El proceso de compra en Casa Orfebre se realiza de la siguiente
              manera: el comprador selecciona la o las piezas de su interés, las
              agrega al carrito de compras y procede al pago a través de los
              medios habilitados en la Plataforma. Una vez confirmado el pago, se
              genera una orden de compra que es notificada tanto al comprador
              como al orfebre correspondiente.
            </p>
            <p className="mb-4 font-light text-text-secondary">
              El orfebre es responsable de confirmar la disponibilidad de la
              pieza dentro de las 48 horas hábiles siguientes a la recepción de
              la orden. En caso de que la pieza no esté disponible, el orfebre
              deberá informar a Casa Orfebre para gestionar la cancelación del
              pedido y el reembolso íntegro al comprador.
            </p>
            <p className="font-light text-text-secondary">
              Una vez confirmada la disponibilidad, el orfebre procede a preparar
              y embalar la pieza para su despacho. Los precios publicados en la
              Plataforma incluyen IVA cuando corresponda según la normativa
              tributaria vigente en Chile. El precio final de la transacción será
              el exhibido al momento de confirmar la compra, incluyendo los
              costos de envío aplicables.
            </p>
          </section>

          {/* ── 5. Pagos y comisiones ── */}
          <section>
            <h2 className="mb-4 font-serif text-xl font-light text-text">
              5. Pagos y comisiones
            </h2>
            <p className="mb-4 font-light text-text-secondary">
              Todos los pagos realizados en Casa Orfebre son procesados a través
              de Mercado Pago, plataforma de pagos que cumple con los estándares
              de seguridad PCI-DSS. Casa Orfebre no almacena ni tiene acceso a
              los datos de tarjetas de crédito o débito de los compradores.
            </p>
            <p className="mb-4 font-light text-text-secondary">
              Casa Orfebre cobra una comisión del 18% (dieciocho por ciento)
              sobre el valor de cada venta realizada a través de la Plataforma.
              Esta comisión es descontada automáticamente del monto recibido
              antes de la transferencia al orfebre. Dicha comisión cubre los
              costos de operación de la Plataforma, procesamiento de pagos,
              soporte al cliente, infraestructura tecnológica y acciones de
              marketing.
            </p>
            <p className="font-light text-text-secondary">
              Como medida de protección al comprador, los fondos de cada venta
              son retenidos por un período de 14 (catorce) días calendario
              contados desde la confirmación de entrega del pedido. Transcurrido
              este plazo sin que se haya iniciado un reclamo o solicitud de
              devolución, los fondos son liberados y transferidos al orfebre
              según el calendario de pagos vigente.
            </p>
          </section>

          {/* ── 6. Envíos y entregas ── */}
          <section>
            <h2 className="mb-4 font-serif text-xl font-light text-text">
              6. Envíos y entregas
            </h2>
            <p className="mb-4 font-light text-text-secondary">
              El despacho de las piezas es responsabilidad directa de cada
              orfebre, quien se compromete a embalar adecuadamente el producto
              para garantizar su integridad durante el transporte. El orfebre
              deberá despachar la pieza dentro de los 3 (tres) días hábiles
              siguientes a la confirmación de la orden, salvo que la publicación
              indique un plazo diferente por tratarse de una pieza a pedido o
              personalizada.
            </p>
            <p className="mb-4 font-light text-text-secondary">
              El plazo estimado de entrega es de 3 a 7 días hábiles desde el
              despacho para destinos dentro de Chile continental. Las entregas a
              zonas extremas (Arica, Punta Arenas, Aysén y regiones insulares)
              podrán extenderse hasta 10 días hábiles. Casa Orfebre no realiza
              envíos internacionales en esta etapa.
            </p>
            <p className="font-light text-text-secondary">
              El orfebre deberá proporcionar un número de seguimiento válido al
              despachar la pieza, el cual será compartido con el comprador a
              través de la Plataforma. En caso de extravío o daño durante el
              transporte, el orfebre y el comprador deberán gestionar el reclamo
              ante la empresa de transporte, pudiendo Casa Orfebre mediar en el
              proceso si fuera necesario.
            </p>
          </section>

          {/* ── 7. Política de devoluciones ── */}
          <section>
            <h2 className="mb-4 font-serif text-xl font-light text-text">
              7. Política de devoluciones
            </h2>
            <p className="mb-4 font-light text-text-secondary">
              El comprador dispone de un plazo de 14 (catorce) días calendario
              contados desde la recepción efectiva de la pieza para solicitar una
              devolución. La solicitud deberá realizarse a través de la
              Plataforma, indicando el motivo de la devolución y adjuntando
              fotografías del producto recibido.
            </p>
            <p className="mb-4 font-light text-text-secondary">
              Para que la devolución sea procedente, la pieza debe encontrarse en
              su estado original, sin uso, sin alteraciones y con todos sus
              embalajes y accesorios (certificados, estuches, etiquetas). No
              serán admitidas devoluciones de piezas personalizadas o hechas a
              medida, salvo que presenten defectos de fabricación.
            </p>
            <p className="mb-4 font-light text-text-secondary">
              En caso de devolución por defecto del producto (pieza dañada,
              materiales diferentes a los declarados, defectos de fabricación),
              el costo del envío de devolución será asumido por el orfebre. En
              caso de devolución por derecho de retracto o arrepentimiento del
              comprador, el costo del envío de devolución será de cargo del
              comprador.
            </p>
            <p className="font-light text-text-secondary">
              Una vez recibida la pieza devuelta por el orfebre y verificado su
              estado, Casa Orfebre procederá a gestionar el reembolso al
              comprador a través de Mercado Pago dentro de los 10 (diez) días
              hábiles siguientes. El reembolso se realizará por el mismo medio de
              pago utilizado en la compra original.
            </p>
          </section>

          {/* ── 8. Garantía de autenticidad y certificados ── */}
          <section>
            <h2 className="mb-4 font-serif text-xl font-light text-text">
              8. Garantía de autenticidad y certificados
            </h2>
            <p className="mb-4 font-light text-text-secondary">
              Cada pieza comercializada a través de Casa Orfebre puede contar con
              un certificado digital de autenticidad que incluye un código QR
              verificable. Este certificado contiene información sobre el
              orfebre, los materiales declarados, las técnicas empleadas y la
              fecha de creación de la pieza.
            </p>
            <p className="mb-4 font-light text-text-secondary">
              Los materiales y características de cada pieza son declarados por
              el orfebre bajo su exclusiva responsabilidad. Casa Orfebre realiza
              procesos de curación y verificación, pero no puede garantizar de
              manera absoluta la composición material de cada pieza. En caso de
              discrepancia entre los materiales declarados y los reales, el
              comprador podrá iniciar un proceso de reclamo y devolución
              conforme a lo establecido en la sección 7.
            </p>
            <p className="font-light text-text-secondary">
              Los orfebres se comprometen a declarar de manera veraz y precisa
              los materiales utilizados en sus creaciones (tipo de metal, ley de
              la plata u oro, tipo de piedras o gemas, entre otros). La
              declaración falsa o engañosa de materiales constituye una
              infracción grave a estos Términos y podrá resultar en la
              suspensión definitiva de la cuenta del orfebre y las acciones
              legales que correspondan.
            </p>
          </section>

          {/* ── 9. Propiedad intelectual ── */}
          <section>
            <h2 className="mb-4 font-serif text-xl font-light text-text">
              9. Propiedad intelectual
            </h2>
            <p className="mb-4 font-light text-text-secondary">
              Las fotografías, descripciones, diseños y cualquier otro contenido
              publicado por los orfebres en la Plataforma son propiedad
              intelectual de sus respectivos autores. Al publicar contenido en
              Casa Orfebre, el orfebre otorga a la Plataforma una licencia no
              exclusiva, gratuita, mundial y por el tiempo que dure la relación
              comercial, para exhibir, reproducir y distribuir dicho contenido
              con fines de promoción y comercialización dentro de la Plataforma y
              sus canales de difusión asociados (redes sociales, newsletters,
              publicidad digital).
            </p>
            <p className="mb-4 font-light text-text-secondary">
              La marca Casa Orfebre, su logotipo, identidad visual, estructura de
              la Plataforma, código fuente y diseño son propiedad exclusiva de
              Casa Orfebre y están protegidos por la legislación chilena e
              internacional sobre propiedad intelectual e industrial.
            </p>
            <p className="font-light text-text-secondary">
              Queda prohibida la reproducción, distribución o uso no autorizado
              de cualquier contenido de la Plataforma, ya sea propio de Casa
              Orfebre o de los orfebres registrados, sin el consentimiento previo
              y por escrito del titular de los derechos correspondientes.
            </p>
          </section>

          {/* ── 10. Limitación de responsabilidad ── */}
          <section>
            <h2 className="mb-4 font-serif text-xl font-light text-text">
              10. Limitación de responsabilidad
            </h2>
            <p className="mb-4 font-light text-text-secondary">
              Casa Orfebre actúa exclusivamente como intermediario tecnológico
              entre orfebres y compradores. En consecuencia, Casa Orfebre no
              será responsable por la calidad, seguridad, legalidad o
              idoneidad de las piezas publicadas por los orfebres, ni por la
              capacidad de los orfebres para completar una transacción, ni por la
              veracidad de la información publicada en las fichas de producto.
            </p>
            <p className="mb-4 font-light text-text-secondary">
              Casa Orfebre no se hace responsable por daños directos, indirectos,
              incidentales o consecuenciales derivados del uso de la Plataforma,
              incluyendo pero no limitándose a: pérdida de datos, lucro cesante,
              daños por entregas tardías, o perjuicios derivados de la
              interrupción del servicio por causas técnicas o de fuerza mayor.
            </p>
            <p className="font-light text-text-secondary">
              Sin perjuicio de lo anterior, Casa Orfebre se compromete a actuar
              de buena fe en la resolución de conflictos y a facilitar la
              comunicación entre las partes involucradas para alcanzar una
              solución satisfactoria en cada caso.
            </p>
          </section>

          {/* ── 11. Resolución de disputas ── */}
          <section>
            <h2 className="mb-4 font-serif text-xl font-light text-text">
              11. Resolución de disputas
            </h2>
            <p className="mb-4 font-light text-text-secondary">
              En caso de controversia entre un comprador y un orfebre, las partes
              se comprometen a seguir el siguiente procedimiento escalonado de
              resolución:
            </p>
            <ol className="mb-4 list-decimal space-y-2 pl-6 font-light text-text-secondary">
              <li>
                <strong className="font-medium text-text">
                  Contacto directo:
                </strong>{" "}
                El comprador se comunica con el orfebre a través del sistema de
                mensajería de la Plataforma para intentar resolver el problema de
                manera directa. Plazo: 5 días hábiles.
              </li>
              <li>
                <strong className="font-medium text-text">
                  Mediación de Casa Orfebre:
                </strong>{" "}
                Si no se alcanza un acuerdo, cualquiera de las partes podrá
                solicitar la mediación de Casa Orfebre. El equipo de soporte
                revisará el caso, solicitará evidencia a ambas partes y emitirá
                una propuesta de resolución dentro de los 10 días hábiles
                siguientes.
              </li>
              <li>
                <strong className="font-medium text-text">
                  Resolución administrativa:
                </strong>{" "}
                En caso de que la mediación no prospere, Casa Orfebre emitirá una
                resolución administrativa vinculante respecto de los fondos
                retenidos en la Plataforma. Esta resolución se basará en la
                evidencia presentada y en los presentes Términos y Condiciones.
              </li>
            </ol>
            <p className="font-light text-text-secondary">
              El procedimiento descrito no limita el derecho de las partes de
              recurrir a los tribunales ordinarios de justicia ni al Servicio
              Nacional del Consumidor (SERNAC) conforme a la legislación vigente.
            </p>
          </section>

          {/* ── 12. Modificaciones a los términos ── */}
          <section>
            <h2 className="mb-4 font-serif text-xl font-light text-text">
              12. Modificaciones a los términos
            </h2>
            <p className="mb-4 font-light text-text-secondary">
              Casa Orfebre se reserva el derecho de modificar estos Términos y
              Condiciones en cualquier momento. Las modificaciones serán
              notificadas a los usuarios registrados mediante correo electrónico
              enviado a la dirección asociada a su cuenta, con al menos 15
              (quince) días de anticipación a su entrada en vigor.
            </p>
            <p className="font-light text-text-secondary">
              El uso continuado de la Plataforma tras la entrada en vigor de las
              modificaciones constituirá la aceptación de los nuevos términos.
              En caso de desacuerdo, el usuario podrá solicitar la eliminación
              de su cuenta sin costo alguno antes de la fecha de entrada en
              vigor de los cambios.
            </p>
          </section>

          {/* ── 13. Ley aplicable ── */}
          <section>
            <h2 className="mb-4 font-serif text-xl font-light text-text">
              13. Ley aplicable
            </h2>
            <p className="font-light text-text-secondary">
              Estos Términos y Condiciones se rigen por la legislación de la
              República de Chile, en particular por la Ley N° 19.496 sobre
              Protección de los Derechos de los Consumidores y sus
              modificaciones, así como por el Código Civil y el Código de
              Comercio en lo que resulte aplicable. Para la resolución de
              cualquier controversia derivada de estos Términos, las partes se
              someten a la jurisdicción de los tribunales ordinarios de justicia
              de la ciudad de Santiago de Chile.
            </p>
          </section>

          {/* ── 14. Contacto ── */}
          <section>
            <h2 className="mb-4 font-serif text-xl font-light text-text">
              14. Contacto
            </h2>
            <p className="mb-4 font-light text-text-secondary">
              Para cualquier consulta, sugerencia o reclamo relacionado con estos
              Términos y Condiciones o con el funcionamiento de la Plataforma,
              puedes comunicarte con nosotros a través de:
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
          </section>
        </div>
      </article>
    </main>
  );
}
