/**
 * Resolve the image-rights build mode once for both the exported catalog and
 * deployment manifest. Cloudflare Pages supplies CF_PAGES and CF_PAGES_BRANCH
 * automatically on Git-integrated builds.
 *
 * All Cloudflare Pages deployments (main and preview branches) are fail-closed:
 * no unlicensed media should be distributed even when a mode is omitted or wrong.
 * Other build environments require an explicit review setting for safe output.
 */
export function resolveMediaRightsBuildMode(env = process.env) {
  const requested = String(env.VITE_MEDIA_RIGHTS_MODE || "").trim();
  const isCloudflarePages = String(env.CF_PAGES || "") === "1";

  if (isCloudflarePages) {
    if (requested && requested !== "review") {
      console.warn(
        "⚠ CineRD Cloudflare Pages: se ignora VITE_MEDIA_RIGHTS_MODE=" +
        requested + "; todos los despliegues obligan review para proteger medios sin permiso."
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
