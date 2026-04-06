import { Business } from "@workspace/api-client-react";

const PLACEHOLDER_BY_CATEGORY: Record<string, string> = {
  restaurantes: "food.svg",
  tiendas: "retail.svg",
  servicios: "services.svg",
  salud: "wellness.svg",
  educacion: "learning.svg",
  entretenimiento: "leisure.svg",
  tecnologia: "tech.svg",
  belleza: "wellness.svg",
  transporte: "transport.svg",
  hoteles: "stay.svg",
};

function getBaseUrl() {
  return import.meta.env.BASE_URL;
}

function normalizeCategory(categoryName?: string | null) {
  return (categoryName ?? "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

function ensureProtocol(value: string) {
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}

export function getBusinessFallbackImage(categoryName?: string | null) {
  const categoryKey = normalizeCategory(categoryName);
  const filename = PLACEHOLDER_BY_CATEGORY[categoryKey] ?? "generic.svg";
  return `${getBaseUrl()}images/placeholders/${filename}`;
}

export function getBusinessImageSrc(
  business: Pick<Business, "images" | "categoryName">,
) {
  return (
    business.images?.find((img) => img.isPrimary)?.url ??
    business.images?.[0]?.url ??
    getBusinessFallbackImage(business.categoryName)
  );
}

export function normalizeInstagramUrl(value?: string | null) {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;

  const handle = trimmed.replace(/^@/, "").replace(/^instagram\.com\//i, "");
  return `https://instagram.com/${handle}`;
}

export function getInstagramHandle(value?: string | null) {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  const lastSegment = trimmed.split("/").filter(Boolean).pop() ?? trimmed;
  return lastSegment.replace(/^@/, "");
}

export function normalizeFacebookUrl(value?: string | null) {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;

  return `https://facebook.com/${trimmed.replace(/\s+/g, "")}`;
}

export function normalizeWebsiteUrl(value?: string | null) {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return ensureProtocol(trimmed);
}
