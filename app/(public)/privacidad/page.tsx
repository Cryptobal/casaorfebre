export const metadata = {
  title: "Política de Privacidad",
  description:
    "Política de privacidad de Casa Orfebre. Conoce cómo recopilamos, usamos y protegemos tus datos personales en nuestro marketplace de joyería artesanal.",
  alternates: { canonical: "/privacidad" },
  twitter: {
    card: "summary_large_image" as const,
    title: "Política de Privacidad | Casa Orfebre",
    description:
      "Política de privacidad de Casa Orfebre. Conoce cómo protegemos tus datos personales.",
  },
};

export default function PrivacidadPage() {
  return (
    <main className="bg-background px-4 py-16 sm:px-6 lg:px-8">
      <article className="mx-auto max-w-4xl">
        <h1 className="font-serif text-3xl font-light text-text sm:text-4xl">
          Política de Privacidad
        </h1>
        <p className="mt-4 text-sm text-text-tertiary">
          Última actualización: 26 de marzo de 2026
        </p>

        <div className="mt-12 space-y-10 break-words text-base leading-relaxed sm:text-lg">
          {/* ── 1. Datos que recopilamos ── */}
          <section>
            <h2 className="mb-4 font-serif text-xl font-light text-text">
              1. Datos que recopilamos
            </h2>
            <p className="mb-4 font-light text-text-secondary">
              Casa Orfebre recopila información personal que los usuarios
              proporcionan voluntariamente al interactuar con la Plataforma, así
              como datos generados automáticamente durante la navegación. Los
              datos que podemos recopilar incluyen:
            </p>
            <ul className="mb-4 list-disc space-y-2 pl-6 font-light text-text-secondary">
              <li>
                <strong className="font-medium text-text">
                  Datos de registro:
                </strong>{" "}
                nombre completo, dirección de correo electrónico y contraseña
                cifrada. En caso de registro mediante proveedores externos
                (Google), se obtienen los datos autorizados por el usuario en
                dicho servicio.
              </li>
              <li>
                <strong className="font-medium text-text">
                  Datos de envío:
                </strong>{" "}
                dirección postal completa, comuna, ciudad, región, código postal
                y número de teléfono de contacto para la entrega.
              </li>
              <li>
                <strong className="font-medium text-text">
                  Datos transaccionales:
                </strong>{" "}
                historial de compras, montos de transacciones, estados de
                pedidos, solicitudes de devolución y comunicaciones con orfebres
                realizadas a través de la Plataforma.
              </li>
              <li>
                <strong className="font-medium text-text">
                  Datos de navegación:
                </strong>{" "}
                dirección IP, tipo de navegador, sistema operativo, páginas
                visitadas, tiempo de permanencia, productos visualizados y
                patrones de interacción con la Plataforma, recopilados mediante
                cookies y herramientas de análisis.
              </li>
            </ul>
            <p className="font-light text-text-secondary">
              No recopilamos datos sensibles tales como origen étnico, opiniones
              políticas, creencias religiosas, datos biométricos o información
              relativa a la salud de los usuarios.
            </p>
          </section>

          {/* ── 2. Cómo usamos los datos ── */}
          <section>
            <h2 className="mb-4 font-serif text-xl font-light text-text">
              2. Cómo usamos los datos
            </h2>
            <p className="mb-4 font-light text-text-secondary">
              Utilizamos la información personal recopilada para los siguientes
              fines:
            </p>
            <ul className="mb-4 list-disc space-y-2 pl-6 font-light text-text-secondary">
              <li>
                <strong className="font-medium text-text">
                  Procesamiento de pedidos:
                </strong>{" "}
                gestionar las compras, coordinar envíos con los orfebres,
                procesar devoluciones y reembolsos, y mantener un registro de las
                transacciones realizadas.
              </li>
              <li>
                <strong className="font-medium text-text">
                  Comunicación transaccional:
                </strong>{" "}
                enviar confirmaciones de pedido, actualizaciones de estado de
                envío, notificaciones de entrega, avisos de cambios en los
                Términos y Condiciones, y responder consultas de soporte.
              </li>
              <li>
                <strong className="font-medium text-text">
                  Mejora del servicio:
                </strong>{" "}
                analizar patrones de uso para optimizar la experiencia del
                usuario, personalizar recomendaciones de productos, mejorar el
                rendimiento de la Plataforma y desarrollar nuevas
                funcionalidades.
              </li>
              <li>
                <strong className="font-medium text-text">
                  Prevención de fraude:
                </strong>{" "}
                detectar y prevenir actividades fraudulentas, transacciones
                sospechosas, creación de cuentas falsas y cualquier uso indebido
                de la Plataforma que pueda perjudicar a usuarios u orfebres.
              </li>
            </ul>
            <p className="font-light text-text-secondary">
              No utilizamos los datos personales de los usuarios para fines de
              marketing directo no solicitado. Solo enviaremos comunicaciones
              promocionales a los usuarios que hayan otorgado su consentimiento
              explícito, pudiendo revocar dicho consentimiento en cualquier
              momento.
            </p>
          </section>

          {/* ── 3. Datos compartidos con terceros ── */}
          <section>
            <h2 className="mb-4 font-serif text-xl font-light text-text">
              3. Datos compartidos con terceros
            </h2>
            <p className="mb-4 font-light text-text-secondary">
              Casa Orfebre comparte información personal de los usuarios
              únicamente con los terceros que sean estrictamente necesarios para
              la operación del servicio, bajo las siguientes condiciones:
            </p>
            <ul className="mb-4 list-disc space-y-2 pl-6 font-light text-text-secondary">
              <li>
                <strong className="font-medium text-text">
                  Mercado Pago (procesador de pagos):
                </strong>{" "}
                recibe los datos necesarios para procesar transacciones de
                manera segura. Mercado Pago opera bajo su propia política de
                privacidad y cumple con los estándares PCI-DSS de seguridad en
                el manejo de datos financieros.
              </li>
              <li>
                <strong className="font-medium text-text">Orfebres:</strong>{" "}
                al realizar una compra, el orfebre correspondiente recibe
                exclusivamente el nombre del comprador y la dirección de envío
                para poder despachar la pieza. Bajo ninguna circunstancia se
                comparte con los orfebres el correo electrónico, número de
                teléfono u otros datos de contacto personal del comprador. Toda
                comunicación entre comprador y orfebre se realiza a través del
                sistema de mensajería interno de la Plataforma.
              </li>
              <li>
                <strong className="font-medium text-text">
                  Google Analytics:
                </strong>{" "}
                recopila datos de navegación de forma anonimizada para fines
                estadísticos. Las direcciones IP son anonimizadas antes de su
                procesamiento. Google Analytics opera bajo la política de
                privacidad de Google LLC.
              </li>
            </ul>
            <p className="font-light text-text-secondary">
              No vendemos, arrendamos ni cedemos datos personales de nuestros
              usuarios a terceros con fines publicitarios o comerciales. En caso
              de requerimiento judicial o administrativo emitido por autoridad
              competente conforme a la legislación chilena, Casa Orfebre podrá
              divulgar información personal del usuario en cumplimiento de
              dicha orden.
            </p>
          </section>

          {/* ── 4. Cookies y analytics ── */}
          <section>
            <h2 className="mb-4 font-serif text-xl font-light text-text">
              4. Cookies y analytics
            </h2>
            <p className="mb-4 font-light text-text-secondary">
              Casa Orfebre utiliza cookies y tecnologías similares para el
              correcto funcionamiento de la Plataforma. Las cookies empleadas se
              clasifican en:
            </p>
            <ul className="mb-4 list-disc space-y-2 pl-6 font-light text-text-secondary">
              <li>
                <strong className="font-medium text-text">
                  Cookies técnicas o esenciales:
                </strong>{" "}
                necesarias para la operación básica de la Plataforma, incluyendo
                la gestión de sesiones de usuario, el carrito de compras y las
                preferencias de seguridad. Estas cookies no requieren
                consentimiento y no pueden ser deshabilitadas sin afectar el
                funcionamiento del sitio.
              </li>
              <li>
                <strong className="font-medium text-text">
                  Cookies analíticas:
                </strong>{" "}
                utilizamos Google Analytics 4 (GA4) para comprender cómo los
                usuarios interactúan con la Plataforma. Estas cookies recopilan
                información de forma agregada y anonimizada, como páginas
                visitadas, duración de las sesiones y fuentes de tráfico.
              </li>
            </ul>
            <p className="font-light text-text-secondary">
              El usuario puede gestionar sus preferencias de cookies a través de
              la configuración de su navegador. La deshabilitación de cookies
              analíticas no afectará el funcionamiento de la Plataforma. La
              deshabilitación de cookies esenciales puede impedir el uso de
              ciertas funcionalidades como el inicio de sesión o el carrito de
              compras.
            </p>
          </section>

          {/* ── 5. Derechos del usuario ── */}
          <section>
            <h2 className="mb-4 font-serif text-xl font-light text-text">
              5. Derechos del usuario
            </h2>
            <p className="mb-4 font-light text-text-secondary">
              De conformidad con la Ley N° 19.628 sobre Protección de la Vida
              Privada de la República de Chile, todo usuario registrado en Casa
              Orfebre tiene derecho a:
            </p>
            <ul className="mb-4 list-disc space-y-2 pl-6 font-light text-text-secondary">
              <li>
                <strong className="font-medium text-text">
                  Derecho de acceso:
                </strong>{" "}
                solicitar información sobre los datos personales que Casa Orfebre
                mantiene almacenados y el tratamiento que se les da.
              </li>
              <li>
                <strong className="font-medium text-text">
                  Derecho de rectificación:
                </strong>{" "}
                solicitar la corrección de datos personales que sean inexactos,
                incompletos o desactualizados. El usuario también puede
                actualizar directamente ciertos datos desde la configuración de
                su cuenta.
              </li>
              <li>
                <strong className="font-medium text-text">
                  Derecho de cancelación (eliminación):
                </strong>{" "}
                solicitar la eliminación de sus datos personales cuando estos ya
                no sean necesarios para la finalidad con que fueron recopilados,
                o cuando retire su consentimiento para el tratamiento.
              </li>
              <li>
                <strong className="font-medium text-text">
                  Derecho de oposición:
                </strong>{" "}
                oponerse al tratamiento de sus datos personales para
                determinados fines, especialmente en relación con comunicaciones
                de marketing.
              </li>
            </ul>
            <p className="font-light text-text-secondary">
              Para ejercer cualquiera de estos derechos, el usuario podrá enviar
              una solicitud a{" "}
              <a
                href="mailto:contacto@casaorfebre.cl"
                className="text-accent underline-offset-2 hover:underline"
              >
                contacto@casaorfebre.cl
              </a>{" "}
              indicando su nombre completo, correo electrónico de registro y el
              derecho que desea ejercer. Casa Orfebre responderá dentro de los
              10 (diez) días hábiles siguientes a la recepción de la solicitud.
            </p>
          </section>

          {/* ── 6. Seguridad de datos ── */}
          <section>
            <h2 className="mb-4 font-serif text-xl font-light text-text">
              6. Seguridad de datos
            </h2>
            <p className="mb-4 font-light text-text-secondary">
              Casa Orfebre implementa medidas de seguridad técnicas y
              organizativas apropiadas para proteger los datos personales de sus
              usuarios contra el acceso no autorizado, la pérdida, alteración o
              divulgación indebida. Entre las medidas adoptadas se incluyen:
            </p>
            <ul className="mb-4 list-disc space-y-2 pl-6 font-light text-text-secondary">
              <li>
                Cifrado SSL/TLS en todas las comunicaciones entre el navegador
                del usuario y los servidores de la Plataforma.
              </li>
              <li>
                Contraseñas almacenadas mediante algoritmos de hash seguros; en
                ningún caso se almacenan contraseñas en texto plano.
              </li>
              <li>
                Acceso restringido a datos personales: solo el personal
                autorizado de Casa Orfebre tiene acceso a la información de los
                usuarios, y únicamente en la medida necesaria para cumplir sus
                funciones.
              </li>
              <li>
                No almacenamos datos de tarjetas de crédito o débito. Todo el
                procesamiento de pagos es gestionado por Mercado Pago en sus
                propios servidores seguros.
              </li>
            </ul>
            <p className="font-light text-text-secondary">
              A pesar de las medidas implementadas, ningún sistema de transmisión
              o almacenamiento de datos puede garantizar una seguridad absoluta.
              Casa Orfebre se compromete a notificar a los usuarios afectados en
              caso de cualquier incidente de seguridad que comprometa sus datos
              personales, conforme a los procedimientos y plazos establecidos por
              la legislación vigente.
            </p>
          </section>

          {/* ── 7. Retención de datos ── */}
          <section>
            <h2 className="mb-4 font-serif text-xl font-light text-text">
              7. Retención de datos
            </h2>
            <p className="mb-4 font-light text-text-secondary">
              Casa Orfebre conservará los datos personales de los usuarios
              mientras su cuenta permanezca activa en la Plataforma o mientras
              sean necesarios para cumplir con las finalidades para las que
              fueron recopilados, incluyendo obligaciones legales, contables o de
              reporte.
            </p>
            <p className="mb-4 font-light text-text-secondary">
              Cuando un usuario solicite la eliminación de su cuenta, Casa
              Orfebre procederá de la siguiente manera: los datos personales
              visibles en la Plataforma serán eliminados de forma inmediata. Los
              datos almacenados en copias de seguridad serán conservados por un
              período máximo de 90 (noventa) días calendario, transcurrido el
              cual serán eliminados de forma permanente e irreversible.
            </p>
            <p className="font-light text-text-secondary">
              Se exceptúan de la eliminación aquellos datos que deban
              conservarse por obligación legal o tributaria, como registros de
              transacciones comerciales, los cuales serán mantenidos por el
              período que establezca la normativa aplicable y serán utilizados
              exclusivamente para dicho fin.
            </p>
          </section>

          {/* ── 8. Contacto ── */}
          <section>
            <h2 className="mb-4 font-serif text-xl font-light text-text">
              8. Contacto
            </h2>
            <p className="mb-4 font-light text-text-secondary">
              Para cualquier consulta, solicitud o reclamo relacionado con esta
              Política de Privacidad o con el tratamiento de tus datos
              personales, puedes contactarnos a través de:
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
