import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api";

const METODOS = [
  { value: "RED_SOCIAL", label: "Cuenta oficial o profesional" },
  { value: "CORREO_PROFESIONAL", label: "Correo profesional" },
  { value: "REPRESENTANTE", label: "Representante, agencia o productora" },
  { value: "DOCUMENTACION_PROFESIONAL", label: "Documentación profesional" },
];

function ReclamarPerfil() {
  const { actorId } = useParams();
  const [actor, setActor] = useState(null);
  const [formulario, setFormulario] = useState({ metodo: "RED_SOCIAL", evidenciaUrl: "", mensaje: "" });
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    api.get(`/actores/${actorId}`).then((r) => setActor(r.data)).catch(() => setError("No se encontró el talento"));
  }, [actorId]);

  const enviar = async (e) => {
    e.preventDefault();
    try {
      setCargando(true);
      setError("");
      const response = await api.post(`/verificaciones/actor/${actorId}`, formulario);
      setResultado(response.data);
    } catch (err) {
      if (err.response?.status === 401) {
        setError("Debes iniciar sesión antes de reclamar un perfil.");
      } else {
        setError(err.response?.data?.mensaje || "No fue posible enviar la solicitud");
      }
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="form-page-container" style={{ maxWidth: "760px" }}>
      <Link to={`/actores/${actorId}`} className="btn btn-secondary mb-3">← Volver al perfil</Link>
      <div className="card shadow">
        <div className="card-body p-4">
          <span className="badge bg-primary mb-2">Verificación de identidad</span>
          <h1 className="h3">Reclamar perfil{actor ? ` de ${actor.NombreArtistico || actor.NombreCompleto}` : ""}</h1>
          <p className="text-muted">
            CineRD prioriza métodos profesionales y públicos. No solicitamos cédula o pasaporte en esta primera versión.
          </p>

          {error && <div className="alert alert-danger">{error}</div>}
          {resultado ? (
            <div className="alert alert-success">
              <strong>{resultado.mensaje}</strong>
              <div className="mt-2">{resultado.instrucciones}</div>
              {resultado.solicitud?.CodigoVerificacion && (
                <div className="mt-3 p-3 bg-white border rounded text-center fs-5 fw-bold">
                  {resultado.solicitud.CodigoVerificacion}
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={enviar}>
              <div className="mb-3">
                <label className="form-label">Método de verificación</label>
                <select className="form-select" value={formulario.metodo}
                  onChange={(e) => setFormulario({ ...formulario, metodo: e.target.value })}>
                  {METODOS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label">URL de evidencia</label>
                <input className="form-control" type="url" placeholder="https://..." value={formulario.evidenciaUrl}
                  onChange={(e) => setFormulario({ ...formulario, evidenciaUrl: e.target.value })} />
                <small className="text-muted">Puede ser una cuenta oficial, página de agencia, productora o evidencia profesional verificable.</small>
              </div>
              <div className="mb-3">
                <label className="form-label">Información adicional</label>
                <textarea className="form-control" rows="4" maxLength="1000" value={formulario.mensaje}
                  onChange={(e) => setFormulario({ ...formulario, mensaje: e.target.value })} />
              </div>
              <button className="btn btn-primary" disabled={cargando}>{cargando ? "Enviando..." : "Enviar solicitud"}</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default ReclamarPerfil;
