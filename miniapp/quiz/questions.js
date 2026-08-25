// Билеты. Категория «B». г. Кордова. Аргентина.
// Формат: es/ru — вопрос на испанском и русском, options — варианты ответа,
// correct — ключ правильного варианта ('a' | 'b' | 'c').
//
// Как добавить новые вопросы: пришли текст билетов в чат — они добавятся
// сюда в том же формате. Один объект = один вопрос.
const QUESTIONS = [
  {
    id: 1,
    es: "La luz amarilla intermitente del semáforo indica:",
    ru: "Мигающий жёлтый сигнал светофора сигнализирует:",
    options: [
      { key: "a", es: "Disminuir la marcha y circular con máxima precaución.", ru: "О необходимости сбавить скорость и вести автомобиль с максимальной осторожностью." },
      { key: "b", es: "Prioridad de paso.", ru: "О приоритете проезда." },
      { key: "c", es: "Prohibido pasar.", ru: "О запрете проезда." },
    ],
    correct: "a",
  },
  {
    id: 2,
    es: "¿Quién tiene prioridad de paso en una rotonda?",
    ru: "Кто имеет преимущественное право проезда на кольцевой развязке (на кольце)?",
    options: [
      { key: "a", es: "El que intenta ingresar (entrar) a la misma.", ru: "Тот, кто пытается заехать на кольцевую развязку." },
      { key: "b", es: "El que está circulando por la misma.", ru: "Тот, кто по ней уже движется (на ней находится)." },
    ],
    correct: "b",
  },
  {
    id: 3,
    es: 'La "banda de detención", que es la línea transversal ancha marcada sobre la calzada (pavimento), indica:',
    ru: "«Стоп-полоса», представляющая собой широкую поперечную линию, нанесённую на дорогу (дорожное покрытие), обозначает:",
    options: [
      { key: "a", es: "El cruce peatonal.", ru: "Пешеходный переход." },
      { key: "b", es: "La obligación de detener el vehículo antes de esta línea.", ru: "Обязанность остановки транспортного средства перед этой линией." },
      { key: "c", es: "Indica separación de carriles.", ru: "Указывает на разделение полос движения." },
    ],
    correct: "b",
  },
  {
    id: 4,
    es: '¿En curvas o pendientes qué indica la demarcación horizontal "doble línea amarilla o blanca continua"?',
    ru: 'Что означает горизонтальная демаркационная линия "двойная жёлтая или сплошная белая линия" на поворотах или склонах?',
    options: [
      { key: "a", es: "Que puede adelantarse.", ru: "Что можно обгонять." },
      { key: "b", es: "Que no se puede adelantar.", ru: "Что НЕЛЬЗЯ обгонять." },
      { key: "c", es: "Que hay un obstáculo en el camino.", ru: "Что на пути имеется препятствие." },
    ],
    correct: "b",
  },
  {
    id: 5,
    es: "Está atravesando un cruce de avenidas sin semáforos a 30 Km/h, Ud. está:",
    ru: "Вы проезжаете перекрёсток, не оборудованный светофором, со скоростью 30 км/ч, в этом случае вы:",
    options: [
      { key: "a", es: "Conduciendo demasiado despacio.", ru: "Едете слишком медленно." },
      { key: "b", es: "Conduciendo de acuerdo con el reglamento.", ru: "Управляете транспортным средством в соответствии с правилами." },
      { key: "c", es: "Sobrepasando el límite de velocidad.", ru: "Превышаете скоростной лимит." },
    ],
    correct: "b",
  },
  {
    id: 6,
    es: "En esta intersección Ud. conduce el auto rojo, debe:",
    ru: "На этом перекрёстке вы управляете автомобилем красного цвета, и в указанной ситуации вы должны:",
    options: [
      { key: "a", es: "Detenerse obligatoriamente y ceder el paso a todos los vehículos (autos amarillo y verde).", ru: "Остановиться и уступить дорогу всем транспортным средствам (автомобилям жёлтого и зелёного цвета)." },
      { key: "b", es: "Detenerse sólo para cederle el paso al auto amarillo.", ru: "Остановиться только для того, чтобы уступить дорогу автомобилю жёлтого цвета." },
    ],
    correct: "a",
    note: "В билете упоминается схема перекрёстка (расположение красного/жёлтого/зелёного авто) — пришли картинку, если она есть, добавлю её к вопросу.",
  },
  {
    id: 7,
    es: "¿En intersecciones (bocacalles) semaforizadas debe avanzar con luz verde a su frente, si del otro lado de la intersección hay un embotellamiento de tránsito?",
    ru: "На перекрёстках (переулках), оборудованных светофорами, следует двигаться вперёд на зелёный сигнал светофора, даже если на другой стороне перекрёстка образовалась пробка?",
    options: [
      { key: "a", es: "Es indiferente.", ru: "Без разницы." },
      { key: "b", es: "No.", ru: "Нет." },
      { key: "c", es: "Sí.", ru: "Да." },
    ],
    correct: "b",
  },
  {
    id: 8,
    es: "¿Quién tiene prioridad en una senda peatonal no regulada por agente de tránsito, ni por semáforo?",
    ru: "Кто имеет преимущество на пешеходном переходе, НЕ регулируемом регулировщиком или светофором?",
    options: [
      { key: "a", es: "Los peatones en forma absoluta.", ru: "Пешеходы имеют абсолютный приоритет." },
      { key: "b", es: "Los vehículos, ya que la senda peatonal obliga a los peatones a cruzar por ella, pero cuando el tránsito vehicular lo permita.", ru: "Транспортные средства, так как пешеходный переход обязывает пешеходов переходить по нему, но только когда движение транспорта позволяет это сделать." },
    ],
    correct: "a",
  },
  // Вопрос 9 пропущен — в билете он про дорожный знак ("¿Ante esta señal
  // cuál es la conducta a seguir?"), но без картинки и вариантов ответа
  // квиз собрать нельзя. Пришли то и другое — добавлю.
];
