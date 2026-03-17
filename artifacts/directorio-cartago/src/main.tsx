import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import Chatbot from "./components/chatbot";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <>
      <App />
      <Chatbot />
    </>
  </React.StrictMode>,
);
