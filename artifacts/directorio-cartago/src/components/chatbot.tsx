import { useState } from "react";

export default function Chatbot() {
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const enviar = async () => {
    if (!input.trim()) return;
    const mensajeUsuario = input.trim();
    setMessages((prev) => [...prev, "Tú: " + mensajeUsuario]);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: mensajeUsuario }),
      });
      if (!res.ok) {
        const errorText = await res.text();
        setMessages((prev) => [
          ...prev,
          `Bot: HTTP ${res.status} - ${errorText}`,
        ]);
        return;
      }
      const text = await res.text();
      if (!text) {
        setMessages((prev) => [...prev, "Bot: Respuesta vacía"]);
        return;
      }
      const data = JSON.parse(text);
      setMessages((prev) => [
        ...prev,
        "Bot: " + (data.reply || "Sin respuesta"),
      ]);
    } catch (error: any) {
      setMessages((prev) => [...prev, "Bot: FETCH ERROR - " + error.message]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{ position: "fixed", bottom: "20px", right: "20px", zIndex: 9999 }}
    >
      {/* Chat abierto */}
      {open && (
        <div
          style={{
            width: "300px",
            background: "white",
            border: "1px solid #ccc",
            borderRadius: "12px",
            padding: "10px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
            marginBottom: "10px",
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "8px",
              borderBottom: "1px solid #eee",
              paddingBottom: "8px",
            }}
          >
            <span style={{ fontWeight: "bold", fontSize: "14px" }}>
              🔍 Buscar negocios
            </span>
            <button
              onClick={() => setOpen(false)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "18px",
                color: "#999",
                lineHeight: 1,
              }}
            >
              ✕
            </button>
          </div>

          {/* Mensajes */}
          <div
            style={{
              height: "180px",
              overflowY: "auto",
              marginBottom: "8px",
              display: "flex",
              flexDirection: "column",
              gap: "4px",
            }}
          >
            {messages.length === 0 && (
              <div style={{ color: "#aaa", fontSize: "13px" }}>
                Escribe el nombre de un negocio o categoría...
              </div>
            )}
            {messages.map((m, i) => (
              <div
                key={i}
                style={{
                  textAlign: m.startsWith("Tú:") ? "right" : "left",
                  fontSize: "13px",
                  color: m.startsWith("Tú:") ? "#1a73e8" : "#333",
                  whiteSpace: "pre-line",
                  background: m.startsWith("Tú:") ? "#e8f0fe" : "#f5f5f5",
                  borderRadius: "8px",
                  padding: "6px 10px",
                  maxWidth: "85%",
                  alignSelf: m.startsWith("Tú:") ? "flex-end" : "flex-start",
                }}
              >
                {m.replace("Tú: ", "").replace("Bot: ", "")}
              </div>
            ))}
            {loading && (
              <div style={{ color: "#aaa", fontSize: "13px" }}>
                Bot escribiendo...
              </div>
            )}
          </div>

          {/* Input */}
          <div style={{ display: "flex", gap: "6px" }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && enviar()}
              placeholder="Ej: restaurantes, hoteles..."
              disabled={loading}
              style={{
                flex: 1,
                padding: "6px",
                borderRadius: "4px",
                border: "1px solid #ccc",
                fontSize: "13px",
              }}
            />
            <button
              onClick={enviar}
              disabled={loading}
              style={{
                padding: "6px 10px",
                background: "#1a73e8",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: loading ? "not-allowed" : "pointer",
                fontSize: "13px",
              }}
            >
              {loading ? "..." : "Enviar"}
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
