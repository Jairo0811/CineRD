/**
 * Resolve the image-rights build mode once for both the exported catalog and
 * deployment manifest. Cloudflare Pages supplies CF_PAGES and CF_PAGES_BRANCH
 * automatically on Git-integrated builds.
 *
 * Public main is fail-closed: unlicensed media must not be published even if
 * a production environment variable was omitted or set to "normal".
 * Non-production builds retain historical opt-in behavior.
 */
export function resolveMediaRightsBuildMode(env = process.env) {
  const requested = String(env.VITE_MEDIA_RIGHTS_MODE || "").trim();
  const isCloudflareProduction = String(env.CF_PAGES || "") === "1"
    && String(env.CF_PAGES_BRANCH || "") === "main";

  if (isCloudflareProduction) {
    if (requested && requested !== "review") {
      console.warn(
        "⚠ CineRD Cloudflare main: se ignora VITE_MEDIA_RIGHTS_MODE=" +
        requested + "; producción obliga review para proteger medios sin permiso."
      );
    }
    return "review";
  }

  if (!["", "pilot", "review"].includes(requested)) {
    throw new Error(
      "VITE_MEDIA_RIGHTS_MODE inválido: vacío, pilot o review."
    );
  }
  return requested;
}
