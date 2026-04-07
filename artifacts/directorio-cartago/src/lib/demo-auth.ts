import type { User } from "@workspace/api-client-react";
import { DEMO_ADMIN_USER, DEMO_PREMIUM_USER } from "@/components/auth-provider";

const DEMO_ACCOUNTS_KEY = "demo_accounts";

type StoredAccount = {
  user: User;
  password: string;
};

const DEFAULT_ACCOUNTS: StoredAccount[] = [
  {
    user: DEMO_ADMIN_USER,
    password: "admin123",
  },
  {
    user: DEMO_PREMIUM_USER,
    password: "premium123",
  },
];

function isBrowser() {
  return typeof window !== "undefined";
}

function persist(accounts: StoredAccount[]) {
  if (!isBrowser()) return;
  window.localStorage.setItem(DEMO_ACCOUNTS_KEY, JSON.stringify(accounts));
}

export function getStoredDemoAccounts() {
  if (!isBrowser()) return DEFAULT_ACCOUNTS;

  const raw = window.localStorage.getItem(DEMO_ACCOUNTS_KEY);
  if (!raw) {
    persist(DEFAULT_ACCOUNTS);
    return DEFAULT_ACCOUNTS;
  }

  try {
    const parsed = JSON.parse(raw) as StoredAccount[];
    if (!Array.isArray(parsed) || !parsed.length) {
      persist(DEFAULT_ACCOUNTS);
      return DEFAULT_ACCOUNTS;
    }
    return parsed;
  } catch {
    persist(DEFAULT_ACCOUNTS);
    return DEFAULT_ACCOUNTS;
  }
}

export function findDemoAccountByEmail(email: string) {
  const normalized = email.trim().toLowerCase();
  return getStoredDemoAccounts().find(
    (account) => account.user.email.toLowerCase() === normalized,
  );
}

export function createLocalDemoAccount(input: {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: "visitor" | "business_owner";
}) {
  const accounts = getStoredDemoAccounts();
  const normalizedEmail = input.email.trim().toLowerCase();
  const exists = accounts.some(
    (account) => account.user.email.toLowerCase() === normalizedEmail,
  );

  if (exists) {
    return { ok: false as const, reason: "exists" };
  }

  const nextAccount: StoredAccount = {
    user: {
      id: Date.now(),
      name: input.name.trim(),
      email: normalizedEmail,
      role: input.role,
      phone: input.phone?.trim() || null,
      createdAt: new Date().toISOString(),
      hasActiveSubscription: false,
    },
    password: input.password,
  };

  persist([...accounts, nextAccount]);
  return { ok: true as const, account: nextAccount };
}

export function updateLocalDemoUser(nextUser: User) {
  const accounts = getStoredDemoAccounts();
  const nextAccounts = accounts.map((account) =>
    account.user.email.toLowerCase() === nextUser.email.toLowerCase()
      ? { ...account, user: nextUser }
      : account,
  );
  persist(nextAccounts);
}

export function validateDemoCredentials(email: string, password: string) {
  const account = findDemoAccountByEmail(email);
  if (!account) return null;
  return account.password === password ? account.user : null;
}

export function getPasswordRecoveryHint(email: string) {
  const account = findDemoAccountByEmail(email);
  if (!account) return null;

  if (account.user.email === DEMO_ADMIN_USER.email) {
    return "Usa la clave demo admin123 para entrar como administrador.";
  }

  if (account.user.email === DEMO_PREMIUM_USER.email) {
    return "Usa la clave demo premium123 para entrar como usuario Premium.";
  }

  return "En modo local no enviamos correos todavia, pero tu cuenta demo si existe en este navegador.";
}
