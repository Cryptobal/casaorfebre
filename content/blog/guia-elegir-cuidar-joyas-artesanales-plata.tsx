import Link from "next/link";

export function PostContent() {
  return (
    <div>
      <h2 className="font-serif text-2xl font-light mt-12 mb-4 text-text">
        No toda la plata es igual: entendiendo las aleaciones
      </h2>
      <p className="text-text-secondary font-light leading-relaxed mb-6 text-lg">
        Antes de elegir tu primera joya artesanal de plata — o tu décima — es fundamental entender
        qué estás comprando. La plata pura, en su estado natural, es un metal demasiado blando para
        la joyería. Se raya con facilidad, se deforma con el uso diario y pierde su forma original
        en poco tiempo. Por eso, desde hace siglos, los orfebres la combinan con otros metales
        (generalmente cobre) para crear aleaciones más resistentes sin sacrificar la belleza del
        material.
      </p>

      <h3 className="font-serif text-xl font-light mt-8 mb-3 text-text">
        Plata 950: la favorita de los orfebres artesanales
      </h3>
      <p className="text-text-secondary font-light leading-relaxed mb-6 text-lg">
        La&nbsp;<strong className="font-medium text-text">plata 950</strong> contiene un 95% de
        plata pura y un 5% de cobre u otro metal de aleación. Es la ley más utilizada por los
        orfebres artesanales en Chile y Latinoamérica, y por buenas razones. Su alto contenido de
        plata le otorga un brillo más profundo y luminoso que la 925, con un tono ligeramente más
        blanco y cálido. Al ser más blanda que la sterling silver, responde mejor al trabajo manual:
        el repujado, el cincelado y la texturización se logran con mayor fluidez. Para el orfebre,
        es un material que &ldquo;conversa&rdquo; con las herramientas.
      </p>
      <p className="text-text-secondary font-light leading-relaxed mb-6 text-lg">
        La contrapartida es que, al ser más blanda, la plata 950 es más susceptible a rayones
        superficiales. Pero aquí hay un matiz importante: en la joyería artesanal, esas marcas del
        uso no son un defecto. Son parte de la vida de la pieza. Un anillo de plata 950 que has
        usado durante años desarrolla una superficie única, una especie de &ldquo;mapa&rdquo; de
        tu historia con él. Los orfebres llaman a esto&nbsp;<em>pátina de uso</em>, y muchos
        consideran que es precisamente lo que hace especial a la plata de alta ley.
      </p>

      <h3 className="font-serif text-xl font-light mt-8 mb-3 text-text">
        Plata 925: el estándar internacional
      </h3>
      <p className="text-text-secondary font-light leading-relaxed mb-6 text-lg">
        La&nbsp;<strong className="font-medium text-text">plata 925</strong>, conocida como
        &ldquo;sterling silver&rdquo;, contiene un 92.5% de plata pura y un 7.5% de cobre. Es el
        estándar internacional de la industria joyera y la ley más común en joyería comercial en
        todo el mundo. Es más dura que la 950, lo que la hace más resistente a los rayones y
        deformaciones del uso diario. Sin embargo, ese mayor contenido de cobre también significa
        que tiende a oxidarse (oscurecerse) más rápido.
      </p>
      <p className="text-text-secondary font-light leading-relaxed mb-6 text-lg">
        La plata 925 es perfectamente noble y hermosa. No cometas el error de pensar que es
        &ldquo;inferior&rdquo; a la 950: simplemente tiene características diferentes. Muchos
        orfebres de autor la eligen para piezas que requieren mayor resistencia estructural — aros
        delgados, cadenas finas, cierres mecánicos — mientras reservan la 950 para piezas
        escultóricas donde la maleabilidad es una ventaja.
      </p>

      <h3 className="font-serif text-xl font-light mt-8 mb-3 text-text">
        Otras aleaciones: lo que debes evitar
      </h3>
      <p className="text-text-secondary font-light leading-relaxed mb-6 text-lg">
        Más allá de la 950 y la 925, existen aleaciones de menor ley que conviene conocer. La
        &ldquo;plata&rdquo; 800, por ejemplo, contiene solo un 80% de plata y tiende a oscurecerse
        mucho más rápido. Y luego están los engaños: el &ldquo;baño de plata&rdquo; (una capa
        microscópica de plata sobre un metal base como latón o acero) y la &ldquo;alpaca&rdquo; o
        &ldquo;plata alemana&rdquo;, que no contiene plata en absoluto — es una aleación de cobre,
        zinc y níquel que imita su apariencia. Si una joya es sospechosamente barata y dice ser
        &ldquo;de plata&rdquo;, probablemente no lo sea.
      </p>

      <blockquote className="border-l-2 border-accent/30 pl-6 my-8 font-serif italic text-text-secondary text-lg">
        &ldquo;La ley de la plata no es un capricho técnico: es una promesa de calidad. Cuando un
        orfebre graba &lsquo;950&rsquo; en su pieza, está poniendo su reputación en cada
        gramo.&rdquo;
      </blockquote>

      <h2 className="font-serif text-2xl font-light mt-12 mb-4 text-text">
        Cómo reconocer plata auténtica
      </h2>
      <p className="text-text-secondary font-light leading-relaxed mb-6 text-lg">
        Reconocer plata genuina no requiere un laboratorio, aunque sí un poco de atención. Estas
        son las señales más confiables:
      </p>
      <ul className="space-y-2 mb-6 text-text-secondary font-light text-lg">
        <li className="pl-4">
          <strong className="font-medium text-text">Punzón de ley:</strong> busca un pequeño grabado
          que indique &ldquo;950&rdquo;, &ldquo;925&rdquo; o &ldquo;.950&rdquo;, &ldquo;.925&rdquo;.
          En joyería artesanal, este punzón suele estar en un lugar discreto — el interior de un
          anillo, la parte trasera de un dije, el cierre de un collar. La ausencia de punzón no
          significa necesariamente que no sea plata, pero su presencia es una buena señal.
        </li>
        <li className="pl-4">
          <strong className="font-medium text-text">Prueba del imán:</strong> la plata no es
          magnética. Si un imán se adhiere a tu joya, contiene hierro, acero u otro metal
          ferromagnético. Esta prueba no es definitiva (el latón y el cobre tampoco son magnéticos),
          pero descarta las falsificaciones más burdas.
        </li>
        <li className="pl-4">
          <strong className="font-medium text-text">Prueba del hielo:</strong> la plata tiene la
          conductividad térmica más alta de todos los metales. Coloca un cubo de hielo sobre la
          pieza: si se derrite notablemente más rápido que sobre otra superficie metálica, es una
          buena señal. Es un truco de orfebres que funciona sorprendentemente bien.
        </li>
        <li className="pl-4">
          <strong className="font-medium text-text">Oxidación característica:</strong> la plata
          genuina se oxida (oscurece) con el tiempo, especialmente en contacto con el azufre
          presente en el aire, el sudor y ciertos alimentos. Si una pieza &ldquo;de plata&rdquo;
          nunca se oscurece, probablemente tiene un recubrimiento de rodio (común en joyería
          comercial) o no es plata en absoluto.
        </li>
        <li className="pl-4">
          <strong className="font-medium text-text">Peso y sonido:</strong> la plata tiene una
          densidad específica que un ojo entrenado puede percibir. Además, al golpear suavemente una
          pieza de plata contra una superficie dura, produce un sonido agudo y limpio, como una
          campana pequeña. Los metales base suenan más opacos y cortos.
        </li>
      </ul>

      <h2 className="font-serif text-2xl font-light mt-12 mb-4 text-text">
        Qué buscar al comprar joyas artesanales
      </h2>
      <p className="text-text-secondary font-light leading-relaxed mb-6 text-lg">
        Elegir una joya artesanal es un acto diferente a comprar en una joyería de centro comercial.
        No estás eligiendo un producto estandarizado: estás eligiendo una pieza con personalidad.
        Estos son los criterios que recomendamos considerar:
      </p>
      <p className="text-text-secondary font-light leading-relaxed mb-6 text-lg">
        <strong className="font-medium text-text">El orfebre detrás de la pieza.</strong> Investiga
        quién la creó. Un orfebre serio tiene un cuerpo de trabajo coherente, una propuesta estética
        reconocible y puede responder preguntas sobre su proceso. En Casa Orfebre, cada artesano
        tiene un perfil donde puedes conocer su historia, sus técnicas y su filosofía de trabajo.
      </p>
      <p className="text-text-secondary font-light leading-relaxed mb-6 text-lg">
        <strong className="font-medium text-text">La calidad de la terminación.</strong> Observa los
        detalles: las soldaduras deben ser limpias (a menos que sean decorativas), los cierres deben
        funcionar con suavidad, las piedras deben estar bien engastadas. Una pieza artesanal tendrá
        irregularidades del trabajo manual, pero eso es muy diferente de un acabado descuidado.
        Aprende a distinguir entre la imperfección intencional del artesano y la negligencia.
      </p>
      <p className="text-text-secondary font-light leading-relaxed mb-6 text-lg">
        <strong className="font-medium text-text">La comodidad.</strong> Una joya bien diseñada se
        siente cómoda al usarla. Los bordes no deben ser cortantes, el peso debe ser apropiado para
        la zona del cuerpo donde se usará, y el tamaño debe ser proporcionado. Muchos orfebres de
        autor pueden ajustar sus piezas a tus medidas — no dudes en preguntar.
      </p>
      <p className="text-text-secondary font-light leading-relaxed mb-6 text-lg">
        <strong className="font-medium text-text">La transparencia en los materiales.</strong> El
        orfebre o la plataforma donde compras debe poder indicarte con precisión qué ley de plata
        se utilizó, el origen de las piedras y cualquier otro material presente en la pieza. La
        ambigüedad en los materiales es una señal de alerta.
      </p>

      <h2 className="font-serif text-2xl font-light mt-12 mb-4 text-text">
        Guía de cuidado: cómo mantener tu plata brillante
      </h2>
      <p className="text-text-secondary font-light leading-relaxed mb-6 text-lg">
        La plata es un metal noble pero reactivo. Se oscurece con el tiempo por la exposición al
        azufre (presente en el aire, el sudor, ciertos alimentos y productos químicos). Esto no es
        un defecto: es la naturaleza del material. Con cuidados básicos, puedes controlar esta
        oxidación y mantener tus piezas en óptimas condiciones durante décadas.
      </p>

      <h3 className="font-serif text-xl font-light mt-8 mb-3 text-text">
        Limpieza regular
      </h3>
      <ul className="space-y-2 mb-6 text-text-secondary font-light text-lg">
        <li className="pl-4">
          <strong className="font-medium text-text">Paño de pulir:</strong> la forma más segura y
          recomendada. Usa un paño de microfibra o un paño especial para plata (los venden en
          joyerías y ferreterías). Frota con movimientos suaves y rectos, nunca circulares. Esto
          elimina la oxidación superficial sin rayar el metal.
        </li>
        <li className="pl-4">
          <strong className="font-medium text-text">Agua tibia y jabón neutro:</strong> para una
          limpieza más profunda, sumerge la pieza en agua tibia con unas gotas de jabón neutro
          (sin fragancias ni colorantes) durante 5-10 minutos. Luego frota suavemente con un cepillo
          de dientes de cerdas muy suaves. Enjuaga con agua limpia y seca completamente con un paño
          suave. La humedad residual acelera la oxidación.
        </li>
        <li className="pl-4">
          <strong className="font-medium text-text">Bicarbonato de sodio:</strong> para oxidación
          más severa, prepara una pasta con bicarbonato de sodio y unas gotas de agua. Aplica con
          un paño suave, frota con delicadeza y enjuaga bien. No uses este método en piezas con
          piedras porosas (como turquesa o lapislázuli), ya que el bicarbonato puede dañar su
          superficie.
        </li>
      </ul>

      <h3 className="font-serif text-xl font-light mt-8 mb-3 text-text">
        El truco del papel aluminio
      </h3>
      <p className="text-text-secondary font-light leading-relaxed mb-6 text-lg">
        Este es un método casero favorito de muchos orfebres. Forra un recipiente con papel aluminio
        (lado brillante hacia arriba), coloca tus piezas de plata sobre él y cúbrelas con agua
        hirviendo. Añade una cucharada de bicarbonato de sodio y otra de sal. Verás cómo la
        oxidación se transfiere de la plata al aluminio mediante una reacción electroquímica. Deja
        actuar 3-5 minutos, retira, enjuaga y seca. Este método es excelente para piezas muy
        oxidadas, pero&nbsp;<strong className="font-medium text-text">no lo uses en piezas con
        pátina intencional</strong>&nbsp;— eliminará toda la oxidación, incluida la decorativa.
      </p>

      <h3 className="font-serif text-xl font-light mt-8 mb-3 text-text">
        Almacenamiento correcto
      </h3>
      <p className="text-text-secondary font-light leading-relaxed mb-6 text-lg">
        Cómo guardas tus joyas importa tanto como cómo las limpias. La plata se oxida más rápido
        en ambientes húmedos y cuando está expuesta al aire. Sigue estas recomendaciones:
      </p>
      <ul className="space-y-2 mb-6 text-text-secondary font-light text-lg">
        <li className="pl-4">
          Guarda cada pieza por separado en bolsas herméticas de cierre zip o en bolsas de tela
          anti-oxidación (las que suelen venir con las joyas). Esto reduce el contacto con el aire
          y evita que las piezas se rayen entre sí.
        </li>
        <li className="pl-4">
          Incluye un pequeño trozo de tiza blanca o una bolsita de gel de sílice en tu joyero. Ambos
          absorben la humedad del ambiente y ralentizan significativamente la oxidación.
        </li>
        <li className="pl-4">
          Evita guardar plata en el baño o la cocina, donde la humedad y los gases de cocción
          aceleran el oscurecimiento.
        </li>
        <li className="pl-4">
          Nunca guardes joyas de plata en contacto con caucho o goma. El azufre presente en estos
          materiales causa una oxidación acelerada y agresiva.
        </li>
      </ul>

      <h3 className="font-serif text-xl font-light mt-8 mb-3 text-text">
        Qué evitar
      </h3>
      <ul className="space-y-2 mb-6 text-text-secondary font-light text-lg">
        <li className="pl-4">
          <strong className="font-medium text-text">Perfumes y cremas:</strong> aplica tus productos
          de belleza antes de ponerte las joyas, no después. Los químicos en perfumes, lociones y
          protectores solares aceleran la oxidación y pueden dañar piedras naturales.
        </li>
        <li className="pl-4">
          <strong className="font-medium text-text">Cloro y agua de piscina:</strong> el cloro es
          enemigo de la plata. Quítate las joyas antes de nadar o limpiar con productos clorados.
        </li>
        <li className="pl-4">
          <strong className="font-medium text-text">Actividad física intensa:</strong> el sudor
          contiene sales y ácidos que oscurecen la plata. Si vas al gimnasio, mejor deja tus joyas
          en casa.
        </li>
        <li className="pl-4">
          <strong className="font-medium text-text">Productos de limpieza agresivos:</strong> nunca
          uses lejía, amoníaco concentrado o limpiadores abrasivos en tus joyas de plata. Y evita
          las &ldquo;soluciones mágicas&rdquo; de limpieza de plata que venden en supermercados: son
          demasiado agresivas para la joyería artesanal y pueden eliminar pátinas decorativas.
        </li>
      </ul>

      <h2 className="font-serif text-2xl font-light mt-12 mb-4 text-text">
        Cuándo llevar tu joya a un orfebre
      </h2>
      <p className="text-text-secondary font-light leading-relaxed mb-6 text-lg">
        Hay situaciones en las que el cuidado casero no es suficiente y conviene acudir a un
        profesional:
      </p>
      <ul className="space-y-2 mb-6 text-text-secondary font-light text-lg">
        <li className="pl-4">
          Si una piedra se ha aflojado en su engaste. No intentes arreglarla tú mismo — un engaste
          mal ajustado puede dañar la piedra de forma irreversible.
        </li>
        <li className="pl-4">
          Si un cierre mecánico ha dejado de funcionar correctamente.
        </li>
        <li className="pl-4">
          Si la pieza tiene rayones profundos que quieres eliminar. Un orfebre puede pulir y
          restaurar la superficie sin alterar el diseño.
        </li>
        <li className="pl-4">
          Si deseas modificar el tamaño de un anillo. Ampliar o reducir un anillo de plata es un
          procedimiento técnico que requiere herramientas y experiencia específicas.
        </li>
        <li className="pl-4">
          Para una limpieza profesional anual. Muchos orfebres ofrecen servicios de mantenimiento
          que incluyen limpieza ultrasónica, pulido y revisión de engastes.
        </li>
      </ul>

      <h2 className="font-serif text-2xl font-light mt-12 mb-4 text-text">
        La pátina: por qué la plata artesanal envejece diferente
      </h2>
      <p className="text-text-secondary font-light leading-relaxed mb-6 text-lg">
        Muchos orfebres de autor aplican deliberadamente una pátina oscura a sus piezas mediante un
        proceso llamado&nbsp;<strong className="font-medium text-text">oxidación controlada
        </strong>. Utilizan compuestos como el hígado de azufre (polisulfuro de potasio) para
        oscurecer selectivamente ciertas zonas de la joya, creando contraste y profundidad visual.
        Las áreas elevadas se pulen para recuperar el brillo, mientras que las cavidades y texturas
        conservan el tono oscuro. El resultado es una pieza con una riqueza visual que la plata
        brillante uniforme no puede lograr.
      </p>
      <p className="text-text-secondary font-light leading-relaxed mb-6 text-lg">
        Esta pátina intencional es parte del diseño y debe respetarse en el cuidado. No intentes
        eliminarla con productos agresivos — estarías borrando una decisión estética del artesano.
        Con el uso y el tiempo, la pátina se irá suavizando naturalmente en las zonas de mayor
        contacto, creando un efecto de &ldquo;vivido&rdquo; que es único en cada pieza. Es la plata
        contándote que ha sido usada, querida, vivida.
      </p>

      <blockquote className="border-l-2 border-accent/30 pl-6 my-8 font-serif italic text-text-secondary text-lg">
        &ldquo;La plata artesanal no envejece: madura. Cada marca, cada tono oscuro, cada brillo
        recuperado cuenta una parte de tu historia con ella.&rdquo;
      </blockquote>

      <h2 className="font-serif text-2xl font-light mt-12 mb-4 text-text">
        Garantía y certificado de Casa Orfebre
      </h2>
      <p className="text-text-secondary font-light leading-relaxed mb-6 text-lg">
        Cada pieza adquirida a través de Casa Orfebre incluye un&nbsp;
        <strong className="font-medium text-text">certificado de autenticidad digital</strong> que
        detalla: el nombre del orfebre creador, la ley de la plata utilizada, las piedras o
        materiales complementarios, la técnica de elaboración y un código QR de verificación único.
        Este certificado no solo garantiza la autenticidad de tu compra: también protege al orfebre,
        vinculando su nombre y reputación a cada pieza que crea.
      </p>
      <p className="text-text-secondary font-light leading-relaxed mb-6 text-lg">
        Además, ofrecemos un&nbsp;<strong className="font-medium text-text">período de garantía
        </strong> que cubre defectos de fabricación (no el desgaste natural del uso). Si una
        soldadura falla, si un engaste se suelta o si un cierre se rompe bajo uso normal, el orfebre
        se compromete a reparar la pieza. Porque la joyería artesanal no es desechable: está hecha
        para durar generaciones.
      </p>
      <p className="text-text-secondary font-light leading-relaxed mb-6 text-lg">
        Para más información sobre nuestras políticas de garantía, visita nuestra página
        de&nbsp;<Link href="/garantia" className="text-accent hover:underline">garantía</Link>.
      </p>

      {/* ─── CTA ─── */}
      <div className="mt-16 rounded-2xl bg-surface border border-border p-8 sm:p-12 text-center">
        <h3 className="font-serif text-xl font-light text-text mb-3">
          Explora nuestra colección de joyas en plata
        </h3>
        <p className="text-text-secondary font-light mb-6 text-lg max-w-xl mx-auto">
          Piezas únicas en plata 950 y 925, creadas por orfebres chilenos independientes. Cada
          joya incluye certificado de autenticidad y garantía de calidad.
        </p>
        <Link
          href="/coleccion?material=PLATA"
          className="inline-block bg-accent text-white px-6 py-3 rounded-lg hover:bg-accent-dark transition-colors"
        >
          Ver joyas de plata
        </Link>
      </div>
    </div>
  );
}
