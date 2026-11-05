import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

/**
 * Evita una zona central vacía cuando el fallback SPA de Netlify
 * entrega index.html para un recurso inexistente.
 */
export default function NotFound() {
  const { i18n } = useTranslation();
  const { pathname } = useLocation();
  const english = i18n.language?.startsWith("en");
  const missingDemoFile = pathname.startsWith("/demo/") || pathname.startsWith("/uploads/");

  const title = missingDemoFile
    ? (english ? "The requested file is not available" : "El archivo solicitado no está disponible")
    : (english ? "This page does not exist" : "No encontramos esta página");
  const description = missingDemoFile
    ? (english
      ? "The public catalog or deployment status file has not been published at this address. Check the latest Netlify production deployment."
      : "El archivo del catálogo o del estado del despliegue todavía no está publicado en esta dirección. Comprueba el último despliegue de producción en Netlify.")
    : (english
      ? "The address may have changed, or it does not correspond to a CineRD page."
      : "La dirección pudo haber cambiado o no corresponde a una página de CineRD.");

  return (
    <section
      className="mx-auto my-4 p-4 p-md-5 rounded-4 shadow-sm text-center"
      style={{ maxWidth: "760px", background: "#10243d", color: "#fff", border: "1px solid #28415e" }}
      aria-labelledby="cinerd-not-found-title"
    >
      <span className="d-block mb-2" style={{ color: "#d6ad52", fontWeight: 800, letterSpacing: ".1em" }}>
        {missingDemoFile ? "CINERD · DEMO" : "CINERD · 404"}
      </span>
      <h1 id="cinerd-not-found-title" className="h2 fw-bold">{title}</h1>
      <p className="mt-3 mb-4" style={{ color: "#d4dfeb" }}>{description}</p>
      <Link to="/" className="btn btn-primary">
        {english ? "Back to home" : "Volver al inicio"}
      </Link>
    </section>
  );
}
