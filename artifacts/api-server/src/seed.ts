import bcrypt from "bcryptjs";
import { db } from "@workspace/db";
import {
  categoriesTable,
  usersTable,
  businessesTable,
  businessImagesTable,
  subscriptionPlansTable,
  subscriptionsTable,
} from "@workspace/db";
import { and, eq, gt } from "drizzle-orm";

const BUSINESS_IMAGES: Record<string, string> = {
  "Restaurante El Buen Sabor":        "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&auto=format&fit=crop&q=80",
  "Tech Store Cartago":               "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&auto=format&fit=crop&q=80",
  "La Terraza Paisa":                 "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80",
  "Almacén El Progreso":              "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=800&auto=format&fit=crop&q=80",
  "Clínica Odontológica Sonría":      "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800&auto=format&fit=crop&q=80",
  "García & Asociados Abogados":      "https://images.unsplash.com/photo-1575505586569-646b2ca898fc?w=800&auto=format&fit=crop&q=80",
  "Centro de Idiomas Lingua":         "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&auto=format&fit=crop&q=80",
  "Billar El Rincón del Valle":       "https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=800&auto=format&fit=crop&q=80",
  "Salón Glamour":                    "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&auto=format&fit=crop&q=80",
  "Mudanzas Rápido Valle":            "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop&q=80",
  "Hotel Boutique El Marqués":        "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=80",
  "Farmacia Salud Total":             "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=800&auto=format&fit=crop&q=80",
  "Ferretería Los Andes":             "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&auto=format&fit=crop&q=80",
  "Lavandería Express":               "https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=800&auto=format&fit=crop&q=80",
  "Academia de Música El Pentagrama": "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&auto=format&fit=crop&q=80",
  "Escape Room Cartago Adventures":   "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=80",
  "Soluciones IT del Valle":          "https://images.unsplash.com/photo-1518432031352-d6fc5c10da5a?w=800&auto=format&fit=crop&q=80",
  "Spa & Masajes Zen":                "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&auto=format&fit=crop&q=80",
  "ServitaxiCartago":                 "https://images.unsplash.com/photo-1549924231-f129b911e442?w=800&auto=format&fit=crop&q=80",
  "Hostal Vida Verde":                "https://images.unsplash.com/photo-1469796466635-455ede028aca?w=800&auto=format&fit=crop&q=80",
  "Pizza Don Marco":                  "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&auto=format&fit=crop&q=80",
  "Café del Parque":                  "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&auto=format&fit=crop&q=80",
  "Óptica Visión Central":            "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&auto=format&fit=crop&q=80",
  "Papelería Prisma":                 "https://images.unsplash.com/photo-1517842645767-c639042777db?w=800&auto=format&fit=crop&q=80",
  "Nube Creativa Studio":             "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&auto=format&fit=crop&q=80",
  "Fitness Center Cartago":           "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&auto=format&fit=crop&q=80",
  "Casa Coral Eventos":               "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=80",
  "Hotel Santa Mónica Plaza":         "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&auto=format&fit=crop&q=80",
  "Ruta Express Mensajería":          "https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?w=800&auto=format&fit=crop&q=80",
  "Instituto Saber Digital":          "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&auto=format&fit=crop&q=80",
};

export async function updateBusinessImages() {
  const allBusinesses = await db.select().from(businessesTable);
  let updated = 0;
  for (const biz of allBusinesses) {
    const newUrl = BUSINESS_IMAGES[biz.name];
    if (!newUrl) continue;
    await db
      .update(businessImagesTable)
      .set({ url: newUrl })
      .where(eq(businessImagesTable.businessId, biz.id));
    updated++;
  }
  console.log(`[seed] Imágenes actualizadas: ${updated}`);
  return { updated };
}

const EXPECTED_BUSINESSES = 30;

const DEMO_PREMIUM_EMAIL = "premium@directoriocartago.co";
const DEMO_PREMIUM_PASSWORD = "premium123";

export async function seedIfEmpty(force = false) {
  const existingBusinesses = await db.select().from(businessesTable);
  const existingCategories = await db.select().from(categoriesTable);

  if (!force && existingBusinesses.length >= EXPECTED_BUSINESSES && existingCategories.length >= 1) {
    console.log("[seed] Datos ya existen, omitiendo seed.");
    return { skipped: true };
  }

  console.log("[seed] Sembrando datos iniciales...");

  // Categories
  let catIds: Record<string, number> = {};

  if (existingCategories.length === 0) {
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
    for (const c of categories) catIds[c.name] = c.id;
    console.log("[seed] Categorías creadas:", categories.length);
  } else {
    const cats = await db.select().from(categoriesTable);
    for (const c of cats) catIds[c.name] = c.id;
    console.log("[seed] Categorías existentes cargadas:", cats.length, "IDs:", JSON.stringify(catIds));
  }

  // Subscription plans
  const existingPlans = await db.select().from(subscriptionPlansTable).limit(1);
  if (existingPlans.length === 0) {
    await db.insert(subscriptionPlansTable).values([
      { name: "Básico", description: "Aparece en el directorio con información básica", price: "0", durationDays: 0, isActive: true },
      { name: "Premium Mensual", description: "Información completa + mapa + redes sociales + destacado", price: "9900", durationDays: 30, isActive: true },
      { name: "Premium Trimestral", description: "Todo Premium por 3 meses con 16% de descuento", price: "24900", durationDays: 90, isActive: true },
      { name: "Premium Anual", description: "Todo Premium por 1 año con 33% de descuento", price: "79900", durationDays: 365, isActive: true },
    ].map((plan) => ({ ...plan, price: Number(plan.price) })));
    console.log("[seed] Planes creados");
  }

  const allPlans = await db.select().from(subscriptionPlansTable);
  const premiumMonthlyPlan = allPlans.find((plan) => plan.name === "Premium Mensual");

  // Users
  let ownerId: number;
  const existingOwner = await db.select().from(usersTable).where(eq(usersTable.email, "juan@ejemplo.co"));
  if (existingOwner.length === 0) {
    const adminHash = await bcrypt.hash("admin123", 12);
    await db.insert(usersTable).values({
      name: "Administrador",
      email: "admin@directoriocartago.co",
      passwordHash: adminHash,
      role: "admin",
    });

    const ownerHash = await bcrypt.hash("owner123", 12);
    const [owner] = await db.insert(usersTable).values({
      name: "Juan García",
      email: "juan@ejemplo.co",
      passwordHash: ownerHash,
      role: "business_owner",
    }).returning();
    ownerId = owner.id;
    console.log("[seed] Usuarios creados, ownerId:", ownerId);
  } else {
    ownerId = existingOwner[0].id;
    console.log("[seed] Usuario existente, ownerId:", ownerId);
  }

  const existingPremiumDemo = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, DEMO_PREMIUM_EMAIL));
  let premiumDemoId: number;
  if (existingPremiumDemo.length === 0) {
    const premiumHash = await bcrypt.hash(DEMO_PREMIUM_PASSWORD, 12);
    const [premiumUser] = await db
      .insert(usersTable)
      .values({
        name: "Usuario Premium Demo",
        email: DEMO_PREMIUM_EMAIL,
        passwordHash: premiumHash,
        role: "business_owner",
        phone: "3005550001",
      })
      .returning();
    premiumDemoId = premiumUser.id;
    console.log("[seed] Usuario premium demo creado:", premiumDemoId);
  } else {
    premiumDemoId = existingPremiumDemo[0].id;
    console.log("[seed] Usuario premium demo existente:", premiumDemoId);
  }

  if (premiumMonthlyPlan) {
    const now = new Date();
    const [activePremium] = await db
      .select()
      .from(subscriptionsTable)
      .where(
        and(
          eq(subscriptionsTable.userId, premiumDemoId),
          eq(subscriptionsTable.isActive, true),
          gt(subscriptionsTable.endDate, now),
        ),
      )
      .limit(1);

    if (!activePremium) {
      const endDate = new Date(now);
      endDate.setDate(endDate.getDate() + premiumMonthlyPlan.durationDays);

      await db
        .update(subscriptionsTable)
        .set({ isActive: false })
        .where(eq(subscriptionsTable.userId, premiumDemoId));

      await db.insert(subscriptionsTable).values({
        userId: premiumDemoId,
        planId: premiumMonthlyPlan.id,
        startDate: now,
        endDate,
        isActive: true,
        paymentReference: "SEED-PREMIUM-DEMO",
      });
      console.log("[seed] Suscripcion Premium demo creada");
    }
  }

  // Businesses
  const existingBiz = await db.select().from(businessesTable);
  console.log("[seed] Negocios existentes:", existingBiz.length, "/ esperados:", EXPECTED_BUSINESSES);

  if (existingBiz.length >= EXPECTED_BUSINESSES) {
    console.log("[seed] Negocios ya completos.");
    return { skipped: false, message: "already complete" };
  }

  const existingNames = new Set(existingBiz.map(b => b.name));

  const businessData = [
    { name: "Café del Parque", description: "Café de especialidad con brunch, panadería artesanal y espacio para reuniones tranquilas cerca del parque principal.", address: "Carrera 5 #9-18, Centro, Cartago", phone: "3174408891", whatsapp: "573174408891", instagram: "@cafedelparquecartago", facebook: "CafeDelParqueCartago", website: "cafedelparque.co", googleMapsUrl: "https://maps.google.com/?q=Cafe+del+Parque+Cartago", schedule: "Lunes a sábado\n7:00 a. m. - 8:00 p. m.", catName: "Restaurantes", image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600" },
    { name: "Óptica Visión Central", description: "Exámenes visuales, monturas modernas y lentes formulados con entrega rápida para toda la familia.", address: "Calle 11 #6-22, Cartago", phone: "3159042210", whatsapp: "573159042210", instagram: "@visioncentralcartago", facebook: "VisionCentralCartago", website: "visioncentralcartago.com", googleMapsUrl: null, schedule: "Lunes a viernes\n8:00 a. m. - 6:30 p. m.\nSábados 8:00 a. m. - 2:00 p. m.", catName: "Salud", image: "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=600" },
    { name: "Papelería Prisma", description: "Útiles escolares, impresiones, regalos y soluciones rápidas para estudiantes, docentes y oficinas.", address: "Carrera 4 #10-41, Cartago", phone: "3005123478", whatsapp: "573005123478", instagram: "@papeleriaprisma", facebook: null, website: null, googleMapsUrl: null, schedule: "Lunes a sábado\n8:00 a. m. - 7:00 p. m.", catName: "Tiendas", image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600" },
    { name: "Nube Creativa Studio", description: "Diseño gráfico, branding, fotografía de producto y manejo de redes para negocios de Cartago y el norte del Valle.", address: "Avenida del Río #7-60, Oficina 201, Cartago", phone: "3207415520", whatsapp: "573207415520", instagram: "@nubecreativastudio", facebook: "NubeCreativaStudio", website: "nubecreativa.studio", googleMapsUrl: null, schedule: "Lunes a viernes\n9:00 a. m. - 6:00 p. m.", catName: "Servicios", image: "https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=600" },
    { name: "Fitness Center Cartago", description: "Gimnasio con entrenamiento funcional, pesas, clases guiadas y planes personalizados para todos los niveles.", address: "Calle 13 #7-54, Cartago", phone: "3182231445", whatsapp: "573182231445", instagram: "@fitnesscartago", facebook: null, website: null, googleMapsUrl: null, schedule: "Lunes a viernes\n5:00 a. m. - 9:00 p. m.\nSábados 7:00 a. m. - 2:00 p. m.", catName: "Salud", image: "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=600" },
    { name: "Casa Coral Eventos", description: "Salón para celebraciones, eventos corporativos y reuniones familiares con decoración, sonido y catering.", address: "Vía Ansermanuevo km 2, Cartago", phone: "3128805521", whatsapp: "573128805521", instagram: "@casacoraleventos", facebook: "CasaCoralEventos", website: "casacoral.co", googleMapsUrl: "https://maps.google.com/?q=Casa+Coral+Eventos+Cartago", schedule: "Atención por reservas\nTodos los días 9:00 a. m. - 6:00 p. m.", catName: "Entretenimiento", image: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=600" },
    { name: "Hotel Santa Mónica Plaza", description: "Alojamiento ejecutivo con parqueadero, desayuno, Wi-Fi de alta velocidad y salones para reuniones.", address: "Calle 12 #5-33, Cartago", phone: "3116637822", whatsapp: "573116637822", instagram: "@hotelsantamonicaplaza", facebook: null, website: "hotelsantamonicaplaza.com", googleMapsUrl: "https://maps.google.com/?q=Hotel+Santa+Monica+Plaza+Cartago", schedule: "Recepción 24 horas", catName: "Hoteles", image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600" },
    { name: "Ruta Express Mensajería", description: "Mensajería urbana, domicilios empresariales y entregas el mismo día en Cartago y municipios cercanos.", address: "Carrera 3 #14-08, Cartago", phone: "3008844201", whatsapp: "573008844201", instagram: "@rutaexpresscartago", facebook: null, website: null, googleMapsUrl: null, schedule: "Lunes a sábado\n7:30 a. m. - 6:30 p. m.", catName: "Transporte", image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600" },
    { name: "Instituto Saber Digital", description: "Cursos cortos en herramientas digitales, ofimática, marketing y habilidades laborales para jóvenes y adultos.", address: "Carrera 6 #11-72, Cartago", phone: "3162209074", whatsapp: "573162209074", instagram: "@saberdigitalcartago", facebook: "InstitutoSaberDigital", website: "saberdigital.edu.co", googleMapsUrl: null, schedule: "Lunes a viernes\n8:00 a. m. - 8:00 p. m.", catName: "EducaciÃ³n", image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600" },
    { name: "Mercado Verde La 14", description: "Frutas, verduras, productos saludables y mercado fresco con servicio a domicilio en varios sectores de Cartago.", address: "Calle 14 #4-17, Cartago", phone: "3215019820", whatsapp: "573215019820", instagram: "@mercadoverdelacatorce", facebook: null, website: null, googleMapsUrl: null, schedule: "Lunes a domingo\n7:00 a. m. - 7:30 p. m.", catName: "Tiendas", image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=600" },
    { name: "Restaurante El Buen Sabor", description: "El mejor restaurante de comida típica colombiana en Cartago. Especialidad en bandeja paisa y sancocho.", address: "Carrera 5 #10-23, Centro, Cartago, Valle del Cauca", phone: "3001234568", whatsapp: "573001234568", instagram: "@buensaborcartago", facebook: null, website: null, googleMapsUrl: null, catName: "Restaurantes", image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600" },
    { name: "Tech Store Cartago", description: "Tienda especializada en tecnología, celulares, laptops y accesorios. Reparación de equipos.", address: "Calle 12 #4-45, Cartago, Valle del Cauca", phone: null, whatsapp: null, instagram: "@techstorecartago", facebook: null, website: null, googleMapsUrl: null, catName: "Tecnología", image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600" },
    { name: "La Terraza Paisa", description: "Auténtica comida paisa con vista panorámica. Especialidad en bandeja paisa, chicharrón y mazamorra.", address: "Avenida 4 Norte #15-30, Cartago", phone: "3102345670", whatsapp: "573102345670", instagram: "@laterrazapaisa", facebook: "La Terraza Paisa", website: "https://laterrazapaisa.com", googleMapsUrl: "https://maps.google.com/?q=Cartago+Valle", catName: "Restaurantes", image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600" },
    { name: "Almacén El Progreso", description: "Ropa, calzado y accesorios para toda la familia. Los mejores precios de Cartago.", address: "Centro Comercial Unico, Local 23, Cartago", phone: "3203456781", whatsapp: null, instagram: "@almacenelprogreso", facebook: null, website: null, googleMapsUrl: null, catName: "Tiendas", image: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=600" },
    { name: "Clínica Odontológica Sonría", description: "Servicio odontológico completo: ortodoncia, blanqueamiento, implantes y más.", address: "Calle 14 #3-20, Cartago, Valle del Cauca", phone: "3154567892", whatsapp: "573154567892", instagram: "@clinicasonria", facebook: null, website: "https://clinicasonria.com", googleMapsUrl: null, catName: "Salud", image: "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=600" },
    { name: "García & Asociados Abogados", description: "Firma de abogados especializada en derecho civil, laboral y comercial.", address: "Carrera 7 #12-55, Piso 3, Cartago", phone: "3005678903", whatsapp: "573005678903", instagram: "@garciaabogados", facebook: null, website: null, googleMapsUrl: null, catName: "Servicios", image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600" },
    { name: "Centro de Idiomas Lingua", description: "Cursos de inglés, francés y portugués para todas las edades.", address: "Avenida 3 #8-40, Cartago", phone: "3106789014", whatsapp: null, instagram: "@idiomaslingua", facebook: null, website: "https://idiomaslingua.edu.co", googleMapsUrl: null, catName: "Educación", image: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=600" },
    { name: "Billar El Rincón del Valle", description: "El mejor billar de Cartago. Mesas profesionales, ambiente familiar y buena música.", address: "Calle 10 #6-30, Cartago, Valle del Cauca", phone: "3207890125", whatsapp: null, instagram: "@billlarrincon", facebook: null, website: null, googleMapsUrl: null, catName: "Entretenimiento", image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600" },
    { name: "Salón Glamour", description: "Cortes, tintes, manicure y pedicure. Tu belleza es nuestra pasión.", address: "Carrera 4 #11-20, Cartago", phone: "3108901236", whatsapp: "573108901236", instagram: "@salonglamourcartago", facebook: null, website: null, googleMapsUrl: null, catName: "Belleza", image: "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=600" },
    { name: "Mudanzas Rápido Valle", description: "Servicio de mudanzas local y nacional. Embalaje profesional y transporte seguro.", address: "Carrera 2 #20-15, Cartago", phone: "3009012347", whatsapp: "573009012347", instagram: null, facebook: null, website: null, googleMapsUrl: null, catName: "Transporte", image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600" },
    { name: "Hotel Boutique El Marqués", description: "Hotel boutique en el corazón de Cartago. Habitaciones elegantes, desayuno incluido y piscina.", address: "Calle 15 #5-10, Centro Histórico, Cartago", phone: "3151234560", whatsapp: "573151234560", instagram: "@hotelelmarques", facebook: null, website: "https://hotelelmarques.com.co", googleMapsUrl: "https://maps.google.com/?q=Hotel+Boutique+Cartago", catName: "Hoteles", image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600" },
    { name: "Farmacia Salud Total", description: "Medicamentos, cosméticos, vitaminas y asesoría farmacéutica personalizada.", address: "Carrera 6 #9-50, Cartago", phone: "3102234561", whatsapp: "573102234561", instagram: "@farmaciasaludtotal", facebook: null, website: null, googleMapsUrl: null, catName: "Salud", image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600" },
    { name: "Ferretería Los Andes", description: "Materiales de construcción, herramientas y equipos para el hogar.", address: "Avenida 5 #7-30, Cartago, Valle del Cauca", phone: "3203334562", whatsapp: null, instagram: "@ferreteria_losandes", facebook: null, website: null, googleMapsUrl: null, catName: "Tiendas", image: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=600" },
    { name: "Lavandería Express", description: "Lavado y planchado de ropa en 24 horas. Servicio a domicilio disponible.", address: "Calle 8 #4-15, Cartago", phone: "3004444563", whatsapp: "573004444563", instagram: "@lavanderiaexpress_cgo", facebook: null, website: null, googleMapsUrl: null, catName: "Servicios", image: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=600" },
    { name: "Academia de Música El Pentagrama", description: "Clases de guitarra, piano, batería y canto para niños y adultos.", address: "Carrera 8 #13-40, Cartago", phone: "3155554564", whatsapp: null, instagram: "@academiaelpentagrama", facebook: null, website: "https://pentagramacartago.com", googleMapsUrl: null, catName: "Educación", image: "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=600" },
    { name: "Escape Room Cartago Adventures", description: "3 salas temáticas de escape room. Perfectas para grupos, cumpleaños y empresas.", address: "Centro Comercial Unico, Piso 2, Cartago", phone: "3206664565", whatsapp: "573206664565", instagram: "@escaperoom_cartago", facebook: null, website: "https://cartagoadventures.com", googleMapsUrl: null, catName: "Entretenimiento", image: "https://images.unsplash.com/photo-1516302752625-fcc3c50ae61f?w=600" },
    { name: "Soluciones IT del Valle", description: "Reparación de computadores, redes empresariales y soporte técnico.", address: "Calle 16 #3-80, Cartago", phone: "3007774566", whatsapp: "573007774566", instagram: "@solucionesit_valle", facebook: null, website: null, googleMapsUrl: null, catName: "Tecnología", image: "https://images.unsplash.com/photo-1573164713988-8665fc963095?w=600" },
    { name: "Spa & Masajes Zen", description: "Masajes relajantes, tratamientos faciales y terapias alternativas.", address: "Carrera 9 #14-20, Cartago", phone: "3108884567", whatsapp: "573108884567", instagram: "@spawellnesszen", facebook: null, website: null, googleMapsUrl: null, catName: "Belleza", image: "https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=600" },
    { name: "ServitaxiCartago", description: "Servicio de taxi las 24 horas. Viajes dentro y fuera de la ciudad.", address: "Cartago, Valle del Cauca", phone: "3009994568", whatsapp: "573009994568", instagram: "@servitaxicartago", facebook: null, website: null, googleMapsUrl: null, catName: "Transporte", image: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=600" },
    { name: "Hostal Vida Verde", description: "Hostal ecológico con jardín, desayuno orgánico y ambiente tranquilo.", address: "Carrera 3 #18-50, Cartago", phone: "3152224569", whatsapp: "573152224569", instagram: "@hostalvidaverde", facebook: null, website: null, googleMapsUrl: null, catName: "Hoteles", image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600" },
    { name: "Pizza Don Marco", description: "Pizza artesanal al horno de leña, pastas frescas y antipastos. Delivery disponible.", address: "Avenida 2 Norte #12-60, Cartago", phone: "3203114570", whatsapp: "573203114570", instagram: "@pizzadonmarco", facebook: null, website: "https://pizzadonmarco.com", googleMapsUrl: "https://maps.google.com/?q=Pizza+Don+Marco+Cartago", catName: "Restaurantes", image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600" },
  ];

  let inserted = 0;
  for (const biz of businessData) {
    if (existingNames.has(biz.name)) {
      console.log("[seed] Negocio ya existe, omitiendo:", biz.name);
      continue;
    }

    const catId = catIds[biz.catName];
    if (!catId) {
      console.error("[seed] ERROR: No se encontró categoría:", biz.catName, "catIds:", JSON.stringify(catIds));
      continue;
    }

    try {
      const [b] = await db
        .insert(businessesTable)
        .values({
          name: biz.name,
          description: biz.description,
          address: biz.address,
          phone: biz.phone ?? null,
          whatsapp: biz.whatsapp ?? null,
          instagram: biz.instagram ?? null,
          facebook: biz.facebook ?? null,
          website: biz.website ?? null,
          googleMapsUrl: biz.googleMapsUrl ?? null,
          schedule: biz.schedule ?? null,
          categoryId: catId,
          ownerId,
          status: "approved",
        })
        .returning();

      await db.insert(businessImagesTable).values({
        businessId: b.id,
        url: BUSINESS_IMAGES[biz.name] || biz.image,
        isPrimary: 1,
      });

      inserted++;
      console.log(`[seed] Negocio ${inserted} creado: ${biz.name}`);
    } catch (err) {
      console.error("[seed] ERROR insertando negocio:", biz.name, String(err));
    }
  }

  console.log(`[seed] Completado: ${inserted} negocios nuevos creados.`);
  return { skipped: false, inserted };
}
