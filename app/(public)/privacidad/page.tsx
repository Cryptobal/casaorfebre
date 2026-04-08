import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidad",
  description:
    "Política de privacidad de Casa Orfebre. Conoce cómo recopilamos, usamos y protegemos tus datos personales conforme a la Ley N° 21.719 de Protección de Datos Personales.",
};

export default function PrivacidadPage() {
  return (
    <main className="bg-background px-4 py-16 sm:px-6 lg:px-8">
      <article className="mx-auto max-w-4xl">
        <h1 className="font-serif text-3xl font-light text-text sm:text-4xl">
          Política de Privacidad
        </h1>
        <p className="mt-4 text-sm text-text-tertiary">
          Última actualización: 8 de abril de 2026
        </p>

        <div className="mt-12 space-y-10 text-lg leading-relaxed">
          {/* ── Introducción ── */}
          <section>
            <p className="font-light text-text-secondary">
              Casa Orfebre (en adelante, &quot;la Plataforma&quot;), operada
              bajo el dominio casaorfebre.cl, se compromete a proteger la
              privacidad y los datos personales de sus usuarios. La presente
              Política de Privacidad describe cómo recopilamos, utilizamos,
              almacenamos, compartimos y protegemos la información personal,
              de conformidad con la Ley N° 19.628 sobre Protección de la Vida
              Privada, modificada por la Ley N° 21.719 que regula la
              protección y el tratamiento de los datos personales (en
              adelante, la &quot;Ley de Protección de Datos&quot;).
            </p>
          </section>

          {/* ── 1. Responsable del tratamiento ── */}
          <section>
            <h2 className="mb-4 font-serif text-xl font-light text-text">
              1. Responsable del tratamiento
            </h2>
            <p className="font-light text-text-secondary">
              El responsable del tratamiento de los datos personales
              recopilados a través de la Plataforma es Casa Orfebre, con
              domicilio en Santiago, Chile. Para cualquier consulta relativa
              al tratamiento de datos personales, puedes contactarnos en{" "}
              <a
                href="mailto:contacto@casaorfebre.cl"
                className="text-accent underline-offset-2 hover:underline"
              >
                contacto@casaorfebre.cl
              </a>
              .
            </p>
          </section>

          {/* ── 2. Datos que recopilamos ── */}
          <section>
            <h2 className="mb-4 font-serif text-xl font-light text-text">
              2. Datos que recopilamos
            </h2>
            <p className="mb-4 font-light text-text-secondary">
              Casa Orfebre recopila información personal que los usuarios
              proporcionan voluntariamente al interactuar con la Plataforma,
              así como datos generados automáticamente durante la navegación.
              Los datos que podemos recopilar incluyen:
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
                dirección postal completa, comuna, ciudad, región, código
                postal y número de teléfono de contacto para la entrega.
              </li>
              <li>
                <strong className="font-medium text-text">
                  Datos transaccionales:
                </strong>{" "}
                historial de compras, montos de transacciones, estados de
                pedidos, solicitudes de devolución y comunicaciones realizadas
                a través de la Plataforma.
              </li>
              <li>
                <strong className="font-medium text-text">
                  Datos de orfebres:
                </strong>{" "}
                nombre o razón social, RUT, datos bancarios para pagos,
                descripción del taller, técnicas artesanales, fotografías de
                productos y contenido de perfil público. Las fotografías de
                productos son propiedad intelectual del orfebre; Casa Orfebre
                las trata exclusivamente para los fines comerciales
                autorizados en los Términos y Condiciones.
              </li>
              <li>
                <strong className="font-medium text-text">
                  Datos de navegación:
                </strong>{" "}
                dirección IP, tipo de navegador, sistema operativo, páginas
                visitadas, tiempo de permanencia, productos visualizados y
                patrones de interacción con la Plataforma, recopilados
                mediante cookies y herramientas de análisis.
              </li>
            </ul>
          </section>

          {/* ── 3. Bases de licitud y finalidades del tratamiento ── */}
          <section>
            <h2 className="mb-4 font-serif text-xl font-light text-text">
              3. Bases de licitud y finalidades del tratamiento
            </h2>
            <p className="mb-4 font-light text-text-secondary">
              Conforme a la Ley de Protección de Datos, Casa Orfebre trata
              los datos personales de sus usuarios bajo las siguientes bases
              de licitud y para las finalidades que se indican:
            </p>
            <ul className="mb-4 list-disc space-y-2 pl-6 font-light text-text-secondary">
              <li>
                <strong className="font-medium text-text">
                  Ejecución contractual:
                </strong>{" "}
                gestionar el registro de usuarios, procesar compras y ventas,
                coordinar envíos, administrar pagos a orfebres, emitir
                certificados de autenticidad y brindar soporte al usuario.
              </li>
              <li>
                <strong className="font-medium text-text">
                  Consentimiento:
                </strong>{" "}
                enviar comunicaciones promocionales, newsletters y
                notificaciones sobre nuevas colecciones; exhibir fotografías
                y contenido de orfebres en redes sociales y canales de
                difusión de Casa Orfebre (Instagram, Pinterest, Google
                Shopping); utilizar cookies analíticas para mejorar la
                experiencia de navegación.
              </li>
              <li>
                <strong className="font-medium text-text">
                  Obligación legal:
                </strong>{" "}
                conservar registros de transacciones comerciales conforme al
                Código Tributario y demás normativa aplicable; cumplir con
                requerimientos de autoridades competentes.
              </li>
              <li>
                <strong className="font-medium text-text">
                  Interés legítimo:
                </strong>{" "}
                prevenir fraudes, detectar actividades sospechosas, mejorar
                la seguridad de la Plataforma y analizar el rendimiento del
                servicio de forma agregada.
              </li>
            </ul>
            <p className="font-light text-text-secondary">
              No utilizamos los datos personales para fines de marketing
              directo no solicitado. Solo enviaremos comunicaciones
              promocionales a los usuarios que hayan otorgado su
              consentimiento explícito, pudiendo revocar dicho consentimiento
              en cualquier momento. Las fotografías de productos subidas por
              los orfebres no serán utilizadas para fines distintos a los
              declarados, ni cedidas a terceros ajenos a la operación de la
              Plataforma, ni empleadas para entrenamiento de modelos de
              inteligencia artificial.
            </p>
          </section>

          {/* ── 4. Datos compartidos con terceros ── */}
          <section>
            <h2 className="mb-4 font-serif text-xl font-light text-text">
              4. Datos compartidos con terceros
            </h2>
            <p className="mb-4 font-light text-text-secondary">
              Casa Orfebre comparte información personal de los usuarios
              únicamente con los terceros que sean estrictamente necesarios
              para la operación del servicio, bajo las siguientes condiciones:
            </p>
            <ul className="mb-4 list-disc space-y-2 pl-6 font-light text-text-secondary">
              <li>
                <strong className="font-medium text-text">
                  Mercado Pago (procesador de pagos):
                </strong>{" "}
                recibe los datos necesarios para procesar transacciones de
                manera segura. Mercado Pago opera bajo su propia política de
                privacidad y cumple con los estándares PCI-DSS de seguridad
                en el manejo de datos financieros.
              </li>
              <li>
                <strong className="font-medium text-text">Orfebres:</strong>{" "}
                al realizar una compra, el orfebre correspondiente recibe
                exclusivamente el nombre del comprador y la dirección de
                envío para poder despachar la pieza. Bajo ninguna
                circunstancia se comparte con los orfebres el correo
                electrónico, número de teléfono u otros datos de contacto
                personal del comprador. Toda comunicación entre comprador y
                orfebre se realiza a través del sistema de mensajería interno
                de la Plataforma.
              </li>
              <li>
                <strong className="font-medium text-text">
                  Google Analytics:
                </strong>{" "}
                recopila datos de navegación de forma anonimizada para fines
                estadísticos. Las direcciones IP son anonimizadas antes de su
                procesamiento.
              </li>
              <li>
                <strong className="font-medium text-text">
                  Proveedores de infraestructura:
                </strong>{" "}
                servicios de alojamiento (Vercel), base de datos (Neon),
                almacenamiento de archivos (Cloudflare R2) y correo
                transaccional (Resend) procesan datos personales por cuenta
                de Casa Orfebre conforme a sus respectivos acuerdos de
                tratamiento de datos y políticas de privacidad.
              </li>
            </ul>
            <p className="font-light text-text-secondary">
              Todos los terceros que tratan datos personales por cuenta de
              Casa Orfebre están sujetos a obligaciones de confidencialidad y
              seguridad equivalentes a las establecidas en esta Política.
              Casa Orfebre no vende, cede ni transfiere datos personales a
              terceros para fines propios de estos.
            </p>
          </section>

          {/* ── 5. Cookies ── */}
          <section>
            <h2 className="mb-4 font-serif text-xl font-light text-text">
              5. Cookies y tecnologías de seguimiento
            </h2>
            <p className="mb-4 font-light text-text-secondary">
              Casa Orfebre utiliza cookies y tecnologías similares para
              mejorar la experiencia de navegación. Las cookies se clasifican
              en:
            </p>
            <ul className="mb-4 list-disc space-y-2 pl-6 font-light text-text-secondary">
              <li>
                <strong className="font-medium text-text">
                  Cookies esenciales:
                </strong>{" "}
                necesarias para el funcionamiento básico de la Plataforma,
                como la autenticación de usuarios, gestión del carrito de
                compras y preferencias de sesión.
              </li>
              <li>
                <strong className="font-medium text-text">
                  Cookies analíticas:
                </strong>{" "}
                recopilan información de forma agregada y anonimizada, como
                páginas visitadas, duración de las sesiones y fuentes de
                tráfico.
              </li>
            </ul>
            <p className="font-light text-text-secondary">
              El usuario puede gestionar sus preferencias de cookies a través
              de la configuración de su navegador. La deshabilitación de
              cookies analíticas no afectará el funcionamiento de la
              Plataforma. La deshabilitación de cookies esenciales puede
              impedir el uso de ciertas funcionalidades como el inicio de
              sesión o el carrito de compras.
            </p>
          </section>

          {/* ── 6. Derechos del titular de datos (ARCOP) ── */}
          <section>
            <h2 className="mb-4 font-serif text-xl font-light text-text">
              6. Derechos del titular de datos
            </h2>
            <p className="mb-4 font-light text-text-secondary">
              De conformidad con la Ley N° 19.628, modificada por la Ley N°
              21.719, todo usuario registrado en Casa Orfebre tiene los
              siguientes derechos respecto de sus datos personales:
            </p>
            <ul className="mb-4 list-disc space-y-2 pl-6 font-light text-text-secondary">
              <li>
                <strong className="font-medium text-text">
                  Derecho de acceso:
                </strong>{" "}
                solicitar información sobre los datos personales que Casa
                Orfebre mantiene almacenados, las finalidades de su
                tratamiento, las categorías de datos tratados, los
                destinatarios a quienes se han comunicado y el período de
                conservación previsto.
              </li>
              <li>
                <strong className="font-medium text-text">
                  Derecho de rectificación:
                </strong>{" "}
                solicitar la corrección de datos personales que sean
                inexactos, incompletos o desactualizados. El usuario también
                puede actualizar directamente ciertos datos desde la
                configuración de su cuenta.
              </li>
              <li>
                <strong className="font-medium text-text">
                  Derecho de supresión (eliminación):
                </strong>{" "}
                solicitar la eliminación de sus datos personales cuando estos
                ya no sean necesarios para la finalidad con que fueron
                recopilados, cuando retire su consentimiento, cuando se
                oponga al tratamiento sin que exista otro fundamento legal,
                cuando los datos hayan sido tratados ilícitamente, o cuando
                una obligación legal así lo exija.
              </li>
              <li>
                <strong className="font-medium text-text">
                  Derecho de oposición:
                </strong>{" "}
                oponerse al tratamiento de sus datos personales cuando este
                se base en el interés legítimo de Casa Orfebre, o para fines
                de marketing directo o elaboración de perfiles.
              </li>
              <li>
                <strong className="font-medium text-text">
                  Derecho de portabilidad:
                </strong>{" "}
                solicitar y recibir una copia de sus datos personales en un
                formato estructurado, de uso común y lectura mecánica, y
                solicitar su transmisión a otro responsable, cuando el
                tratamiento se base en el consentimiento o en la ejecución de
                un contrato y se efectúe por medios automatizados.
              </li>
              <li>
                <strong className="font-medium text-text">
                  Derecho de bloqueo temporal:
                </strong>{" "}
                solicitar la suspensión temporal del tratamiento de sus datos
                mientras se resuelve una solicitud de rectificación,
                supresión u oposición.
              </li>
            </ul>
            <p className="mb-4 font-light text-text-secondary">
              Para ejercer cualquiera de estos derechos, el usuario podrá
              enviar una solicitud a{" "}
              <a
                href="mailto:contacto@casaorfebre.cl"
                className="text-accent underline-offset-2 hover:underline"
              >
                contacto@casaorfebre.cl
              </a>{" "}
              indicando su nombre completo, correo electrónico de registro y
              el derecho que desea ejercer. Casa Orfebre responderá dentro de
              los 30 (treinta) días corridos siguientes a la recepción de la
              solicitud.
            </p>
            <p className="font-light text-text-secondary">
              En caso de que Casa Orfebre rechace o no responda oportunamente
              una solicitud, el titular tiene derecho a recurrir ante la
              Agencia de Protección de Datos Personales conforme al
              procedimiento establecido en la Ley de Protección de Datos.
            </p>
          </section>

          {/* ── 7. Seguridad de datos ── */}
          <section>
            <h2 className="mb-4 font-serif text-xl font-light text-text">
              7. Seguridad de datos
            </h2>
            <p className="mb-4 font-light text-text-secondary">
              Casa Orfebre implementa medidas de seguridad técnicas y
              organizativas apropiadas para proteger los datos personales de
              sus usuarios contra el acceso no autorizado, la pérdida,
              alteración o divulgación indebida. Entre las medidas adoptadas
              se incluyen:
            </p>
            <ul className="mb-4 list-disc space-y-2 pl-6 font-light text-text-secondary">
              <li>
                Cifrado SSL/TLS en todas las comunicaciones entre el
                navegador del usuario y los servidores de la Plataforma.
              </li>
              <li>
                Contraseñas almacenadas mediante algoritmos de hash seguros;
                en ningún caso se almacenan contraseñas en texto plano.
              </li>
              <li>
                Acceso restringido a datos personales: solo el personal
                autorizado de Casa Orfebre tiene acceso a la información de
                los usuarios, y únicamente en la medida necesaria para
                cumplir sus funciones.
              </li>
              <li>
                No almacenamos datos de tarjetas de crédito o débito. Todo el
                procesamiento de pagos es gestionado por Mercado Pago en sus
                propios servidores seguros.
              </li>
            </ul>
            <p className="font-light text-text-secondary">
              A pesar de las medidas implementadas, ningún sistema de
              transmisión o almacenamiento de datos puede garantizar una
              seguridad absoluta. Casa Orfebre se compromete a notificar a
              los usuarios afectados y a la Agencia de Protección de Datos
              Personales en caso de cualquier vulneración de seguridad que
              comprometa datos personales, conforme a los procedimientos y
              plazos establecidos por la legislación vigente.
            </p>
          </section>

          {/* ── 8. Retención de datos ── */}
          <section>
            <h2 className="mb-4 font-serif text-xl font-light text-text">
              8. Retención de datos
            </h2>
            <p className="mb-4 font-light text-text-secondary">
              Casa Orfebre conservará los datos personales de los usuarios
              únicamente durante el tiempo necesario para cumplir con las
              finalidades para las que fueron recopilados. Los períodos de
              retención son los siguientes:
            </p>
            <ul className="mb-4 list-disc space-y-2 pl-6 font-light text-text-secondary">
              <li>
                <strong className="font-medium text-text">
                  Datos de cuenta activa:
                </strong>{" "}
                mientras la cuenta del usuario permanezca activa en la
                Plataforma.
              </li>
              <li>
                <strong className="font-medium text-text">
                  Datos transaccionales y tributarios:
                </strong>{" "}
                6 años desde la fecha de la transacción, conforme al Código
                Tributario chileno. Estos datos se conservan en forma
                anonimizada una vez eliminada la cuenta del usuario.
              </li>
              <li>
                <strong className="font-medium text-text">
                  Copias de seguridad:
                </strong>{" "}
                los datos eliminados por solicitud del usuario se conservarán
                en copias de seguridad por un máximo de 90 días calendario,
                tras lo cual serán eliminados de forma permanente e
                irreversible.
              </li>
              <li>
                <strong className="font-medium text-text">
                  Datos de navegación y cookies:
                </strong>{" "}
                se conservan por un período máximo de 26 meses desde su
                recopilación.
              </li>
            </ul>
            <p className="font-light text-text-secondary">
              Cuando un usuario solicite la eliminación de su cuenta, Casa
              Orfebre procederá de la siguiente manera: los datos personales
              visibles en la Plataforma (perfil, fotografías, contenido
              público) serán eliminados de forma inmediata. Los registros
              financieros vinculados a transacciones completadas se
              anonimizarán, reemplazando los datos identificativos del
              usuario, y se conservarán exclusivamente para cumplimiento de
              obligaciones tributarias. Las fotografías de productos serán
              eliminadas de todos los sistemas de almacenamiento, incluyendo
              la red de distribución de contenido (CDN).
            </p>
          </section>

          {/* ── 9. Tratamiento de datos de orfebres ── */}
          <section>
            <h2 className="mb-4 font-serif text-xl font-light text-text">
              9. Tratamiento de datos e imágenes de orfebres
            </h2>
            <p className="mb-4 font-light text-text-secondary">
              Los orfebres registrados en Casa Orfebre confían a la
              Plataforma datos personales adicionales para el ejercicio de su
              actividad comercial. En relación con estos datos, Casa Orfebre
              declara y garantiza lo siguiente:
            </p>
            <ul className="mb-4 list-disc space-y-2 pl-6 font-light text-text-secondary">
              <li>
                <strong className="font-medium text-text">
                  Propiedad intelectual de las imágenes:
                </strong>{" "}
                las fotografías, descripciones y contenido publicado por los
                orfebres son y permanecen siendo propiedad intelectual de sus
                respectivos autores, conforme a la Ley N° 17.336 sobre
                Propiedad Intelectual.
              </li>
              <li>
                <strong className="font-medium text-text">
                  Licencia de uso limitada:
                </strong>{" "}
                al publicar contenido, el orfebre otorga a Casa Orfebre una
                licencia no exclusiva, gratuita y revocable, vigente
                exclusivamente mientras dure la relación comercial, para
                exhibir, reproducir y distribuir dicho contenido con fines de
                promoción y comercialización dentro de la Plataforma y los
                siguientes canales: la cuenta de Instagram de Casa Orfebre,
                la cuenta de Pinterest de Casa Orfebre, Google Shopping,
                newsletters enviados a suscriptores de Casa Orfebre y
                publicidad digital directamente gestionada por Casa Orfebre.
              </li>
              <li>
                <strong className="font-medium text-text">
                  Prohibición de usos no autorizados:
                </strong>{" "}
                Casa Orfebre no utilizará las imágenes ni los datos de los
                orfebres para fines distintos a los expresamente declarados;
                no los cederá, venderá ni transferirá a terceros ajenos a la
                operación de la Plataforma; no los empleará para
                entrenamiento de modelos de inteligencia artificial; y no los
                utilizará en contextos que puedan afectar la reputación o
                dignidad del orfebre.
              </li>
              <li>
                <strong className="font-medium text-text">
                  Datos bancarios y tributarios:
                </strong>{" "}
                los datos bancarios (nombre del titular, RUT, banco, tipo y
                número de cuenta) se utilizan exclusivamente para el
                procesamiento de pagos al orfebre. Estos datos son accesibles
                únicamente por el personal autorizado de Casa Orfebre y no
                son compartidos con compradores ni con terceros.
              </li>
              <li>
                <strong className="font-medium text-text">
                  Eliminación al término de la relación:
                </strong>{" "}
                cuando un orfebre solicite la eliminación de su cuenta o dé
                por terminada su relación con Casa Orfebre, se procederá a la
                eliminación de todos sus datos personales, fotografías de
                productos y contenido de perfil de la Plataforma y de todos
                los sistemas de almacenamiento, dentro de los 30 días
                corridos siguientes a la solicitud. Los registros financieros
                de transacciones completadas se anonimizarán y conservarán
                conforme a la sección 8 de esta Política. La licencia de uso
                de imágenes se extingue automáticamente con la terminación de
                la relación.
              </li>
            </ul>
          </section>

          {/* ── 10. Transferencia internacional de datos ── */}
          <section>
            <h2 className="mb-4 font-serif text-xl font-light text-text">
              10. Transferencia internacional de datos
            </h2>
            <p className="font-light text-text-secondary">
              Algunos de los proveedores de servicios utilizados por Casa
              Orfebre operan fuera de Chile (Estados Unidos y otras
              jurisdicciones). Cuando los datos personales se transfieran a
              países que no ofrezcan un nivel adecuado de protección según la
              determinación de la Agencia de Protección de Datos Personales,
              Casa Orfebre adoptará las garantías contractuales apropiadas
              para asegurar que los datos reciban un nivel de protección
              equivalente al establecido por la legislación chilena. Los
              proveedores actuales que procesan datos fuera de Chile incluyen
              Vercel (alojamiento), Neon (base de datos), Cloudflare
              (distribución de contenido), Resend (correo transaccional) y
              Google (analytics y autenticación).
            </p>
          </section>

          {/* ── 11. Modificaciones y contacto ── */}
          <section>
            <h2 className="mb-4 font-serif text-xl font-light text-text">
              11. Modificaciones a esta Política y contacto
            </h2>
            <p className="mb-4 font-light text-text-secondary">
              Casa Orfebre se reserva el derecho de modificar esta Política
              de Privacidad para adaptarla a cambios normativos, jurídicos o
              de operación. Las modificaciones sustanciales serán notificadas
              a los usuarios registrados mediante correo electrónico con al
              menos 15 días de anticipación a su entrada en vigor. La fecha
              de última actualización siempre estará visible en la parte
              superior de esta página.
            </p>
            <p className="mb-4 font-light text-text-secondary">
              Para cualquier consulta, solicitud de ejercicio de derechos o
              reclamo relacionado con esta Política de Privacidad o con el
              tratamiento de tus datos personales, puedes contactarnos en:
            </p>
            <p className="mb-4 font-light text-text-secondary">
              Correo electrónico:{" "}
              <a
                href="mailto:contacto@casaorfebre.cl"
                className="text-accent underline-offset-2 hover:underline"
              >
                contacto@casaorfebre.cl
              </a>
            </p>
            <p className="font-light text-text-secondary">
              Si consideras que tus derechos como titular de datos no han
              sido debidamente atendidos, puedes interponer un reclamo ante
              la Agencia de Protección de Datos Personales, de conformidad
              con el procedimiento establecido en la Ley de Protección de
              Datos.
            </p>
          </section>
        </div>
      </article>
    </main>
  );
}
