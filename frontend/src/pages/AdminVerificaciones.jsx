import { useEffect, useState } from "react";
import api from "../services/api";

function AdminVerificaciones() {
  const [solicitudes, setSolicitudes] = useState([]);
  const [error, setError] = useState("");

  const cargar = async () => {
    try {
      const response = await api.get("/verificaciones/admin/pendientes");
      setSolicitudes(response.data || []);
      setError("");
    } catch (err) {
      setError(err.response?.data?.mensaje || "No fue posible cargar las solicitudes");
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

  return <div className="admin-review-page">
    <section className="admin-review-hero"><div><small>Administración · Identidad</small><h1>Verificaciones pendientes</h1><p>Revisa evidencia profesional antes de conceder el rol de talento verificado.</p></div><div className="admin-review-count"><strong>{solicitudes.length}</strong><span>PENDIENTES</span></div></section>
    {error && <div className="alert alert-danger">{error}</div>}
    <section className="admin-review-list">
      {solicitudes.map((s)=><article className="admin-review-card" key={s.Id}>
        <div>
          <h2>{s.NombreArtistico || s.NombreCompleto}</h2>
          <div className="admin-review-meta"><span>Solicitante: {s.UsuarioNombre}</span><span>{s.Email}</span><span>Método: {s.Metodo}</span>{s.CodigoVerificacion && <span>Código: {s.CodigoVerificacion}</span>}</div>
          <div className="admin-review-evidence">{s.EvidenciaUrl ? <>Evidencia: <a href={s.EvidenciaUrl} target="_blank" rel="noreferrer">Abrir enlace ↗</a></> : "Sin URL de evidencia"}{s.Mensaje && <p className="mt-2 mb-0">{s.Mensaje}</p>}</div>
        </div>
        <div className="admin-review-actions"><button className="btn btn-success btn-sm" onClick={()=>revisar(s.Id,"APROBAR")}>✓ Aprobar</button><button className="btn btn-outline-danger btn-sm" onClick={()=>revisar(s.Id,"RECHAZAR")}>Rechazar</button></div>
      </article>)}
      {!solicitudes.length && !error && <div className="admin-review-empty"><div className="fs-2 mb-2">✓</div><strong>No hay solicitudes pendientes</strong><div className="small mt-1">La bandeja de revisión está al día.</div></div>}
    </section>
  </div>;
}
export default AdminVerificaciones;