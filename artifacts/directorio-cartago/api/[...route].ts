import app from "../../api-server/src/app.js";
import { seedIfEmpty } from "../../api-server/src/seed.js";

let seedPromise: Promise<unknown> | null = null;

async function ensureSeeded() {
  if (!seedPromise) {
    seedPromise = seedIfEmpty().catch((error: unknown) => {
      console.error("[vercel-api] Seed failed:", error);
    });
  }

  await seedPromise;
}

export const config = {
  runtime: "nodejs",
};

export default async function handler(req: any, res: any) {
  await ensureSeeded();
  return (app as unknown as (req: any, res: any) => unknown)(req, res);
}
