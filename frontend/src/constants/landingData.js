/**
 * landingData.js
 * Datos estáticos de la landing page.
 * Contiene los textos de: navegación, phone mockup, features, pasos,
 * equipo, preguntas frecuentes y links del footer.
 */

export const NAV_LINKS = [
  { href: '#inicio', label: 'Inicio' },
  { href: '#caracteristicas', label: 'Características' },
  { href: '#como-funciona', label: 'Cómo funciona' },
  { href: '#equipo', label: 'Equipo' },
  { href: '#faq', label: 'Preguntas' },
];

export const PHONE_ITEMS = [
  { initials: 'MT', name: 'María Torres', time: 'Hoy, 4:10 p.m.', amount: 'S/ 8.50', status: 'pending', color: '#1F8A4C' },
  { initials: 'JP', name: 'Juan Pérez', time: 'Ayer, 1:45 p.m.', amount: 'S/ 35.00', status: 'paid', color: '#2B2D42' },
  { initials: 'RD', name: 'Rosa Díaz', time: 'Lun, 9:20 a.m.', amount: 'S/ 14.00', status: 'pending', color: '#E63946' },
];

export const FEATURES = [
  { id: 1, num: '01', title: 'Control de fiados', description: 'Registra quién te debe, cuánto y desde cuándo, en el tiempo que te toma anotarlo en papel.', accent: '#1F8A4C', size: 'lg', icon: 'list' },
  { id: 2, num: '02', title: 'Inventario simple', description: 'Organiza tus productos por categoría y entérate qué se te está por acabar.', accent: '#D9A21B', size: 'lg', icon: 'box' },
  { id: 3, num: '03', title: 'Varias tiendas, una cuenta', description: 'Si manejas más de un local, revisa el estado de todos desde el mismo lugar.', accent: '#E63946', size: 'default', icon: 'grid' },
  { id: 4, num: '04', title: 'Reportes claros', description: 'Mira cuánto te deben en total y quién se está atrasando, sin sacar cuentas a mano.', accent: '#2B2D42', size: 'default', icon: 'chart' },
  { id: 5, num: '05', title: 'Tus clientes, informados', description: 'Quien te fía puede revisar su propia deuda desde su celular, sin tener que llamarte.', accent: '#1F8A4C', size: 'default', icon: 'user' },
  { id: 6, num: '06', title: 'Datos protegidos', description: 'La información de tu tienda y de tus clientes se guarda de forma segura y solo tú ves el detalle completo.', accent: '#F2C94C', size: 'wide', icon: 'shield' },
];

export const STEPS = [
  { id: 1, title: 'Crea tu tienda', description: 'Regístrate con tus datos y arma el perfil de tu bodega en minutos.' },
  { id: 2, title: 'Agrega tu inventario', description: 'Sube tus productos con precio y categoría, tal como los tienes en tu tienda.' },
  { id: 3, title: 'Registra un fiado', description: 'Elige al cliente, el producto y el monto. Queda anotado al instante.' },
  { id: 4, title: 'Cobra y lleva el control', description: 'Marca como pagado cuando te cancelen y revisa tu historial cuando quieras.' },
];

export const TEAM = [
  { name: 'Alessandro', role: 'UI y UX del panel web (React)', initial: 'A', color: '#E63946' },
  { name: 'David', role: 'UI y UX de la app (Flutter)', initial: 'D', color: '#F2C94C' },
  { name: 'Hector', role: 'Modelamiento de base de datos', initial: 'H', color: '#1F8A4C' },
  { name: 'Jonel', role: 'Organización del flujo de trabajo', initial: 'J', color: '#2B2D42' },
];

export const QUESTIONS = [
  { q: '¿Fiadito reemplaza mi cuaderno de fiados?', a: 'Sí. Hace lo mismo que tu cuaderno de toda la vida, pero no se moja, no se pierde y nunca se te acaban las hojas.' },
  { q: '¿Necesito internet para usarlo?', a: 'Necesitas conexión para sincronizar tus datos, así siempre tienes un respaldo aunque tu celular se dañe o lo cambies.' },
  { q: '¿Mis clientes tienen que instalar algo?', a: 'No es obligatorio. Tus clientes pueden tener su propia cuenta para ver cuánto deben, pero tú puedes manejar todo desde tu tienda sin que ellos la usen.' },
  { q: '¿Es seguro guardar los datos de mis clientes?', a: 'Sí. La información se guarda de forma protegida y solo tú puedes ver el detalle completo de tu tienda.' },
  { q: '¿Puedo usarlo si tengo más de una tienda?', a: 'Sí, puedes administrar todas tus tiendas desde una sola cuenta.' },
];

export const FOOTER_LINKS = [
  { href: '#inicio', label: 'Inicio' },
  { href: '#caracteristicas', label: 'Características' },
  { href: '#como-funciona', label: 'Cómo funciona' },
  { href: '#equipo', label: 'Equipo' },
  { href: '#faq', label: 'Preguntas' },
];