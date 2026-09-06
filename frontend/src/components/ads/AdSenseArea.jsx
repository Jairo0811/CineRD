import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import AdSenseScript, { ADSENSE_CLIENT, adsenseEnabled } from "./AdSenseScript";

const ADSENSE_SLOT = import.meta.env.VITE_ADSENSE_SLOT?.trim();

const PUBLIC_AD_ROUTES = [
  /^\/$/,
  /^\/buscar(?:\/|$)/,
  /^\/actores\/?$/,
  /^\/actores\/\d+\/?$/,
  /^\/peliculas\/?$/,
  /^\/peliculas\/\d+\/?$/,
];

export const isAdEligiblePath = (pathname) =>
  PUBLIC_AD_ROUTES.some((pattern) => pattern.test(pathname));

function AdSenseSlot() {
  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // AdSense can be blocked by browser extensions; CineRD must keep working.
    }
  }, []);

  return (
    <aside className="cinerd-ad" aria-label="Publicidad">
      <span className="cinerd-ad-label">Publicidad</span>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={ADSENSE_SLOT}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </aside>
  );
}

function AdSenseArea() {
  const { pathname } = useLocation();
  const enabled = adsenseEnabled && /^\d+$/.test(ADSENSE_SLOT || "") && isAdEligiblePath(pathname);

  if (!enabled) return null;

  return (
    <>
      <AdSenseScript />
      <AdSenseSlot />
    </>
  );
}

export default AdSenseArea;
