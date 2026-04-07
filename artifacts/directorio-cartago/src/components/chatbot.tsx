import React from "react";
import { Link } from "wouter";
import {
  Bot,
  ExternalLink,
  Loader2,
  MapPin,
  MessageCircle,
  Search,
  Send,
  Sparkles,
  Store,
  X,
} from "lucide-react";
import {
  fallbackBusinesses,
  getFallbackBusinesses,
} from "@/lib/fallback-directory";
import { getBusinessImageSrc } from "@/lib/business-media";
import { useDemoBusinesses } from "@/lib/demo-businesses";
import type { Business } from "@workspace/api-client-react";

type ChatMessage =
  | { id: string; role: "user" | "assistant"; text: string }
  | { id: string; role: "results"; results: Business[] };

const QUICK_SEARCHES = [
  "restaurantes",
  "hoteles",
  "salud",
  "tecnologia",
];

function normalizeTerm(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

function createAssistantReply(query: string, results: Business[]) {
  if (!results.length) {
    return `No encontre resultados para "${query}". Prueba con una categoria como restaurantes, hoteles, salud o tecnologia.`;
  }

  if (results.length === 1) {
    return `Encontre 1 opcion para "${query}". Aqui tienes la ficha mas cercana a tu busqueda.`;
  }

  return `Encontre ${results.length} opciones para "${query}". Te muestro las mas relevantes para que compares rapido.`;
}

async function searchBusinesses(query: string) {
  const trimmed = query.trim();
  if (!trimmed) {
    return [];
  }

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: trimmed }),
    });

    if (response.ok) {
      const data = await response.json();
      const apiResults = Array.isArray(data.results) ? data.results : [];
      if (apiResults.length) {
        return apiResults.slice(0, 4) as Business[];
      }

      if (typeof data.reply === "string" && data.reply.trim()) {
        const localFallback = getFallbackBusinesses({ search: trimmed, limit: 4 });
        return localFallback.businesses;
      }
    }
  } catch {
    // Fall back to local directory below.
  }

  return getFallbackBusinesses({ search: trimmed, limit: 4 }).businesses;
}

function searchLocalBusinesses(query: string, businesses: Business[]) {
  const term = normalizeTerm(query);
  if (!term) return [];

  return businesses.filter((business) => {
    const haystack = normalizeTerm(
      [
        business.name,
        business.description,
        business.categoryName,
        business.address,
      ]
        .filter(Boolean)
        .join(" "),
    );
    return haystack.includes(term);
  });
}

export default function Chatbot() {
  const [open, setOpen] = React.useState(false);
  const [input, setInput] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [messages, setMessages] = React.useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      text: "Hola. Puedo ayudarte a encontrar negocios de Cartago por nombre, categoria o servicio.",
    },
  ]);
  const { businesses: demoBusinesses } = useDemoBusinesses();

  const submitQuery = React.useCallback(
    async (rawQuery: string) => {
      const query = rawQuery.trim();
      if (!query) return;

      setMessages((current) => [
        ...current,
        { id: `user-${Date.now()}`, role: "user", text: query },
      ]);
      setInput("");
      setIsLoading(true);

      const localResults = searchLocalBusinesses(query, demoBusinesses).slice(0, 4);
      const remoteResults = await searchBusinesses(query);
      const results = [...localResults, ...remoteResults].filter(
        (business, index, array) =>
          array.findIndex((candidate) => candidate.id === business.id) === index,
      ).slice(0, 4);
      const assistantText = createAssistantReply(query, results);

      setMessages((current) => {
        const next: ChatMessage[] = [
          ...current,
          { id: `assistant-${Date.now()}`, role: "assistant", text: assistantText },
        ];

        if (results.length) {
          next.push({ id: `results-${Date.now()}`, role: "results", results });
        }

        return next;
      });
      setIsLoading(false);
    },
    [demoBusinesses],
  );

  const popularBusinesses = React.useMemo(
    () => fallbackBusinesses.slice(0, 3),
    [],
  );

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3 sm:bottom-5 sm:right-5">
      {open && (
        <>
          <button
            type="button"
            aria-label="Cerrar asistente"
            onClick={() => setOpen(false)}
            className="fixed inset-0 -z-10 bg-black/20 backdrop-blur-[1px]"
          />
          <div className="w-[min(22rem,calc(100vw-1rem))] overflow-hidden rounded-[1.75rem] border border-border/70 bg-background/95 shadow-2xl backdrop-blur-xl sm:w-[21rem]">
          <div className="border-b border-border/60 bg-gradient-to-r from-primary to-accent px-4 py-3 text-white">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/15">
                  <Bot className="h-4.5 w-4.5" />
                </div>
                <div>
                  <p className="font-semibold leading-none">Asistente Cartago</p>
                  <p className="mt-1 text-xs text-white/80">
                    Busca negocios y servicios al instante
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25"
                aria-label="Cerrar asistente"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="max-h-[min(60vh,24rem)] overflow-y-auto px-3 py-3 sm:max-h-[23rem] sm:px-4 sm:py-4">
            <div className="mb-3 rounded-2xl border border-primary/15 bg-primary/5 p-3">
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
                <Sparkles className="h-4 w-4 text-primary" />
                Busquedas rapidas
              </div>
              <div className="flex flex-wrap gap-2">
                {QUICK_SEARCHES.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => submitQuery(item)}
                    className="rounded-full bg-white px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-sm transition hover:text-primary"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {messages.map((message) => {
                if (message.role === "results") {
                  return (
                    <div key={message.id} className="space-y-3">
                      {message.results.map((business) => (
                        <div
                          key={business.id}
                          className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm"
                        >
                          <img
                            src={getBusinessImageSrc(business)}
                            alt={business.name}
                            className="h-24 w-full object-cover"
                          />
                          <div className="space-y-2 p-3">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="font-semibold text-foreground">
                                  {business.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {business.categoryName}
                                </p>
                              </div>
                              <Link
                                href={`/businesses/${business.id}`}
                                className="inline-flex items-center gap-1 text-xs font-semibold text-primary"
                              >
                                Ver
                                <ExternalLink className="h-3.5 w-3.5" />
                              </Link>
                            </div>
                            <div className="flex items-start gap-2 text-xs text-muted-foreground">
                              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                              <span>{business.address}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                }

                const isUser = message.role === "user";
                return (
                  <div
                    key={message.id}
                    className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                        isUser
                          ? "bg-primary text-white"
                          : "bg-muted text-foreground"
                      }`}
                    >
                      {message.text}
                    </div>
                  </div>
                );
              })}

              {isLoading && (
                <div className="flex items-center gap-2 rounded-2xl bg-muted px-4 py-3 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Buscando opciones en el directorio...
                </div>
              )}
            </div>

            <div className="mt-4 rounded-2xl border border-border/60 bg-card p-3">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                <Store className="h-4 w-4 text-primary" />
                Recomendados del dia
              </div>
              <div className="space-y-2">
                {popularBusinesses.map((business) => (
                  <button
                    key={business.id}
                    type="button"
                    onClick={() => submitQuery(business.name)}
                    className="flex w-full items-center justify-between rounded-xl bg-muted/60 px-3 py-2 text-left transition hover:bg-muted"
                  >
                    <span className="text-sm font-medium text-foreground">
                      {business.name}
                    </span>
                    <Search className="h-4 w-4 text-primary" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-border/60 bg-card/80 p-4">
            <div className="flex items-center gap-2 rounded-2xl border border-border bg-background px-3 py-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    void submitQuery(input);
                  }
                }}
                placeholder="Ej. pizzeria, hotel, gimnasio..."
                className="h-8 flex-1 bg-transparent text-sm outline-none"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => void submitQuery(input)}
                disabled={isLoading || !normalizeTerm(input)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
                aria-label="Enviar consulta"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
        </>
      )}

      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="inline-flex items-center gap-3 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-white shadow-xl shadow-primary/30 transition hover:-translate-y-0.5 hover:bg-primary/90"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15">
          <MessageCircle className="h-5 w-5" />
        </div>
        <div className="hidden text-left sm:block">
          <div>Buscar negocios</div>
          <div className="text-xs text-white/75">Asistente rapido</div>
        </div>
      </button>
    </div>
  );
}
