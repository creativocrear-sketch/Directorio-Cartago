import { useState } from "react";

interface Negocio {
  name: string;
  category: string;
  address: string;
  instagram?: string;
  schedule?: string;
  image?: string;
}

interface Mensaje {
  tipo: "usuario" | "bot" | "resultados";
  texto?: string;
  resultados?: Negocio[];
}

export default function Chatbot() {
  const [messages, setMessages] = useState<Mensaje[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const enviar = async () => {
    if (!input.trim()) return;
    const mensajeUsuario = input.trim();
    setMessages((prev) => [
      ...prev,
      { tipo: "usuario", texto: mensajeUsuario },
    ]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: mensajeUsuario }),
      });

      if (!res.ok) {
        setMessages((prev) => [
          ...prev,
          { tipo: "bot", texto: `Error HTTP ${res.status}` },
        ]);
        return;
      }

      const data = await res.json();
      setMessages((prev) => [...prev, { tipo: "bot", texto: data.reply }]);

      if (data.results?.length > 0) {
        setMessages((prev) => [
          ...prev,
          { tipo: "resultados", resultados: data.results },
        ]);
      }
    } catch (error: any) {
      setMessages((prev) => [
        ...prev,
        { tipo: "bot", texto: "Error: " + error.message },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{ position: "fixed", bottom: "20px", right: "20px", zIndex: 9999 }}
    >
      {open && (
        <div
          style={{
            width: "320px",
            background: "white",
            border: "1px solid #ddd",
            borderRadius: "12px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
            marginBottom: "10px",
            display: "flex",
            flexDirection: "column",
            maxHeight: "500px",
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "12px",
              borderBottom: "1px solid #eee",
              background: "#1a73e8",
              borderRadius: "12px 12px 0 0",
            }}
          >
            <span
              style={{ fontWeight: "bold", fontSize: "14px", color: "white" }}
            >
              🔍 Buscar negocios
            </span>
            <button
              onClick={() => setOpen(false)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "18px",
                color: "white",
              }}
            >
              ✕
            </button>
          </div>

          {/* Mensajes */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "10px",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              minHeight: "200px",
              maxHeight: "320px",
            }}
          >
            {messages.length === 0 && (
              <div style={{ color: "#aaa", fontSize: "13px" }}>
                Escribe el nombre de un negocio o categoría...
              </div>
            )}
            {messages.map((m, i) => {
              if (m.tipo === "usuario") {
                return (
                  <div
                    key={i}
                    style={{
                      alignSelf: "flex-end",
                      background: "#1a73e8",
                      color: "white",
                      borderRadius: "12px 12px 0 12px",
                      padding: "8px 12px",
                      fontSize: "13px",
                      maxWidth: "80%",
                    }}
                  >
                    {m.texto}
                  </div>
                );
              }
              if (m.tipo === "bot") {
                return (
                  <div
                    key={i}
                    style={{
                      alignSelf: "flex-start",
                      background: "#f5f5f5",
                      color: "#333",
                      borderRadius: "12px 12px 12px 0",
                      padding: "8px 12px",
                      fontSize: "13px",
                      maxWidth: "80%",
                      whiteSpace: "pre-line",
                    }}
                  >
                    {m.texto}
                  </div>
                );
              }
              if (m.tipo === "resultados" && m.resultados) {
                return (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                    }}
                  >
                    {m.resultados.map((e, j) => (
                      <div
                        key={j}
                        style={{
                          border: "1px solid #eee",
                          borderRadius: "8px",
                          overflow: "hidden",
                          fontSize: "12px",
                        }}
                      >
                        {e.image && (
                          <img
                            src={e.image}
                            alt={e.name}
                            style={{
                              width: "100%",
                              height: "100px",
                              objectFit: "cover",
                            }}
                          />
                        )}
                        <div style={{ padding: "8px" }}>
                          <div style={{ fontWeight: "bold", fontSize: "13px" }}>
                            🏪 {e.name}
                          </div>
                          <div style={{ color: "#666" }}>📂 {e.category}</div>
                          <div style={{ color: "#666" }}>📍 {e.address}</div>
                          {e.instagram && (
                            <div style={{ color: "#e1306c" }}>
                              📸 {e.instagram}
                            </div>
                          )}
                          {e.schedule && (
                            <div style={{ color: "#666" }}>🕐 {e.schedule}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              }
              return null;
            })}
            {loading && (
              <div style={{ color: "#aaa", fontSize: "13px" }}>
                Bot escribiendo...
              </div>
            )}
          </div>

          {/* Input */}
          <div
            style={{
              display: "flex",
              gap: "6px",
              padding: "10px",
              borderTop: "1px solid #eee",
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && enviar()}
              placeholder="Ej: restaurantes, hoteles..."
              disabled={loading}
              style={{
                flex: 1,
                padding: "8px",
                borderRadius: "8px",
                border: "1px solid #ccc",
                fontSize: "13px",
              }}
            />
            <button
              onClick={enviar}
              disabled={loading}
              style={{
                padding: "8px 12px",
                background: "#1a73e8",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: loading ? "not-allowed" : "pointer",
                fontSize: "13px",
              }}
            >
              {loading ? "..." : "➤"}
            </button>
          </div>
        </div>
      )}

      {/* Botón flotante */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: "56px",
          height: "56px",
          borderRadius: "50%",
          background: "#1a73e8",
          color: "white",
          border: "none",
          cursor: "pointer",
          fontSize: "24px",
          boxShadow: "0 4px 12px rgba(26,115,232,0.4)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginLeft: "auto",
        }}
      >
        {open ? "✕" : "💬"}
      </button>
    </div>
  );
}
