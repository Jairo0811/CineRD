/**
 * Restricciones de Multer (backend/src/middlewares/upload.js) reflejadas
 * en los formularios para evitar envíos que el servidor rechazará.
 * Esta validación mejora UX; el backend continúa siendo autoridad.
 */
export const MAX_IMAGEN_BYTES = 8 * 1024 * 1024;
export const TIPOS_IMAGEN = Object.freeze(["image/jpeg", "image/png", "image/webp"]);

export function validarArchivoImagen(file) {
  if (!file) return "Selecciona una imagen";
  if (!TIPOS_IMAGEN.includes(file.type)) return "Solo se permiten imágenes JPG, PNG o WEBP";
  if (!Number.isFinite(file.size) || file.size <= 0) return "La imagen está vacía";
  if (file.size > MAX_IMAGEN_BYTES) return "La imagen supera el límite de 8 MB";
  return null;
}
