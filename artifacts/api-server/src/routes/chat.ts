import { Router } from "express";
import { db, businessesTable, categoriesTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

router.post("/", async (req, res) => {
  const mensaje = (req.body.message || "").toLowerCase().trim();

  try {
    const empresas = await db
      .select({
        id: businessesTable.id,
        name: businessesTable.name,
        description: businessesTable.description,
        address: businessesTable.address,
        phone: businessesTable.phone,
        whatsapp: businessesTable.whatsapp,
        instagram: businessesTable.instagram,
        schedule: businessesTable.schedule,
        categoryName: categoriesTable.name,
      })
      .from(businessesTable)
      .leftJoin(
        categoriesTable,
        eq(businessesTable.categoryId, categoriesTable.id),
      )
      .where(eq(businessesTable.status, "approved"));

    if (!empresas.length) {
      res.json({ reply: "No hay negocios disponibles 😢" });
      return;
    }

    if (!mensaje) {
      res.json({
        reply:
          "¿En qué te puedo ayudar? Escribe el nombre de un negocio o categoría 🔍",
      });
      return;
    }

    const busqueda = mensaje.replace(/es$/, "").replace(/s$/, "");

    const resultados = empresas.filter(
      (e) =>
        (e.name || "").toLowerCase().includes(mensaje) ||
        (e.name || "").toLowerCase().includes(busqueda) ||
        (e.description || "").toLowerCase().includes(mensaje) ||
        (e.description || "").toLowerCase().includes(busqueda) ||
        (e.address || "").toLowerCase().includes(mensaje) ||
        (e.categoryName || "").toLowerCase().includes(mensaje) ||
        (e.categoryName || "").toLowerCase().includes(busqueda),
    );

    if (resultados.length === 0) {
      res.json({ reply: `No encontré resultados para "${mensaje}" 😢` });
      return;
    }

    let respuesta = `🔎 Encontré ${resultados.length} resultado(s):\n\n`;
    resultados.slice(0, 3).forEach((e) => {
      respuesta += `🏪 ${e.name}\n`;
      respuesta += `📂 ${e.categoryName || "Sin categoría"}\n`;
      respuesta += `📍 ${e.address}\n`;
      if (e.instagram) respuesta += `📸 ${e.instagram}\n`;
      if (e.schedule) respuesta += `🕐 ${e.schedule}\n`;
      respuesta += "\n";
    });

    res.json({ reply: respuesta });
  } catch (error: any) {
    console.error("Chat error:", error.message);
    res.status(500).json({ reply: "Error: " + error.message });
  }
});

router.get("/", (_req, res) => {
  res.json({ reply: "Chat funcionando ✅" });
});

export default router;
