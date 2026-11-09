/**
 * Resolve the image-rights build mode once for both the exported catalog and
 * deployment manifest. Cloudflare Pages supplies CF_PAGES and CF_PAGES_BRANCH
 * automatically on Git-integrated builds.
 *
 * Cloudflare Pages and Netlify deployments (production AND preview branches)
 * are fail-closed. Both build providers force 'review' even if VITE_MEDIA_RIGHTS_MODE
 * is unset or requests an unsafe value.
 * Local development retains opt-in behavior; other hosts must explicitly set
 * VITE_MEDIA_RIGHTS_MODE=review.
 */
export function resolveMediaRightsBuildMode(env = process.env) {
  const requested = String(env.VITE_MEDIA_RIGHTS_MODE || "").trim();
  const isCloudflarePages = String(env.CF_PAGES || "") === "1";
  // Netlify documenta NETLIFY=true en cada build, incluidos Deploy Previews.
  const isNetlify = String(env.NETLIFY || "").toLowerCase() === "true";

  if (isCloudflarePages || isNetlify) {
    if (requested && requested !== "review") {
      console.warn(
        "⚠ CineRD " + (isCloudflarePages ? "Cloudflare Pages" : "Netlify") +
        ": se ignora VITE_MEDIA_RIGHTS_MODE=" + requested +
        "; todos los despliegues obligan review para proteger medios sin permiso."
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
