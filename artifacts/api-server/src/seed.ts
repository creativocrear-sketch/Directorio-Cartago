import bcrypt from "bcryptjs";
import { db } from "@workspace/db";
import {
  categoriesTable,
  usersTable,
  businessesTable,
  businessImagesTable,
  subscriptionPlansTable,
} from "@workspace/db";

export async function seedIfEmpty() {
  const existing = await db.select().from(categoriesTable).limit(1);
  if (existing.length > 0) return;

  console.log("[seed] Base de datos vacía, sembrando datos iniciales...");

  // Categories
  const categories = await db
    .insert(categoriesTable)
    .values([
      { name: "Restaurantes", icon: "UtensilsCrossed", description: "Comida y bebida" },
      { name: "Tiendas", icon: "ShoppingBag", description: "Comercio y tiendas" },
      { name: "Servicios", icon: "Wrench", description: "Servicios profesionales" },
      { name: "Salud", icon: "Heart", description: "Salud y bienestar" },
      { name: "Educación", icon: "GraduationCap", description: "Centros educativos" },
      { name: "Entretenimiento", icon: "Music", description: "Entretenimiento y ocio" },
      { name: "Tecnología", icon: "Laptop", description: "Tecnología y electrónica" },
      { name: "Belleza", icon: "Sparkles", description: "Salones y estética" },
      { name: "Transporte", icon: "Car", description: "Transporte y logística" },
      { name: "Hoteles", icon: "Hotel", description: "Hospedaje y alojamiento" },
    ])
    .returning();

  const catMap: Record<string, number> = {};
  for (const c of categories) catMap[c.name] = c.id;

  // Subscription plans
  await db.insert(subscriptionPlansTable).values([
    {
      name: "Básico",
      description: "Aparece en el directorio con información básica",
      price: "0",
      durationDays: 0,
      isActive: true,
    },
    {
      name: "Premium Mensual",
      description: "Información completa + mapa + redes sociales + destacado",
      price: "9900",
      durationDays: 30,
      isActive: true,
    },
    {
      name: "Premium Trimestral",
      description: "Todo Premium por 3 meses con 16% de descuento",
      price: "24900",
      durationDays: 90,
      isActive: true,
    },
    {
      name: "Premium Anual",
      description: "Todo Premium por 1 año con 33% de descuento",
      price: "79900",
      durationDays: 365,
      isActive: true,
    },
  ]);

  // Admin user
  const adminHash = await bcrypt.hash("admin123", 12);
  const [admin] = await db
    .insert(usersTable)
    .values({
      name: "Administrador",
      email: "admin@directoriocartago.co",
      passwordHash: adminHash,
      role: "admin",
    })
    .returning();

  // Business owner user
  const ownerHash = await bcrypt.hash("owner123", 12);
  const [owner] = await db
    .insert(usersTable)
    .values({
      name: "Juan García",
      email: "juan@ejemplo.co",
      passwordHash: ownerHash,
      role: "business_owner",
    })
    .returning();

  const ownerId = owner.id;

  // Businesses
  const businessData = [
    {
      name: "Restaurante El Buen Sabor",
      description: "El mejor restaurante de comida típica colombiana en Cartago. Especialidad en bandeja paisa y sancocho.",
      address: "Carrera 5 #10-23, Centro, Cartago, Valle del Cauca",
      phone: "3001234568",
      whatsapp: "573001234568",
      instagram: "@buensaborcartago",
      categoryId: catMap["Restaurantes"],
      image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600",
    },
    {
      name: "Tech Store Cartago",
      description: "Tienda especializada en tecnología, celulares, laptops y accesorios. Reparación de equipos.",
      address: "Calle 12 #4-45, Cartago, Valle del Cauca",
      instagram: "@techstorecartago",
      categoryId: catMap["Tecnología"],
      image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600",
    },
    {
      name: "La Terraza Paisa",
      description: "Auténtica comida paisa con vista panorámica. Especialidad en bandeja paisa, chicharrón y mazamorra.",
      address: "Avenida 4 Norte #15-30, Cartago",
      phone: "3102345670",
      whatsapp: "573102345670",
      instagram: "@laterrazapaisa",
      facebook: "La Terraza Paisa",
      website: "https://laterrazapaisa.com",
      googleMapsUrl: "https://maps.google.com/?q=Cartago+Valle",
      categoryId: catMap["Restaurantes"],
      image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600",
    },
    {
      name: "Almacén El Progreso",
      description: "Ropa, calzado y accesorios para toda la familia. Los mejores precios de Cartago.",
      address: "Centro Comercial Unico, Local 23, Cartago",
      phone: "3203456781",
      instagram: "@almacenelprogreso",
      categoryId: catMap["Tiendas"],
      image: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=600",
    },
    {
      name: "Clínica Odontológica Sonría",
      description: "Servicio odontológico completo: ortodoncia, blanqueamiento, implantes y más.",
      address: "Calle 14 #3-20, Cartago, Valle del Cauca",
      phone: "3154567892",
      whatsapp: "573154567892",
      instagram: "@clinicasonria",
      website: "https://clinicasonria.com",
      categoryId: catMap["Salud"],
      image: "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=600",
    },
    {
      name: "García & Asociados Abogados",
      description: "Firma de abogados especializada en derecho civil, laboral y comercial.",
      address: "Carrera 7 #12-55, Piso 3, Cartago",
      phone: "3005678903",
      whatsapp: "573005678903",
      instagram: "@garciaabogados",
      categoryId: catMap["Servicios"],
      image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600",
    },
    {
      name: "Centro de Idiomas Lingua",
      description: "Cursos de inglés, francés y portugués para todas las edades.",
      address: "Avenida 3 #8-40, Cartago",
      phone: "3106789014",
      instagram: "@idiomaslingua",
      website: "https://idiomaslingua.edu.co",
      categoryId: catMap["Educación"],
      image: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=600",
    },
    {
      name: "Billar El Rincón del Valle",
      description: "El mejor billar de Cartago. Mesas profesionales, ambiente familiar y buena música.",
      address: "Calle 10 #6-30, Cartago, Valle del Cauca",
      phone: "3207890125",
      instagram: "@billlarrincon",
      categoryId: catMap["Entretenimiento"],
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600",
    },
    {
      name: "Salón Glamour",
      description: "Cortes, tintes, manicure y pedicure. Tu belleza es nuestra pasión.",
      address: "Carrera 4 #11-20, Cartago",
      phone: "3108901236",
      whatsapp: "573108901236",
      instagram: "@salonglamourcartago",
      categoryId: catMap["Belleza"],
      image: "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=600",
    },
    {
      name: "Mudanzas Rápido Valle",
      description: "Servicio de mudanzas local y nacional. Embalaje profesional y transporte seguro.",
      address: "Carrera 2 #20-15, Cartago",
      phone: "3009012347",
      whatsapp: "573009012347",
      categoryId: catMap["Transporte"],
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600",
    },
    {
      name: "Hotel Boutique El Marqués",
      description: "Hotel boutique en el corazón de Cartago. Habitaciones elegantes, desayuno incluido y piscina.",
      address: "Calle 15 #5-10, Centro Histórico, Cartago",
      phone: "3151234560",
      whatsapp: "573151234560",
      instagram: "@hotelelmarques",
      website: "https://hotelelmarques.com.co",
      googleMapsUrl: "https://maps.google.com/?q=Hotel+Boutique+Cartago",
      categoryId: catMap["Hoteles"],
      image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600",
    },
    {
      name: "Farmacia Salud Total",
      description: "Medicamentos, cosméticos, vitaminas y asesoría farmacéutica personalizada.",
      address: "Carrera 6 #9-50, Cartago",
      phone: "3102234561",
      whatsapp: "573102234561",
      instagram: "@farmaciasaludtotal",
      categoryId: catMap["Salud"],
      image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600",
    },
    {
      name: "Ferretería Los Andes",
      description: "Materiales de construcción, herramientas y equipos para el hogar.",
      address: "Avenida 5 #7-30, Cartago, Valle del Cauca",
      phone: "3203334562",
      instagram: "@ferreteria_losandes",
      categoryId: catMap["Tiendas"],
      image: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=600",
    },
    {
      name: "Lavandería Express",
      description: "Lavado y planchado de ropa en 24 horas. Servicio a domicilio disponible.",
      address: "Calle 8 #4-15, Cartago",
      phone: "3004444563",
      whatsapp: "573004444563",
      instagram: "@lavanderiaexpress_cgo",
      categoryId: catMap["Servicios"],
      image: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=600",
    },
    {
      name: "Academia de Música El Pentagrama",
      description: "Clases de guitarra, piano, batería y canto para niños y adultos.",
      address: "Carrera 8 #13-40, Cartago",
      phone: "3155554564",
      instagram: "@academiaelpentagrama",
      website: "https://pentagramacartago.com",
      categoryId: catMap["Educación"],
      image: "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=600",
    },
    {
      name: "Escape Room Cartago Adventures",
      description: "3 salas temáticas de escape room. Perfectas para grupos, cumpleaños y empresas.",
      address: "Centro Comercial Unico, Piso 2, Cartago",
      phone: "3206664565",
      whatsapp: "573206664565",
      instagram: "@escaperoom_cartago",
      website: "https://cartagoadventures.com",
      categoryId: catMap["Entretenimiento"],
      image: "https://images.unsplash.com/photo-1516302752625-fcc3c50ae61f?w=600",
    },
    {
      name: "Soluciones IT del Valle",
      description: "Reparación de computadores, redes empresariales y soporte técnico.",
      address: "Calle 16 #3-80, Cartago",
      phone: "3007774566",
      whatsapp: "573007774566",
      instagram: "@solucionesit_valle",
      categoryId: catMap["Tecnología"],
      image: "https://images.unsplash.com/photo-1573164713988-8665fc963095?w=600",
    },
    {
      name: "Spa & Masajes Zen",
      description: "Masajes relajantes, tratamientos faciales y terapias alternativas.",
      address: "Carrera 9 #14-20, Cartago",
      phone: "3108884567",
      whatsapp: "573108884567",
      instagram: "@spawellnesszen",
      categoryId: catMap["Belleza"],
      image: "https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=600",
    },
    {
      name: "ServitaxiCartago",
      description: "Servicio de taxi las 24 horas. Viajes dentro y fuera de la ciudad.",
      address: "Cartago, Valle del Cauca",
      phone: "3009994568",
      whatsapp: "573009994568",
      instagram: "@servitaxicartago",
      categoryId: catMap["Transporte"],
      image: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=600",
    },
    {
      name: "Hostal Vida Verde",
      description: "Hostal ecológico con jardín, desayuno orgánico y ambiente tranquilo.",
      address: "Carrera 3 #18-50, Cartago",
      phone: "3152224569",
      whatsapp: "573152224569",
      instagram: "@hostalvidaverde",
      categoryId: catMap["Hoteles"],
      image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600",
    },
    {
      name: "Pizza Don Marco",
      description: "Pizza artesanal al horno de leña, pastas frescas y antipastos. Delivery disponible.",
      address: "Avenida 2 Norte #12-60, Cartago",
      phone: "3203114570",
      whatsapp: "573203114570",
      instagram: "@pizzadonmarco",
      website: "https://pizzadonmarco.com",
      googleMapsUrl: "https://maps.google.com/?q=Pizza+Don+Marco+Cartago",
      categoryId: catMap["Restaurantes"],
      image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600",
    },
  ];

  for (const biz of businessData) {
    const { image, ...bizData } = biz;
    const [b] = await db
      .insert(businessesTable)
      .values({ ...bizData, ownerId, status: "approved" })
      .returning();

    await db.insert(businessImagesTable).values({
      businessId: b.id,
      url: image,
      isPrimary: true,
    });
  }

  console.log(`[seed] ✓ ${categories.length} categorías, ${businessData.length} negocios, 2 usuarios creados.`);
}
