/**
 * Resolve the image-rights build mode once for both the exported catalog and
 * deployment manifest. Cloudflare Pages supplies CF_PAGES and CF_PAGES_BRANCH
 * automatically on Git-integrated builds.
 *
 * Every Cloudflare Pages deployment (main AND preview branches) is fail-closed:
 * unlicensed media cannot be distributed, even when an environment variable
 * is missing or mistakenly requests "pilot"/"normal".
 * Local development retains historical opt-in behavior. Any deployment on
 * another host must explicitly set VITE_MEDIA_RIGHTS_MODE=review.
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
