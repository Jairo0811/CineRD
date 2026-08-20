import { useEffect, useState } from "react";
import api from "../services/api";

const API_URL = "http://localhost:3000";
const resolverImagen = (ruta) => !ruta ? null : ruta.startsWith("http") ? ruta : `${API_URL}${ruta}`;

function AdminVerificaciones() {
  const [solicitudes, setSolicitudes] = useState([]);
  const [vinculaciones, setVinculaciones] = useState([]);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(true);

  const cargar = async () => {
    try {
      setCargando(true);
      const [pendientesResponse, vinculacionesResponse] = await Promise.all([
        api.get("/verificaciones/admin/pendientes"),
        api.get("/verificaciones/admin/vinculaciones"),
      ]);
      setSolicitudes(pendientesResponse.data || []);
      setVinculaciones(vinculacionesResponse.data || []);
      setError("");
    } catch (err) {
      setError(err.response?.data?.mensaje || "No fue posible cargar la gestión de verificaciones");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  const revisar = async (id, decision) => {
    const observaciones = window.prompt("Observaciones de la revisión (opcional):", "") ?? "";
    try {
      await api.patch(`/verificaciones/admin/${id}/revisar`, { decision, observaciones });
      await cargar();
    } catch (err) {
      alert(err.response?.data?.mensaje || "No fue posible revisar la solicitud");
    }
  };

  const revocar = async (vinculacion) => {
    const nombre = vinculacion.NombreArtistico || vinculacion.NombreCompleto;
    const confirmar = window.confirm(`¿Deseas desvincular la cuenta de ${vinculacion.UsuarioNombre} del perfil de ${nombre}?\n\nLa cuenta volverá al rol USUARIO y la verificación quedará registrada como revocada.`);
    if (!confirmar) return;

    const motivo = window.prompt("Motivo de la revocación:", "Prueba o corrección administrativa") ?? "";
    if (!motivo.trim()) return;

    try {
      await api.patch(`/verificaciones/admin/vinculaciones/${vinculacion.Id}/revocar`, { motivo });
      await cargar();
      alert("Vinculación revocada correctamente. El usuario deberá iniciar sesión nuevamente para recibir su nuevo rol.");
    } catch (err) {
      alert(err.response?.data?.mensaje || "No fue posible revocar la vinculación");
    }
  };

  return (
    <div className="admin-review-page">
      <section className="admin-review-hero">
        <div>
          <small>Administración · Identidad</small>
          <h1>Gestión de verificaciones</h1>
          <p>Revisa solicitudes pendientes y administra las vinculaciones profesionales activas de CineRD.</p>
        </div>
        <div className="admin-review-summary">
          <div className="admin-review-count"><strong>{solicitudes.length}</strong><span>PENDIENTES</span></div>
          <div className="admin-review-count verified"><strong>{vinculaciones.length}</strong><span>VERIFICADOS</span></div>
        </div>
      </section>

      {error && <div className="alert alert-danger">{error}</div>}
      {cargando && <div className="text-center py-5"><div className="spinner-border text-primary" role="status"/></div>}

      {!cargando && (
        <>
          <section className="admin-review-section">
            <div className="admin-review-section-heading">
              <div><span>SOLICITUDES</span><h2>Pendientes de revisión</h2></div>
              <p>{solicitudes.length ? "Revisa cuidadosamente la evidencia antes de aprobar." : "No hay solicitudes esperando revisión."}</p>
            </div>

            <div className="admin-review-list">
              {solicitudes.map((s) => (
                <article className="admin-review-card" key={s.Id}>
                  <div>
                    <h2>{s.NombreArtistico || s.NombreCompleto}</h2>
                    <div className="admin-review-meta">
                      <span>Solicitante: {s.UsuarioNombre}</span><span>{s.Email}</span><span>Método: {s.Metodo}</span>
                      {s.CodigoVerificacion && <span>Código: {s.CodigoVerificacion}</span>}
                    </div>
                    <div className="admin-review-evidence">
                      {s.EvidenciaUrl ? <>Evidencia: <a href={s.EvidenciaUrl} target="_blank" rel="noreferrer">Abrir enlace ↗</a></> : "Sin URL de evidencia"}
                      {s.Mensaje && <p className="mt-2 mb-0">{s.Mensaje}</p>}
                    </div>
                  </div>
                  <div className="admin-review-actions">
                    <button className="btn btn-success btn-sm" onClick={() => revisar(s.Id, "APROBAR")}>✓ Aprobar</button>
                    <button className="btn btn-outline-danger btn-sm" onClick={() => revisar(s.Id, "RECHAZAR")}>Rechazar</button>
                  </div>
                </article>
              ))}
              {!solicitudes.length && !error && <div className="admin-review-empty"><div className="fs-2 mb-2">✓</div><strong>No hay solicitudes pendientes</strong><div className="small mt-1">La bandeja de revisión está al día.</div></div>}
            </div>
          </section>

          <section className="admin-review-section">
            <div className="admin-review-section-heading">
              <div><span>IDENTIDADES ACTIVAS</span><h2>Talentos verificados</h2></div>
              <p>Desde aquí puedes revocar una vinculación incorrecta o utilizada para pruebas.</p>
            </div>

            <div className="verified-links-grid">
              {vinculaciones.map((v) => {
                const imagen = resolverImagen(v.Foto);
                const nombre = v.NombreArtistico || v.NombreCompleto;
                return (
                  <article className="verified-link-card" key={v.Id}>
                    <div className="verified-link-profile">
                      {imagen ? <img src={imagen} alt={nombre} /> : <div className="verified-link-placeholder">🎭</div>}
                      <div>
                        <span className="verified-link-badge">✓ Verificado</span>
                        <h3>{nombre}</h3>
                        <small>{v.Profesion || "Talento cinematográfico"}</small>
                      </div>
                    </div>
                    <div className="verified-link-account">
                      <small>Cuenta vinculada</small>
                      <strong>{v.UsuarioNombre}</strong>
                      <span>{v.Email}</span>
                    </div>
                    <div className="verified-link-footer">
                      <span>{v.FechaVerificacion ? new Date(v.FechaVerificacion).toLocaleDateString("es-DO") : "Verificación activa"}</span>
                      <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => revocar(v)}>Desvincular</button>
                    </div>
                  </article>
                );
              })}
              {!vinculaciones.length && <div className="admin-review-empty"><div className="fs-2 mb-2">🎭</div><strong>No hay talentos verificados</strong><div className="small mt-1">Las vinculaciones aprobadas aparecerán aquí.</div></div>}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

export default AdminVerificaciones;