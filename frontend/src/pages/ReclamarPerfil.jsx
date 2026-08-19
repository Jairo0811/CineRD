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

  useEffect(() => { api.get(`/actores/${actorId}`).then((r)=>setActor(r.data)).catch(()=>setError("No se encontró el talento")); }, [actorId]);

  const enviar = async (e) => {
    e.preventDefault();
    try {
      setCargando(true); setError("");
      const response = await api.post(`/verificaciones/actor/${actorId}`, formulario);
      setResultado(response.data);
    } catch (err) {
      setError(err.response?.status === 401 ? "Debes iniciar sesión antes de reclamar un perfil." : err.response?.data?.mensaje || "No fue posible enviar la solicitud");
    } finally { setCargando(false); }
  };

  return <div className="verification-page">
    <div><Link to={`/actores/${actorId}`} className="btn btn-outline-secondary btn-sm">← Volver al perfil</Link></div>
    <section className="claim-shell">
      <aside className="claim-summary">
        <div className="claim-summary-top"><span>Verificación CineRD</span><h1>{actor ? actor.NombreArtistico || actor.NombreCompleto : "Reclamar perfil"}</h1><p>Solicita la vinculación de este perfil artístico con tu cuenta personal.</p></div>
        <div className="claim-summary-body"><ul className="mb-0 ps-3"><li>Usamos evidencia pública o profesional.</li><li>No solicitamos cédula ni pasaporte en esta versión.</li><li>Un administrador revisará manualmente tu solicitud.</li><li>Un perfil verificado solo puede estar vinculado a una cuenta activa.</li></ul></div>
      </aside>
      <section className="claim-form">
        <h2>Demuestra tu relación con este perfil</h2><p>Selecciona el método que mejor permita comprobar públicamente tu identidad profesional.</p>
        {error && <div className="alert alert-danger">{error}</div>}
        {resultado ? <div className="claim-success"><strong>{resultado.mensaje}</strong><div className="mt-2">{resultado.instrucciones}</div>{resultado.solicitud?.CodigoVerificacion && <div className="claim-code">{resultado.solicitud.CodigoVerificacion}</div>}</div> : <form onSubmit={enviar}>
          <div className="cine-field"><label>Método de verificación</label><select value={formulario.metodo} onChange={(e)=>setFormulario({...formulario,metodo:e.target.value})}>{METODOS.map((m)=><option key={m.value} value={m.value}>{m.label}</option>)}</select></div>
          <div className="cine-field"><label>URL de evidencia</label><input type="url" placeholder="https://..." value={formulario.evidenciaUrl} onChange={(e)=>setFormulario({...formulario,evidenciaUrl:e.target.value})}/><small className="text-muted">Red social oficial, agencia, productora o referencia profesional verificable.</small></div>
          <div className="cine-field"><label>Información adicional</label><textarea rows="5" maxLength="1000" value={formulario.mensaje} onChange={(e)=>setFormulario({...formulario,mensaje:e.target.value})}/></div>
          <button className="cine-submit" disabled={cargando}>{cargando ? "Enviando solicitud..." : "Enviar para revisión"}</button>
        </form>}
      </section>
    </section>
  </div>;
}
export default ReclamarPerfil;