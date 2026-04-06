import app from "../../api-server/src/app";
import { seedIfEmpty } from "../../api-server/src/seed";

let seedPromise: Promise<unknown> | null = null;

async function ensureSeeded() {
  if (!seedPromise) {
    seedPromise = seedIfEmpty().catch((error) => {
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
  return app(req, res);
}
