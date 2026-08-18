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

  return (
    <div className="table-page-container">
      <div className="mb-4">
        <span className="badge bg-dark mb-2">Administración</span>
        <h1 className="h2">Solicitudes de verificación</h1>
        <p className="text-muted">Revisa la evidencia antes de conceder el rol de talento verificado.</p>
      </div>
      {error && <div className="alert alert-danger">{error}</div>}
      <div className="row g-3">
        {solicitudes.map((s) => (
          <div className="col-12" key={s.Id}>
            <div className="card shadow-sm">
              <div className="card-body">
                <div className="d-flex flex-column flex-lg-row justify-content-between gap-3">
                  <div>
                    <h2 className="h5 mb-1">{s.NombreArtistico || s.NombreCompleto}</h2>
                    <div className="text-muted small">Solicitante: {s.UsuarioNombre} · {s.Email}</div>
                    <div className="mt-2"><strong>Método:</strong> {s.Metodo}</div>
                    {s.CodigoVerificacion && <div><strong>Código:</strong> {s.CodigoVerificacion}</div>}
                    {s.EvidenciaUrl && <div><strong>Evidencia:</strong> <a href={s.EvidenciaUrl} target="_blank" rel="noreferrer">Abrir enlace</a></div>}
                    {s.Mensaje && <p className="mt-2 mb-0">{s.Mensaje}</p>}
                  </div>
                  <div className="d-flex align-items-start gap-2">
                    <button className="btn btn-success" onClick={() => revisar(s.Id, "APROBAR")}>✓ Aprobar</button>
                    <button className="btn btn-outline-danger" onClick={() => revisar(s.Id, "RECHAZAR")}>✕ Rechazar</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
        {!solicitudes.length && !error && <div className="text-center text-muted py-5">No hay solicitudes pendientes.</div>}
      </div>
    </div>
  );
}

export default AdminVerificaciones;
