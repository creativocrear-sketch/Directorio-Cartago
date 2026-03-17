import { Router } from "express";
import {
  db,
  businessesTable,
  categoriesTable,
  businessImagesTable,
} from "@workspace/db";
import { eq, inArray } from "drizzle-orm";

const router = Router();

function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

router.post("/", async (req, res) => {
  const mensaje = normalizar(req.body.message || "").trim();

  try {
    const empresas = await db
      .select({
        id: businessesTable.id,
        name: businessesTable.name,
        description: businessesTable.description,
        address: businessesTable.address,
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
      res.json({ reply: "No hay negocios disponibles 😢", results: [] });
      return;
    }

    if (!mensaje) {
      res.json({
        reply:
          "¿En qué te puedo ayudar? Escribe el nombre de un negocio o categoría 🔍",
        results: [],
      });
      return;
    }

    const busqueda = mensaje.replace(/es$/, "").replace(/s$/, "");

    const resultados = empresas.filter(
      (e) =>
        normalizar(e.name || "").includes(mensaje) ||
        normalizar(e.name || "").includes(busqueda) ||
        normalizar(e.description || "").includes(mensaje) ||
        normalizar(e.description || "").includes(busqueda) ||
        normalizar(e.address || "").includes(mensaje) ||
        normalizar(e.categoryName || "").includes(mensaje) ||
        normalizar(e.categoryName || "").includes(busqueda),
    );

    if (resultados.length === 0) {
      res.json({
        reply: `No encontré resultados para "${req.body.message}" 😢`,
        results: [],
      });
      return;
    }

    // ✅ Obtener imágenes sin filtrar isPrimary
    const ids = resultados.slice(0, 3).map((e) => e.id);
    const imagenes = await db
      .select()
      .from(businessImagesTable)
      .where(inArray(businessImagesTable.businessId, ids));

    const imageMap: Record<number, string> = {};
    imagenes.forEach((img) => {
      if (!imageMap[img.businessId]) {
        imageMap[img.businessId] = img.url;
      }
    });

    const results = resultados.slice(0, 3).map((e) => ({
      name: e.name,
      category: e.categoryName || "Sin categoría",
      address: e.address,
      instagram: e.instagram,
      schedule: e.schedule,
      image: imageMap[e.id] || null,
    }));

    res.json({
      reply: `🔎 Encontré ${resultados.length} resultado(s):`,
      results,
    });
  } catch (error: any) {
    console.error("Chat error:", error.message);
    res.status(500).json({ reply: "Error: " + error.message, results: [] });
  }
});

router.get("/", (_req, res) => {
  res.json({ reply: "Chat funcionando ✅" });
});

export default router;
