import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

const ESTADOS = ["", "PENDIENTE", "EN_REVISION", "REQUIERE_MAS_EVIDENCIA", "APROBADO", "RECHAZADO"];

const ESTADO_META = {
  PENDIENTE: { etiqueta: "Pendiente", clase: "bg-warning text-dark" },
  EN_REVISION: { etiqueta: "En revisión", clase: "bg-primary" },
  REQUIERE_MAS_EVIDENCIA: { etiqueta: "Requiere más evidencia", clase: "bg-info text-dark" },
  APROBADO: { etiqueta: "Aprobado", clase: "bg-success" },
  RECHAZADO: { etiqueta: "Rechazado", clase: "bg-danger" },
};

const obtenerMetaEstado = (estado) =>
  ESTADO_META[estado] || { etiqueta: estado || "Sin estado", clase: "bg-secondary" };

function EmptyClaimsIcon() {
  return (
    <svg width="58" height="58" viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <rect x="14" y="10" width="36" height="44" rx="7" stroke="currentColor" strokeWidth="3" />
      <path d="M23 22H41M23 30H41M23 38H34" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <circle cx="47" cy="47" r="11" fill="currentColor" />
      <path d="M42.5 47L45.5 50L51.5 44" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function AdminSolicitudesCredito() {
  const [solicitudes, setSolicitudes] = useState([]);
  const [estado, setEstado] = useState("");
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState("");
  const [errorCarga, setErrorCarga] = useState("");
  const [comentarios, setComentarios] = useState({});
  const [procesandoId, setProcesandoId] = useState(null);

  const cargar = async () => {
    try {
      setCargando(true);
      setErrorCarga("");
      const { data } = await api.get("/solicitudes-creditos/admin", {
        params: estado ? { estado } : {},
      });
      setSolicitudes(data || []);
    } catch (error) {
      setSolicitudes([]);
      setErrorCarga(error.response?.data?.mensaje || "No fue posible cargar las reclamaciones.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
  }, [estado]);

  const resumen = useMemo(() => {
    const contar = (valor) => solicitudes.filter((s) => s.Estado === valor).length;
    return {
      total: solicitudes.length,
      pendientes: contar("PENDIENTE"),
      revision: contar("EN_REVISION") + contar("REQUIERE_MAS_EVIDENCIA"),
      resueltas: contar("APROBADO") + contar("RECHAZADO"),
    };
  }, [solicitudes]);

  const revisar = async (id, nuevoEstado) => {
    try {
      setMensaje("");
      setProcesandoId(id);
      await api.patch(`/solicitudes-creditos/${id}/revision`, {
        Estado: nuevoEstado,
        ComentarioAdmin: comentarios[id] || null,
      });
      setMensaje(
        nuevoEstado === "APROBADO"
          ? "Crédito aprobado y registrado en la filmografía."
          : "Solicitud actualizada correctamente.",
      );
      await cargar();
    } catch (error) {
      setMensaje(error.response?.data?.mensaje || "No fue posible actualizar la solicitud.");
    } finally {
      setProcesandoId(null);
    }
  };

  const descargar = async (evidenciaId, nombre) => {
    try {
      const response = await api.get(
        `/solicitudes-creditos/evidencias/${evidenciaId}/archivo`,
        { responseType: "blob" },
      );
      const url = URL.createObjectURL(response.data);
      const enlace = document.createElement("a");
      enlace.href = url;
      enlace.download = nombre || "evidencia";
      document.body.appendChild(enlace);
      enlace.click();
      enlace.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      setMensaje(error.response?.data?.mensaje || "No fue posible descargar la evidencia.");
    }
  };

  const mensajeVacio = estado
    ? `No hay reclamaciones con estado “${obtenerMetaEstado(estado).etiqueta}”.`
    : "Cuando un talento verificado envíe una reclamación de crédito, aparecerá aquí para revisión editorial.";

  return (
    <div className="table-page-container credit-claims-admin-page">
      <div className="d-flex flex-wrap justify-content-between align-items-end gap-3 mb-4">
        <div>
          <span className="catalog-eyebrow">CONTROL EDITORIAL</span>
          <h1 className="h2 mb-1">Reclamaciones de créditos</h1>
          <p className="text-muted mb-0">
            Valida cada participación con evidencia antes de incorporarla a la filmografía pública.
          </p>
        </div>
        <div style={{ minWidth: "280px" }}>
          <label className="form-label small text-muted mb-1" htmlFor="filtro-estado-creditos">
            Filtrar por estado
          </label>
          <select
            id="filtro-estado-creditos"
            className="form-select credit-claims-filter"
            value={estado}
            onChange={(e) => setEstado(e.target.value)}
          >
            {ESTADOS.map((valor) => (
              <option key={valor || "TODAS"} value={valor}>
                {valor ? obtenerMetaEstado(valor).etiqueta : "Todos los estados"}
              </option>
            ))}
          </select>
        </div>
      </div>

      <section className="row g-3 mb-4" aria-label="Resumen de reclamaciones">
        <div className="col-6 col-lg-3">
          <article className="card h-100 border-0 shadow-sm">
            <div className="card-body py-3">
              <small className="text-muted d-block">Solicitudes mostradas</small>
              <strong className="fs-3">{resumen.total}</strong>
            </div>
          </article>
        </div>
        <div className="col-6 col-lg-3">
          <article className="card h-100 border-0 shadow-sm">
            <div className="card-body py-3">
              <small className="text-muted d-block">Pendientes</small>
              <strong className="fs-3 text-warning">{resumen.pendientes}</strong>
            </div>
          </article>
        </div>
        <div className="col-6 col-lg-3">
          <article className="card h-100 border-0 shadow-sm">
            <div className="card-body py-3">
              <small className="text-muted d-block">En proceso</small>
              <strong className="fs-3 text-primary">{resumen.revision}</strong>
            </div>
          </article>
        </div>
        <div className="col-6 col-lg-3">
          <article className="card h-100 border-0 shadow-sm">
            <div className="card-body py-3">
              <small className="text-muted d-block">Resueltas</small>
              <strong className="fs-3 text-success">{resumen.resueltas}</strong>
            </div>
          </article>
        </div>
      </section>

      <div className="credit-claims-review-note border mb-4">
        <span className="credit-claims-review-icon" aria-hidden="true">i</span>
        <div>
          <strong>Criterio de revisión:</strong> identidad verificada no equivale a crédito verificado.
          Cada participación debe sostenerse con evidencia propia y verificable.
        </div>
      </div>

      {mensaje && <div className="alert alert-info">{mensaje}</div>}
      {errorCarga && <div className="alert alert-danger">{errorCarga}</div>}

      {cargando ? (
        <div className="text-center py-5" aria-live="polite">
          <div className="spinner-border text-primary" role="status" />
          <p className="text-muted mt-3 mb-0">Cargando reclamaciones...</p>
        </div>
      ) : errorCarga ? null : solicitudes.length === 0 ? (
        <section className="card border-0 shadow-sm overflow-hidden">
          <div className="card-body text-center px-4 py-5" style={{ minHeight: "330px", display: "grid", placeItems: "center" }}>
            <div style={{ maxWidth: "560px" }}>
              <div
                className="mx-auto mb-4 d-grid"
                style={{
                  width: "92px",
                  height: "92px",
                  placeItems: "center",
                  borderRadius: "50%",
                  background: "rgba(37, 99, 235, .1)",
                  color: "#60a5fa",
                }}
              >
                <EmptyClaimsIcon />
              </div>
              <span className="catalog-eyebrow">BANDEJA AL DÍA</span>
              <h2 className="h3 mt-2 mb-2">
                {estado ? "Sin resultados para este filtro" : "Sin reclamaciones pendientes"}
              </h2>
              <p className="text-muted mb-4">{mensajeVacio}</p>
              {estado ? (
                <button type="button" className="btn btn-outline-primary" onClick={() => setEstado("")}>
                  Ver todas las reclamaciones
                </button>
              ) : (
                <div className="d-flex flex-wrap justify-content-center gap-2">
                  <Link className="btn btn-outline-primary" to="/admin/verificaciones">
                    Gestionar verificaciones
                  </Link>
                  <Link className="btn btn-outline-secondary" to="/actores">
                    Ver talentos
                  </Link>
                </div>
              )}
            </div>
          </div>
        </section>
      ) : (
        <div className="d-grid gap-3">
          {solicitudes.map((solicitud) => {
            const metaEstado = obtenerMetaEstado(solicitud.Estado);
            const estaProcesando = procesandoId === solicitud.Id;
            const estaResuelta = ["APROBADO", "RECHAZADO"].includes(solicitud.Estado);

            return (
              <article className="card shadow-sm" key={solicitud.Id}>
                <div className="card-body p-4">
                  <div className="d-flex flex-wrap justify-content-between gap-3 mb-4">
                    <div>
                      <span className={`badge ${metaEstado.clase} mb-2`}>{metaEstado.etiqueta}</span>
                      <h2 className="h4 mb-1">
                        {solicitud.NombreArtistico || solicitud.NombreCompleto} · {solicitud.Titulo}
                      </h2>
                      <p className="text-muted mb-0">
                        {solicitud.TipoParticipacion}
                        {solicitud.PersonajeFuncion ? ` · ${solicitud.PersonajeFuncion}` : ""}
                      </p>
                    </div>
                    <div className="text-end small text-muted">
                      <strong className="d-block">Solicitud #{solicitud.Id}</strong>
                      {new Date(solicitud.FechaSolicitud).toLocaleString("es-DO")}
                    </div>
                  </div>

                  <div className="row g-3 mb-4">
                    <div className="col-md-4">
                      <div className="border rounded-3 p-3 h-100">
                        <small className="text-muted d-block">Crédito oficial</small>
                        <strong>{solicitud.EstaAcreditado ? "Sí" : "No"}</strong>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="border rounded-3 p-3 h-100">
                        <small className="text-muted d-block">Referencia de escena</small>
                        <strong>{solicitud.MinutoInicio || "—"}{solicitud.MinutoFin ? ` – ${solicitud.MinutoFin}` : ""}</strong>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="border rounded-3 p-3 h-100">
                        <small className="text-muted d-block">Usuario solicitante</small>
                        <strong className="text-break">{solicitud.UsuarioEmail}</strong>
                      </div>
                    </div>
                  </div>

                  {solicitud.DescripcionEscena && (
                    <div className="mb-4">
                      <small className="text-muted d-block mb-1">Descripción de la escena</small>
                      <p className="mb-0">{solicitud.DescripcionEscena}</p>
                    </div>
                  )}

                  <section className="border rounded-3 p-3 mb-4">
                    <div className="d-flex flex-wrap justify-content-between gap-2 mb-2">
                      <div>
                        <small className="text-muted d-block">Evidencia presentada</small>
                        <strong>{solicitud.TipoEvidencia}</strong>
                      </div>
                      {Boolean(solicitud.TieneArchivoPrivado) && <span className="badge bg-secondary align-self-start">Archivo privado</span>}
                    </div>
                    {solicitud.EvidenciaDescripcion && <p className="text-muted mb-3">{solicitud.EvidenciaDescripcion}</p>}
                    <div className="d-flex flex-wrap gap-2">
                      {solicitud.UrlExterna && (
                        <a className="btn btn-sm btn-outline-primary" href={solicitud.UrlExterna} target="_blank" rel="noreferrer noopener">
                          Abrir fuente externa ↗
                        </a>
                      )}
                      {Boolean(solicitud.TieneArchivoPrivado) && (
                        <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => descargar(solicitud.EvidenciaId, solicitud.NombreOriginal)}>
                          Descargar evidencia
                        </button>
                      )}
                      <Link className="btn btn-sm btn-outline-secondary" to={`/peliculas/${solicitud.PeliculaId}`}>Ver película</Link>
                      <Link className="btn btn-sm btn-outline-secondary" to={`/actores/${solicitud.ActorId}`}>Ver talento</Link>
                    </div>
                  </section>

                  {!estaResuelta && (
                    <>
                      <label className="form-label fw-semibold" htmlFor={`comentario-${solicitud.Id}`}>
                        Comentario editorial
                      </label>
                      <textarea
                        id={`comentario-${solicitud.Id}`}
                        className="form-control mb-3"
                        rows="3"
                        value={comentarios[solicitud.Id] || ""}
                        onChange={(e) => setComentarios((actual) => ({ ...actual, [solicitud.Id]: e.target.value }))}
                        placeholder="Documenta el criterio aplicado, motivo de rechazo o evidencia adicional requerida..."
                      />
                      <div className="d-flex flex-wrap gap-2">
                        <button className="btn btn-outline-primary" type="button" disabled={estaProcesando} onClick={() => revisar(solicitud.Id, "EN_REVISION")}>
                          Marcar en revisión
                        </button>
                        <button className="btn btn-outline-warning" type="button" disabled={estaProcesando} onClick={() => revisar(solicitud.Id, "REQUIERE_MAS_EVIDENCIA")}>
                          Solicitar más evidencia
                        </button>
                        <button className="btn btn-outline-danger" type="button" disabled={estaProcesando} onClick={() => revisar(solicitud.Id, "RECHAZADO")}>
                          Rechazar
                        </button>
                        <button className="btn btn-success ms-md-auto" type="button" disabled={estaProcesando} onClick={() => revisar(solicitud.Id, "APROBADO")}>
                          {estaProcesando ? "Procesando..." : "✓ Aprobar crédito"}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default AdminSolicitudesCredito;
