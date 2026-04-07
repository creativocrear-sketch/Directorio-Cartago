import { useEffect, useMemo, useState } from "react";
import type { Business, User } from "@workspace/api-client-react";
import { fallbackBusinesses, fallbackCategories } from "@/lib/fallback-directory";

const DEMO_BUSINESSES_KEY = "demo_businesses";
const DEMO_EVENT = "demo-businesses-updated";
const DEMO_OWNER_ID = 900002;
const NOW = "2026-04-07T12:00:00.000Z";

type DemoBusinessInput = {
  name: string;
  description?: string;
  address: string;
  phone?: string;
  whatsapp?: string;
  instagram?: string;
  facebook?: string;
  website?: string;
  googleMapsUrl?: string;
  schedule?: string;
  categoryId: number;
  images: string[];
};

function makeImage(url: string, index: number) {
  return {
    id: Number(`${Date.now()}${index + 1}`),
    url,
    isPrimary: index === 0,
  };
}

function getSeedBusinesses() {
  return fallbackBusinesses.slice(0, 2).map((business, index) => ({
    ...business,
    id: 9100 + index,
    ownerId: DEMO_OWNER_ID,
    ownerName: "Usuario Premium Demo",
    status: index === 0 ? ("approved" as const) : ("pending" as const),
    createdAt: NOW,
  }));
}

function isBrowser() {
  return typeof window !== "undefined";
}

function emitChange() {
  if (!isBrowser()) return;
  window.dispatchEvent(new Event(DEMO_EVENT));
}

function readStoredBusinesses() {
  if (!isBrowser()) return getSeedBusinesses();

  const raw = window.localStorage.getItem(DEMO_BUSINESSES_KEY);
  if (!raw) {
    const seed = getSeedBusinesses();
    window.localStorage.setItem(DEMO_BUSINESSES_KEY, JSON.stringify(seed));
    return seed;
  }

  try {
    const parsed = JSON.parse(raw) as Business[];
    return parsed.length ? parsed : getSeedBusinesses();
  } catch {
    const seed = getSeedBusinesses();
    window.localStorage.setItem(DEMO_BUSINESSES_KEY, JSON.stringify(seed));
    return seed;
  }
}

function persistBusinesses(businesses: Business[]) {
  if (!isBrowser()) return;
  window.localStorage.setItem(DEMO_BUSINESSES_KEY, JSON.stringify(businesses));
  emitChange();
}

function buildBusiness(input: DemoBusinessInput, owner: User, id?: number, previous?: Business): Business {
  const category = fallbackCategories.find((item) => item.id === input.categoryId);
  const images = input.images.filter(Boolean);

  return {
    id: id ?? Date.now(),
    name: input.name,
    description: input.description?.trim() || null,
    address: input.address,
    phone: input.phone?.trim() || null,
    whatsapp: input.whatsapp?.trim() || null,
    instagram: input.instagram?.trim() || null,
    facebook: input.facebook?.trim() || null,
    website: input.website?.trim() || null,
    googleMapsUrl: input.googleMapsUrl?.trim() || null,
    googleMapsEmbed: previous?.googleMapsEmbed || null,
    schedule: input.schedule?.trim() || null,
    categoryId: input.categoryId,
    categoryName: category?.name || "Categoria",
    ownerId: owner.id,
    ownerName: owner.name,
    status: previous?.status || "pending",
    images: images.length ? images.map(makeImage) : [],
    averageRating: previous?.averageRating ?? 0,
    reviewCount: previous?.reviewCount ?? 0,
    createdAt: previous?.createdAt || NOW,
  };
}

export function getDemoBusinesses() {
  return readStoredBusinesses();
}

export function getAllDirectoryBusinesses() {
  return [...readStoredBusinesses(), ...fallbackBusinesses];
}

export function getDirectoryBusinessById(id: number) {
  return getAllDirectoryBusinesses().find((business) => business.id === id) ?? null;
}

export function createDemoBusiness(input: DemoBusinessInput, owner: User) {
  const nextBusiness = buildBusiness(input, owner);
  const businesses = [nextBusiness, ...readStoredBusinesses()];
  persistBusinesses(businesses);
  return nextBusiness;
}

export function updateDemoBusiness(id: number, input: DemoBusinessInput, owner: User) {
  const businesses = readStoredBusinesses();
  const current = businesses.find((business) => business.id === id);
  if (!current) return null;

  const nextBusinesses = businesses.map((business) =>
    business.id === id ? buildBusiness(input, owner, id, current) : business,
  );
  persistBusinesses(nextBusinesses);
  return nextBusinesses.find((business) => business.id === id) ?? null;
}

export function deleteDemoBusiness(id: number) {
  const nextBusinesses = readStoredBusinesses().filter((business) => business.id !== id);
  persistBusinesses(nextBusinesses);
}

export function updateDemoBusinessStatus(id: number, status: Business["status"]) {
  const nextBusinesses = readStoredBusinesses().map((business) =>
    business.id === id ? { ...business, status } : business,
  );
  persistBusinesses(nextBusinesses);
}

export function useDemoBusinesses() {
  const [businesses, setBusinesses] = useState<Business[]>(() => readStoredBusinesses());

  useEffect(() => {
    const sync = () => setBusinesses(readStoredBusinesses());

    sync();
    if (!isBrowser()) return;

    window.addEventListener(DEMO_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(DEMO_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return useMemo(
    () => ({
      businesses,
      createBusiness: createDemoBusiness,
      updateBusiness: updateDemoBusiness,
      deleteBusiness: deleteDemoBusiness,
      updateBusinessStatus: updateDemoBusinessStatus,
    }),
    [businesses],
  );
}
