import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const posts = [
  {
    slug: "como-regalar-joyas-artesanales-guia-ocasiones",
    title: "Cómo Regalar Joyas Artesanales: Guía por Ocasión",
    excerpt:
      "Encuentra la joya artesanal perfecta para cada momento especial. Desde aniversarios hasta graduaciones, una guía para elegir con significado.",
    category: "GUIAS" as const,
    tags: [
      "regalos",
      "ocasiones",
      "joyas artesanales",
      "día de la madre",
      "aniversario",
    ],
    seoTitle:
      "Cómo Regalar Joyas Artesanales: Guía Completa por Ocasión | Casa Orfebre",
    seoDescription:
      "Guía para regalar joyas artesanales chilenas. Ideas para aniversarios, día de la madre, graduaciones y más. Encuentra la pieza perfecta.",
    coverImage: "/blog/regalar-joyas.jpg",
    readingTime: 8,
    content: `## Por qué una joya artesanal es el mejor regalo

Regalar una joya artesanal no es simplemente entregar un objeto bonito. Es regalar una historia, el trabajo de manos expertas, y una pieza que no se repetirá jamás. A diferencia de la joyería industrial — producida en masa y disponible en cualquier vitrina — una pieza hecha a mano por un orfebre chileno lleva consigo horas de dedicación, creatividad y un trozo de nuestra cultura.

Cuando eliges una joya artesanal, estás diciendo: "Me tomé el tiempo de buscar algo único para ti". Y eso, en un mundo de compras rápidas y entregas al día siguiente, tiene un valor enorme.

## Aniversarios: el regalo que marca un hito

Para un aniversario de pareja, pocas cosas comunican tanto como una joya pensada especialmente para ese momento. Los **anillos artesanales** son la opción clásica, pero no la única.

- **Primer aniversario**: Un anillo de plata 950 con un diseño orgánico, minimalista. Algo que pueda usar todos los días y que le recuerde ese primer año juntos.
- **Quinto aniversario**: Un collar con piedra natural chilena — cuarzo rosa, lapislázuli o turquesa. Las piedras aportan color y significado.
- **Décimo aniversario o más**: Es momento de ir por el oro. Un anillo o aros en oro 18k, con el detalle artesanal que solo un orfebre puede lograr.

> "Una joya artesanal no se gasta con el tiempo; se pule con cada recuerdo que la acompaña."

## Día de la Madre: reconocer con belleza

El Día de la Madre es una de las ocasiones donde más se regalan joyas, y con razón. Pero en lugar de recurrir a lo genérico, considera algo con personalidad.

Los **colgantes y dijes** son una excelente opción: pueden llevar piedras que tengan significado (el color favorito de mamá, la piedra de su mes de nacimiento), y al ser artesanales, cada pieza tiene una identidad propia.

Las **pulseras de plata** con acabado texturizado o martillado también funcionan muy bien. Son piezas que se notan sin ser ostentosas — justo lo que muchas madres prefieren.

En [nuestra colección](/coleccion) puedes filtrar por ocasión "Día de la Madre" para ver piezas que los orfebres han diseñado pensando en esta fecha.

## Cumpleaños: la pieza que refleja su personalidad

Un cumpleaños es más personal que otras celebraciones, y la joya debería reflejar eso. Aquí la clave es conocer el estilo de la persona:

- **Estilo minimalista**: Aros pequeños de plata, argollas delgadas, cadenas finas con dije sutil.
- **Estilo bohemio**: Anillos grandes con piedra natural, collares largos, pulseras con múltiples texturas.
- **Estilo clásico**: Perlas de río montadas en plata, aros tipo botón, gargantillas elegantes.

Lo mejor de comprar en un marketplace como Casa Orfebre es que puedes explorar el trabajo de [múltiples orfebres](/orfebres), cada uno con un estilo distinto. No estás limitado a una sola estética.

## Graduaciones: marcar el logro

Una graduación es un hito que merece ser recordado. Las joyas artesanales funcionan como símbolo tangible de ese esfuerzo.

Para graduaciones universitarias, los **anillos de sello** o **anillos con piedra** son una tradición que cobra nueva vida cuando están hechos a mano. Un anillo de plata con lapislázuli — la piedra nacional de Chile — es un regalo con raíces profundas.

Para graduaciones escolares, algo más sutil: unos aros delicados o una pulsera fina que puedan acompañar en la siguiente etapa.

## San Valentín: lo que importa es la intención

No necesitas gastar una fortuna para regalar algo significativo en San Valentín. Una pieza pequeña pero con historia vale más que un diamante industrial sin alma.

Ideas concretas:
- Un **par de aros artesanales** con formas orgánicas
- Un **anillo apilable** de plata 950 (se puede ir regalando uno cada año)
- Un **collar corto** con piedra que tenga un significado especial

## Navidad: el regalo bajo el árbol que dura toda la vida

La Navidad es época de regalos, y una joya artesanal se destaca entre la montaña de cajas. Además, al comprar artesanal estás apoyando directamente a un orfebre independiente y su familia — un gesto que va más allá del regalo mismo.

Considera regalar un [set o colección](/coleccion): aros que combinen con un collar del mismo orfebre, o un anillo con pulsera a juego. Los orfebres de Casa Orfebre suelen crear piezas que conversan entre sí.

## Cómo elegir la pieza correcta

Algunos consejos prácticos para no fallar:

1. **Observa qué joyas usa actualmente**: ¿Plata o dorado? ¿Grandes o discretas? ¿Con piedras o sin ellas?
2. **Pregunta la talla disimuladamente**: Para anillos, puedes pedir prestado uno que use en el dedo correcto.
3. **Lee la descripción del orfebre**: En Casa Orfebre, cada producto tiene la historia detrás de la pieza. Ese contexto enriquece el regalo.
4. **No subestimes la presentación**: Nuestros orfebres incluyen empaque cuidado y certificado de autenticidad — tu regalo llegará listo para sorprender.

## Encuentra la pieza perfecta

Regalar una joya artesanal es regalar tiempo, oficio y belleza. No importa la ocasión — lo que importa es la intención de elegir algo que no existe en ninguna otra parte del mundo.

Explora nuestra [colección de joyas artesanales](/coleccion) y filtra por ocasión, material o estilo. Cada pieza viene con certificado de autenticidad y la historia de quien la creó.`,
  },
  {
    slug: "historia-orfebreria-mapuche-plateria-contemporanea",
    title: "Historia de la Orfebrería Mapuche y su Influencia Contemporánea",
    excerpt:
      "Desde la trapelacucha hasta la joyería contemporánea: cómo la platería mapuche sigue viva en las manos de orfebres chilenos.",
    category: "CULTURA" as const,
    tags: [
      "platería mapuche",
      "joyería mapuche",
      "orfebrería chilena",
      "cultura",
      "plata",
    ],
    seoTitle:
      "Historia de la Orfebrería Mapuche: De la Platería Ancestral a la Joyería Contemporánea",
    seoDescription:
      "Conoce la historia de la platería mapuche — trapelacucha, tupu, trarilonko — y cómo los orfebres chilenos reinterpretan estas técnicas hoy.",
    coverImage: "/blog/plateria-mapuche.jpg",
    readingTime: 10,
    content: `## El origen de la platería mapuche

La relación del pueblo mapuche con la plata es una de las tradiciones metalúrgicas más ricas de América del Sur. Aunque la platería mapuche alcanzó su máximo esplendor entre los siglos XVIII y XIX, sus raíces se extienden mucho más atrás, cuando los mapuche comenzaron a trabajar la plata obtenida del contacto — y el conflicto — con los conquistadores españoles.

Lo que hace única a la platería mapuche no es solo la técnica, sino el significado. Cada pieza cumple una función que va más allá de lo decorativo: las joyas mapuche son protección, identidad, estatus social y conexión espiritual.

## Las piezas emblemáticas

### Trapelacucha

La trapelacucha es quizás la pieza más reconocible de la platería mapuche. Es un pectoral que cuelga del cuello, formado por eslabones de plata y rematado en una cruz. No se trata de una cruz cristiana — la forma existía antes del contacto español y representa los cuatro puntos cardinales, los elementos y el equilibrio del cosmos mapuche.

La trapelacucha era usada exclusivamente por mujeres, especialmente en ceremonias importantes como el nguillatún. Una mujer con una trapelacucha de gran tamaño comunicaba el prestigio de su familia y su linaje.

### Tupu

El tupu (o punzón) es un alfiler grande de plata que se usaba para sujetar el chamal (vestido mapuche) sobre los hombros. Su cabeza puede ser circular, ovalada o con forma de flor, y muchas veces lleva grabados geométricos que representan elementos de la naturaleza.

Los tupus son piezas funcionales convertidas en arte. Algunos orfebres contemporáneos los reinterpretan como broches o prendedores, manteniendo la forma original pero adaptándola al uso cotidiano actual.

### Trarilonko

El trarilonko es una cinta o cadena de plata que se lleva alrededor de la cabeza. Está formado por placas o monedas de plata unidas entre sí. En la tradición mapuche, es una pieza de gran importancia ceremonial, usada tanto por hombres como por mujeres.

> "La plata para el mapuche no es lujo: es identidad. Cada pieza cuenta quién eres, de dónde vienes, y qué fuerzas te protegen."

## Las técnicas ancestrales

Los retrafe (plateros mapuche) desarrollaron técnicas que siguen siendo admiradas por su precisión:

- **Repujado**: Trabajar la plata desde el reverso para crear relieves en el frente. Se usa un martillo pequeño y un yunque de madera.
- **Cincelado**: Grabar patrones geométricos sobre la superficie de la plata usando cinceles de distintos anchos.
- **Fundición a la cera perdida**: Modelar la pieza en cera, recubrirla con arcilla, fundirla para eliminar la cera, y verter plata líquida en el molde resultante.
- **Filigrana**: Crear diseños intrincados con hilos de plata muy finos, soldados entre sí.

Estas técnicas se transmitían oralmente, de maestro a aprendiz, y muchas se perdieron durante el siglo XX cuando la platería mapuche sufrió un declive por la pérdida territorial y cultural.

## El renacimiento contemporáneo

Desde los años 2000, un movimiento creciente de orfebres ha vuelto la mirada hacia las técnicas y formas mapuche. No se trata de copiar — se trata de dialogar con la tradición.

Algunos orfebres contemporáneos trabajan directamente con comunidades mapuche, aprendiendo técnicas y co-creando piezas que respetan el significado original mientras los adaptan a la joyería contemporánea. Otros se inspiran en las formas geométricas mapuche — las grecas, los rombos, las espirales — para crear diseños propios que reconocen su origen.

En [Casa Orfebre](/orfebres) puedes encontrar artesanos que trabajan con estas influencias. Cada pieza incluye la historia y la inspiración detrás del diseño, para que sepas exactamente qué estás llevando contigo.

## La importancia de la procedencia ética

Cuando hablamos de joyería inspirada en culturas indígenas, la ética es fundamental. No es lo mismo inspirarse respetuosamente que apropiarse de símbolos sagrados para venderlos sin contexto.

Los principios que guían una relación ética incluyen:

1. **Reconocimiento**: Mencionar explícitamente la influencia mapuche en el diseño.
2. **Colaboración**: Trabajar con artesanos mapuche cuando se usan técnicas tradicionales.
3. **Educación**: Informar al comprador sobre el significado cultural de las formas.
4. **Retribución**: Que una parte del valor generado vuelva a las comunidades de origen.

## Llevando la tradición adelante

La platería mapuche no es un arte del pasado — es un arte vivo que se transforma. Los [orfebres chilenos](/orfebres) que trabajan con estas influencias están creando un puente entre siglos de tradición y la joyería contemporánea.

Cuando eliges una pieza con raíces mapuche, no estás comprando solo un accesorio: estás llevando contigo una historia que tiene más de tres siglos, filtrada por las manos de un orfebre que eligió mantenerla viva.

Explora nuestra [colección](/coleccion) y descubre piezas que conversan con la tradición orfebre más profunda de Chile.`,
  },
  {
    slug: "plata-vs-oro-que-metal-elegir-joya-artesanal",
    title: "Plata vs. Oro: ¿Qué Metal Elegir para tu Joya Artesanal?",
    excerpt:
      "Comparación práctica entre plata y oro para joyería artesanal. Durabilidad, precio, mantenimiento y cuándo elegir cada uno.",
    category: "GUIAS" as const,
    tags: [
      "plata",
      "oro",
      "materiales",
      "guía de compra",
      "joyería artesanal",
    ],
    seoTitle:
      "Plata vs Oro: Qué Metal Elegir para tu Joya Artesanal | Guía Completa",
    seoDescription:
      "Guía completa sobre plata 950 vs oro 18k en joyería artesanal chilena. Durabilidad, precio, mantenimiento y estilo. Aprende a elegir el metal correcto.",
    coverImage: "/blog/plata-vs-oro.jpg",
    readingTime: 9,
    content: `## La pregunta eterna: ¿plata o oro?

Es probablemente la primera decisión que enfrentas al buscar una joya artesanal: ¿plata o oro? La respuesta no es universal — depende de tu estilo, tu presupuesto, tu piel, y cómo planeas usar la pieza.

Vamos a desmenuzar cada metal para que puedas elegir con conocimiento, no con supuestos.

## Plata: la favorita de la orfebrería chilena

### Plata 950 vs. Plata 925

En Chile, la mayoría de los orfebres trabajan con **plata 950**, que contiene 95% de plata pura y 5% de cobre. Es más pura que la plata 925 (sterling silver) que domina en mercados internacionales, lo que le da un brillo más blanco y una maleabilidad superior para el trabajo artesanal.

La plata 925, por su parte, es un poco más dura y resistente a los rayones, lo que la hace ideal para piezas de uso diario intenso como anillos.

### Ventajas de la plata

- **Precio accesible**: Una pieza artesanal en plata cuesta entre un 60-80% menos que su equivalente en oro.
- **Versatilidad**: Combina con todo. No importa si tu armario es de tonos fríos o cálidos.
- **Trabajabilidad**: Los orfebres pueden lograr diseños más atrevidos y detallados porque el material es más económico — pueden experimentar más.
- **Pátina natural**: Con el tiempo, la plata desarrolla una oxidación sutil que muchos consideran hermosa. Le da carácter.

### Desventajas de la plata

- **Se oxida**: La plata reacciona con el azufre del aire y la humedad. Necesita limpieza periódica.
- **Es más blanda**: La plata 950 es más susceptible a rayones que el oro.
- **Puede oscurecerse con algunos químicos**: Perfumes, cloro y ciertos medicamentos aceleran la oxidación.

Si quieres aprender a mantener tus joyas de plata, tenemos una [guía completa de cuidado](/blog/guia-elegir-cuidar-joyas-artesanales-plata).

## Oro: la inversión que dura generaciones

### Aleaciones comunes en Chile

El oro puro (24k) es demasiado blando para joyería. Los orfebres chilenos trabajan principalmente con:

- **Oro 18k (750)**: 75% oro puro. Es el estándar en joyería artesanal de calidad. Buen equilibrio entre pureza, color y durabilidad.
- **Oro 14k (585)**: 58.5% oro puro. Más resistente y más accesible, pero con un tono ligeramente menos intenso.

Dentro del oro 18k existen variantes según los metales de aleación:
- **Oro amarillo**: Aleación con cobre y plata. El tono clásico.
- **Oro rosado**: Mayor proporción de cobre. Cálido y contemporáneo.
- **Oro blanco**: Aleación con paladio o níquel. Similar a la plata pero más duradero.

### Ventajas del oro

- **No se oxida**: El oro es prácticamente inerte. No cambia de color ni se corroe.
- **Durabilidad extrema**: Una pieza de oro bien hecha puede pasar de generación en generación sin deterioro visible.
- **Valor de inversión**: El oro mantiene y generalmente aumenta su valor con el tiempo.
- **Hipoalergénico**: El oro 18k rara vez causa reacciones alérgicas (ojo con el oro blanco con níquel).

### Desventajas del oro

- **Precio elevado**: Una pieza en oro 18k puede costar 5-10 veces más que su equivalente en plata 950.
- **Peso**: Las piezas de oro son notablemente más pesadas, lo que puede incomodar en aros grandes o colgantes.

> "La plata es para el día a día; el oro, para los momentos que quieres que duren para siempre. Pero al final, lo que importa es que la pieza sea tuya."

## Cobre y bronce: los metales alternativos

Cada vez más orfebres chilenos experimentan con cobre y bronce, ofreciendo piezas con personalidad única:

- **Cobre**: Tono cálido rojizo. Se oxida naturalmente a un verde hermoso (patina verde). Muy económico.
- **Bronce**: Aleación de cobre y estaño. Más resistente que el cobre puro, con un tono dorado oscuro.
- **Alpaca**: Aleación de cobre, zinc y níquel. Simula la plata a menor costo, pero puede causar alergias en pieles sensibles.

Estos metales son perfectos para piezas experimentales, artísticas o de gran tamaño donde el costo del oro o la plata sería prohibitivo.

## ¿Cómo elegir? Guía rápida

| Criterio | Plata | Oro |
|----------|-------|-----|
| Presupuesto limitado | ✓ | |
| Uso diario intenso | 925 | ✓ |
| Piel sensible | ✓ (950) | ✓ (18k) |
| Regalo especial | ✓ | ✓✓ |
| Inversión a largo plazo | | ✓ |
| Pieza grande/llamativa | ✓ (por peso y costo) | |
| Combinación con ropa | ✓ (tono frío) | ✓ (tono cálido) |

## Lo que dicen los orfebres

La mayoría de los [orfebres de Casa Orfebre](/orfebres) trabajan principalmente en plata 950, pero varios ofrecen piezas en oro por encargo. La ventaja de la joyería artesanal es que puedes conversar directamente con el creador y pedir una pieza en el metal que prefieras.

Algunos orfebres también trabajan con técnicas mixtas — plata con baño de oro, cobre con incrustaciones de plata, o combinaciones que logran efectos visuales únicos.

## Encuentra tu metal ideal

No existe un metal "mejor" — existe el metal correcto para cada persona y cada momento. Explora nuestra [colección](/coleccion) y filtra por material para ver piezas en plata, oro, cobre y más. Cada pieza incluye información detallada sobre el metal y las técnicas utilizadas.`,
  },
  {
    slug: "tendencias-joyeria-artesanal-2026-chile",
    title: "7 Tendencias en Joyería Artesanal para 2026 en Chile",
    excerpt:
      "Las tendencias que están definiendo la joyería artesanal chilena este año: desde el minimalismo orgánico hasta la joyería regenerativa.",
    category: "TENDENCIAS" as const,
    tags: [
      "tendencias",
      "joyería 2026",
      "moda",
      "diseño",
      "joyería artesanal",
    ],
    seoTitle:
      "Tendencias Joyería Artesanal 2026 Chile: 7 Movimientos que Definen el Año",
    seoDescription:
      "Descubre las 7 tendencias en joyería artesanal chilena para 2026. Minimalismo orgánico, piedras locales, oro reciclado y más.",
    coverImage: "/blog/tendencias-2026.jpg",
    readingTime: 8,
    content: `## El pulso de la joyería artesanal en 2026

La joyería artesanal chilena está viviendo un momento de efervescencia creativa. Los orfebres están experimentando con nuevas técnicas, recuperando tradiciones ancestrales, y respondiendo a una generación de consumidores que quiere saber exactamente quién hizo su joya, con qué material, y bajo qué valores.

Estas son las siete tendencias que están marcando el 2026 en la escena orfebre chilena.

## 1. Minimalismo orgánico

La tendencia más fuerte del año combina la simplicidad del diseño minimalista con formas inspiradas en la naturaleza. Estamos hablando de anillos que parecen ramas delgadas, aros que evocan gotas de agua, collares con texturas que recuerdan la corteza de un árbol.

No es minimalismo frío ni geométrico — es un minimalismo cálido, con imperfecciones intencionales que recuerdan que una mano humana creó esa pieza. Las líneas no son perfectamente rectas, las superficies tienen textura, los bordes son suaves.

Los orfebres chilenos están adoptando esta estética porque se alinea naturalmente con el trabajo manual: la mano del artesano deja su huella, y eso es justamente lo que el comprador busca.

## 2. Piedras locales chilenas

El lapislázuli siempre ha sido protagonista, pero en 2026 la paleta se amplía. Los orfebres están incorporando piedras que antes pasaban desapercibidas:

- **Crisocola**: Verde-azul vibrante, encontrada en el norte de Chile.
- **Cuarzo rutilado**: Transparente con hilos dorados internos, de la zona central.
- **Obsidiana**: Negra volcánica, de la región de la Araucanía.
- **Turquesa chilena**: Más verdosa que la turquesa norteamericana, con carácter propio.

Esta tendencia responde a un interés por lo local y lo trazable. Los compradores quieren saber no solo quién hizo la joya, sino de dónde viene cada elemento.

## 3. Joyería regenerativa

El concepto de "regenerativo" va más allá de lo sostenible. No se trata solo de no dañar — se trata de generar un impacto positivo. En joyería, esto se traduce en:

- Usar **plata reciclada** de componentes electrónicos o joyería antigua fundida.
- Trabajar con **oro ético** de minería artesanal responsable.
- Crear piezas que incorporan **materiales recuperados** del océano (conchas, coral fosil).
- Prácticas de taller con **zero waste**: cada recorte de metal se reutiliza.

Varios [orfebres de Casa Orfebre](/orfebres) ya trabajan bajo estos principios y lo comunican transparentemente en la descripción de sus piezas.

## 4. Piezas convertibles

La versatilidad es clave. Los orfebres están diseñando piezas que se transforman:

- Un **collar largo** que se puede enrollar como pulsera doble.
- **Aros** con elementos desmontables: puedes usar solo el aro base o agregar un colgante.
- **Anillos apilables** diseñados para combinarse de múltiples formas.
- **Broches** que funcionan también como colgantes.

Esta tendencia responde a una vida donde una misma persona puede ir de una reunión de trabajo a una cena sin pasar por casa. Las piezas convertibles se adaptan al momento.

## 5. Oro reciclado y aleaciones experimentales

El oro reciclado está dejando de ser nicho para convertirse en estándar. Los orfebres que trabajan en oro están eligiendo fundir piezas antiguas en desuso, reduciendo la dependencia de la minería.

Pero la innovación va más allá: algunos artesanos están experimentando con aleaciones no convencionales:

- **Shakudo**: Aleación japonesa de cobre y oro que produce un color púrpura-negro fascinante.
- **Electrum**: Aleación natural de oro y plata, con un tono verdoso dorado único.
- **Oro verde**: Aleación de oro con plata pura, sin cobre, que da un tono amarillo-verdoso sutil.

> "El futuro de la joyería no está en extraer más — está en transformar lo que ya existe con más ingenio."

## 6. Personalización con significado

La personalización ya no se limita a grabar un nombre. Los orfebres están ofreciendo experiencias donde el comprador participa en el proceso creativo:

- Elegir la **piedra específica** de un lote (no solo el tipo, sino la piedra exacta).
- Definir el **acabado** de la superficie: pulido espejo, satinado, martillado, oxidado.
- Incorporar **elementos personales**: un trozo de cuarzo encontrado en un viaje, una gema heredada re-engastada.
- Co-diseñar la pieza en conversación con el orfebre, desde el boceto hasta la entrega.

En Casa Orfebre, los productos marcados como "Personalizable" permiten este tipo de [colaboración directa](/coleccion) con el orfebre.

## 7. Joyería de identidad territorial

La última tendencia — y quizás la más profunda — es la joyería que habla de un lugar. Orfebres de distintas regiones de Chile están creando piezas que representan su territorio:

- Orfebres del **norte** trabajan con cobre y piedras del desierto.
- Artesanos de la **zona central** incorporan motivos de la flora nativa del bosque esclerófilo.
- Creadores del **sur** se inspiran en la platería mapuche y los paisajes de bosque y lluvia.
- Orfebres de **Chiloé** usan maderas nativas combinadas con plata.

Esta tendencia conecta con el creciente interés por lo local y la identidad cultural. No es joyería genérica que podría venir de cualquier parte — es joyería que solo puede existir porque su creador vive y trabaja en un lugar específico de Chile.

## El futuro ya está en las manos de los orfebres

Estas tendencias no son predicciones teóricas — ya están sucediendo. Los [orfebres que forman parte de Casa Orfebre](/orfebres) están liderando varios de estos movimientos, y sus piezas reflejan la evolución constante de un oficio milenario.

Explora nuestra [colección](/coleccion) y descubre cómo estas tendencias se materializan en piezas que puedes llevar contigo.`,
  },
  {
    slug: "por-que-comprar-joyeria-artesanal-vs-industrial",
    title:
      "Por Qué Comprar Joyería Artesanal: 10 Razones vs. la Joyería Industrial",
    excerpt:
      "Unicidad, calidad, impacto social y más: las razones concretas por las que elegir una joya hecha a mano marca la diferencia.",
    category: "CULTURA" as const,
    tags: [
      "joyería artesanal",
      "joyería hecha a mano",
      "sostenibilidad",
      "consumo consciente",
    ],
    seoTitle:
      "10 Razones para Comprar Joyería Artesanal vs Industrial | Casa Orfebre",
    seoDescription:
      "Descubre por qué la joyería artesanal supera a la industrial: unicidad, calidad superior, apoyo local, sostenibilidad y más.",
    coverImage: "/blog/artesanal-vs-industrial.jpg",
    readingTime: 9,
    content: `## La diferencia que se siente

Hay una diferencia palpable entre ponerte una joya artesanal y una industrial. La artesanal tiene peso — no solo físico, sino emocional. Sabes que alguien se sentó en un taller, con herramientas que conoce como extensiones de sus manos, y creó esa pieza. La industrial salió de un molde que produce miles de copias idénticas.

Pero más allá de la romantización, hay razones concretas y prácticas para elegir lo artesanal. Aquí van diez.

## 1. Unicidad garantizada

Cada pieza artesanal es ligeramente diferente. Incluso cuando un orfebre crea una "serie" de anillos similares, cada uno tiene variaciones sutiles en la textura, el acabado, el peso. Tu joya no es la misma que la de nadie.

La joyería industrial, por definición, busca eliminar estas variaciones. Cada pieza es idéntica a las demás. Y eso, paradójicamente, la hace menos valiosa.

## 2. Calidad de materiales superior

Los orfebres artesanales chilenos trabajan predominantemente con **plata 950** — más pura que la plata 925 que usa la industria masiva. Cuando usan oro, es generalmente **18 quilates**, no los 10k o 14k que dominan en la joyería comercial de precio medio.

¿Por qué? Porque el orfebre firma cada pieza con su nombre y reputación. No puede permitirse usar materiales de menor calidad — su nombre está en juego.

## 3. Apoyo directo a artesanos locales

Cuando compras en una gran cadena de joyería, tu dinero se distribuye entre shareholders, marketing masivo, arriendos de tiendas premium y márgenes corporativos. Una fracción mínima llega al fabricante (generalmente una fábrica en Asia).

Cuando compras a un orfebre — directamente o a través de un marketplace como [Casa Orfebre](/coleccion) — la mayor parte del valor llega al artesano y su taller. Estás financiando directamente un oficio, una tradición, una familia.

## 4. Sostenibilidad real, no marketing

La industria de la joyería masiva tiene un problema ambiental serio: minería destructiva, emisiones de transporte global, envases plásticos, obsolescencia planificada.

La joyería artesanal opera en una escala completamente diferente:
- Talleres pequeños con bajo consumo energético
- Compra local de materiales
- Reutilización de recortes y sobrantes
- Cero sobreproducción (se hace lo que se vende)
- Sin envases plásticos innecesarios

## 5. La historia detrás de la pieza

Cuando compras una joya artesanal, puedes saber exactamente quién la hizo, con qué técnica, en qué ciudad, y qué inspiró el diseño. En Casa Orfebre, cada producto incluye la [historia del orfebre](/orfebres) y muchas veces la narrativa detrás de la pieza específica.

Una joya industrial tiene una historia que se reduce a: "se fabricó en una línea de producción, se empacó, se envió a una tienda."

> "Una joya sin historia es solo un metal con forma. Una joya con historia es un pedazo de vida que puedes llevar contigo."

## 6. Inversión que se revaloriza

La joyería industrial pierde valor en el momento en que la compras — como un auto nuevo que sale de la agencia. La joyería artesanal de calidad, especialmente en metales nobles, mantiene su valor material y puede aumentar su valor como objeto de colección.

Los orfebres que construyen una trayectoria reconocida ven cómo sus piezas tempranas se revalorizan. Comprar artesanal hoy puede ser una inversión inteligente para mañana.

## 7. Personalización genuina

La "personalización" en la joyería industrial se limita a grabar un nombre con láser en una pieza estándar. La personalización artesanal es otra cosa: puedes conversar con el orfebre, elegir la piedra, ajustar el diseño, cambiar el acabado, incluso co-crear la pieza desde cero.

Es la diferencia entre poner una calcomanía en un auto de serie y diseñar un auto a medida.

## 8. Conexión emocional

Hay algo intangible pero real en saber que un ser humano dedicó horas a crear lo que llevas puesto. Esa conexión no se puede fabricar industrialmente — es un subproducto natural del proceso artesanal.

Los compradores de joyería artesanal reportan consistentemente una relación más duradera con sus piezas. Las cuidan más, las usan más, las regalan con más intención.

## 9. Impacto social positivo

Cada compra artesanal fortalece un ecosistema: el orfebre compra materiales a proveedores locales, paga arriendos de talleres en barrios que necesitan actividad económica, enseña su oficio a aprendices, y mantiene viva una tradición cultural.

La joyería industrial, por otro lado, concentra la riqueza en grandes corporaciones y externaliza los costos sociales y ambientales.

## 10. Arte portátil

Una joya artesanal es, en el sentido más literal, una obra de arte que puedes llevar contigo. No está detrás de un vidrio en un museo — está en tu cuello, en tus manos, en tus orejas. Es arte funcional, íntimo, cotidiano.

Los mejores orfebres son artistas que eligieron un soporte particular para su expresión. Sus piezas merecen el mismo respeto que una pintura o una escultura — con la ventaja de que puedes vivirlas, no solo mirarlas.

## Haz la diferencia con tu próxima compra

Elegir joyería artesanal no es solo una preferencia estética — es una decisión que impacta a personas reales, comunidades locales y el medio ambiente. Cada pieza que compras a un orfebre independiente es un voto por el tipo de economía y cultura que quieres apoyar.

Explora nuestra [colección de joyas artesanales](/coleccion) y conecta con los [orfebres](/orfebres) que las crean. Cada pieza viene con certificado de autenticidad y la historia completa de su creación.`,
  },
];

async function main() {
  // Get or create a system user for blog authorship
  let author = await prisma.user.findFirst({
    where: { email: "blog@casaorfebre.cl" },
  });

  if (!author) {
    author = await prisma.user.create({
      data: {
        email: "blog@casaorfebre.cl",
        name: "Casa Orfebre",
        role: "ADMIN",
      },
    });
    console.log("Created blog author user");
  }

  for (const post of posts) {
    const existing = await prisma.blogPost.findUnique({
      where: { slug: post.slug },
    });

    if (existing) {
      console.log(`  Skip (exists): ${post.slug}`);
      continue;
    }

    await prisma.blogPost.create({
      data: {
        ...post,
        authorId: author.id,
        status: "PUBLISHED",
        publishedAt: new Date(
          posts.indexOf(post) === 0
            ? "2026-04-01"
            : posts.indexOf(post) === 1
              ? "2026-04-02"
              : posts.indexOf(post) === 2
                ? "2026-04-03"
                : posts.indexOf(post) === 3
                  ? "2026-04-04"
                  : "2026-04-05",
        ),
        featured: posts.indexOf(post) === 0,
      },
    });
    console.log(`  Created: ${post.slug}`);
  }

  console.log("\nDone! Blog posts seeded.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
