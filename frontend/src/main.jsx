import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

import "./i18n";

// Debe cargarse después de Bootstrap para aplicar los estilos de CineRD.
import "./index.css";
import "./styles/portal.css";
import "./styles/cinematic-public.css";
import "./styles/catalog.css";
import "./styles/admin-dashboard.css";
import "./styles/talent-dashboard.css";
import "./styles/user-dashboard.css";
import "./styles/workspace.css";
import "./styles/actor-profile.css";
import "./styles/verification-badges.css";

import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
