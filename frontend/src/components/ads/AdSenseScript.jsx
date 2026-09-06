import { useEffect } from "react";

const ADSENSE_CLIENT = import.meta.env.VITE_ADSENSE_CLIENT?.trim();

export const adsenseEnabled = Boolean(ADSENSE_CLIENT && /^ca-pub-\d+$/.test(ADSENSE_CLIENT));

function AdSenseScript() {
  useEffect(() => {
    if (!adsenseEnabled) return undefined;
    if (document.querySelector('script[data-cinerd-adsense="true"]')) return undefined;

    const script = document.createElement("script");
    script.async = true;
    script.crossOrigin = "anonymous";
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(ADSENSE_CLIENT)}`;
    script.dataset.cinerdAdsense = "true";
    document.head.appendChild(script);

    return undefined;
  }, []);

  return null;
}

export { ADSENSE_CLIENT };
export default AdSenseScript;
