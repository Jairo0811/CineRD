import Swal from "sweetalert2";

// Todos los textos recibidos se pasan mediante "text", nunca "html": las
// respuestas de la API y los nombres de talentos no son HTML confiable.
const dialogo = Swal.mixin({
  buttonsStyling: false,
  scrollbarPadding: false,
  customClass: {
    popup: "cine-swal-popup",
    title: "cine-swal-title",
    confirmButton: "cine-swal-confirm",
    cancelButton: "cine-swal-cancel",
    input: "cine-swal-input",
  },
});

const textoSeguro = (valor) => String(valor ?? "");

export const mostrarError = (mensaje) => dialogo.fire({
  icon: "error",
  title: "No se pudo completar",
  text: textoSeguro(mensaje),
  confirmButtonText: "Entendido",
});

export const mostrarAdvertencia = (mensaje) => dialogo.fire({
  icon: "warning",
  title: "Revisa la información",
  text: textoSeguro(mensaje),
  confirmButtonText: "Entendido",
});

export const mostrarExito = (mensaje) => dialogo.fire({
  icon: "success",
  title: "Operación realizada",
  text: textoSeguro(mensaje),
  confirmButtonText: "Continuar",
});

export const confirmarAccion = async (
  mensaje,
  { titulo = "¿Confirmar acción?", confirmar = "Sí, continuar" } = {},
) => {
  const respuesta = await dialogo.fire({
    title: titulo,
    text: textoSeguro(mensaje),
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: confirmar,
    cancelButtonText: "Cancelar",
    reverseButtons: true,
    focusCancel: true,
  });
  // Cerrar el diálogo, Esc o cancelar NUNCA debe ejecutar acciones destructivas.
  return respuesta.isConfirmed === true;
};

export const solicitarTexto = async (
  titulo,
  { valorInicial = "", requerido = false, placeholder = "" } = {},
) => {
  const respuesta = await dialogo.fire({
    title: textoSeguro(titulo),
    input: "textarea",
    inputValue: textoSeguro(valorInicial),
    inputPlaceholder: textoSeguro(placeholder),
    inputAttributes: { "aria-label": textoSeguro(titulo), maxLength: "600" },
    inputValidator: requerido
      ? (valor) => (String(valor ?? "").trim() ? undefined : "Escribe un motivo para continuar.")
      : undefined,
    showCancelButton: true,
    confirmButtonText: "Continuar",
    cancelButtonText: "Cancelar",
    reverseButtons: true,
    focusCancel: true,
  });
  return respuesta.isConfirmed ? textoSeguro(respuesta.value).trim() : null;
};
