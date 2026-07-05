import React from "react";
import ReactDOM from "react-dom/client";

import "bootstrap/dist/css/bootstrap.min.css";

import "./styles/global.css";
import "./styles/cards.css";
import "./styles/forms.css";
import "./styles/dashboard.css";
import "./styles/responsive.css";

import App from "./App.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);