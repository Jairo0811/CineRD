import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

// Debe cargarse después de Bootstrap para aplicar los estilos de CineRD.
import "./index.css";
import "./styles/portal.css";
import "./styles/cinematic-public.css";
import "./styles/catalog.css";
import "./styles/admin-dashboard.css";
import "./styles/talent-dashboard.css";

import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);