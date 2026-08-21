import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

const ESTADOS = ["", "PENDIENTE", "EN_REVISION", "REQUIERE_MAS_EVIDENCIA", "APROBADO", "RECHAZADO"];

function AdminSolicitudesCredito() {
  const [solicitudes, setSolicitudes] = useState([]);
  const [estado, setEstado] = useState("");
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState("");
  const [comentarios, setComentarios] = useState({});

  const cargar = async () => {
    try {
      setCargando(true);
      const { data } = await api.get("/solicitudes-creditos/admin", { params: estado ? { estado } : {} });
      setSolicitudes(data || []);
    } catch (error) {
      setMensaje(error.response?.data?.mensaje || "No fue posible cargar las reclamaciones.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargar(); }, [estado]);

  const revisar = async (id, nuevoEstado) => {
    try {
      setMensaje("");
      await api.patch(`/solicitudes-creditos/${id}/revision`, {
        Estado: nuevoEstado,
        ComentarioAdmin: comentarios[id] || null,
      });
      setMensaje(nuevoEstado === "APROBADO" ? "Crédito aprobado y registrado en la filmografía." : "Solicitud actualizada.");
      await cargar();
    } catch (error) {
      setMensaje(error.response?.data?.mensaje || "No fue posible actualizar la solicitud.");
    }
  };

  const descargar = async (evidenciaId, nombre) => {
    try {
      const response = await api.get(`/solicitudes-creditos/evidencias/${evidenciaId}/archivo`, { responseType: "blob" });
      const url = URL.createObjectURL(response.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = nombre || "evidencia";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      setMensaje(error.response?.data?.mensaje || "No fue posible descargar la evidencia.");
    }
  };

  return <div className="table-page-container">
    <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
      <div><span className="catalog-eyebrow">CONTROL EDITORIAL</span><h1 className="h2 mb-1">Reclamaciones de créditos</h1><p className="text-muted mb-0">Revisa evidencia antes de incorporar una participación a la filmografía.</p></div>
      <select className="form-select" style={{maxWidth:280}} value={estado} onChange={(e)=>setEstado(e.target.value)}>{ESTADOS.map(e=><option key={e || "TODAS"} value={e}>{e || "Todos los estados"}</option>)}</select>
    </div>

    <div className="alert alert-secondary border"><strong>Criterio de revisión:</strong> identidad verificada no equivale a crédito verificado. Cada participación debe sostenerse con evidencia propia.</div>
    {mensaje && <div className="alert alert-info">{mensaje}</div>}
    {cargando ? <div className="text-center py-5"><div className="spinner-border text-primary"/></div> : solicitudes.length === 0 ? <div className="card"><div className="card-body text-center py-5 text-muted">No hay reclamaciones para este filtro.</div></div> : <div className="d-grid gap-3">
      {solicitudes.map((s)=><article className="card" key={s.Id}><div className="card-body p-4">
        <div className="d-flex flex-wrap justify-content-between gap-3 mb-3"><div><span className="badge bg-secondary mb-2">{s.Estado}</span><h2 className="h4 mb-1">{s.NombreArtistico || s.NombreCompleto} · {s.Titulo}</h2><p className="text-muted mb-0">{s.TipoParticipacion}{s.PersonajeFuncion ? ` · ${s.PersonajeFuncion}` : ""}</p></div><div className="text-end small text-muted">Solicitud #{s.Id}<br/>{new Date(s.FechaSolicitud).toLocaleString("es-DO")}</div></div>
        <div className="row g-3 mb-3"><div className="col-md-4"><strong>Crédito oficial:</strong><br/>{s.EstaAcreditado ? "Sí" : "No"}</div><div className="col-md-4"><strong>Escena:</strong><br/>{s.MinutoInicio || "—"}{s.MinutoFin ? ` – ${s.MinutoFin}` : ""}</div><div className="col-md-4"><strong>Usuario:</strong><br/>{s.UsuarioEmail}</div></div>
        {s.DescripcionEscena && <div className="mb-3"><strong>Descripción de escena</strong><p className="mb-0 text-muted">{s.DescripcionEscena}</p></div>}
        <div className="border rounded p-3 mb-3"><strong>Evidencia: {s.TipoEvidencia}</strong>{s.EvidenciaDescripcion && <p className="text-muted mb-2">{s.EvidenciaDescripcion}</p>}<div className="d-flex flex-wrap gap-2 mt-2">{s.UrlExterna && <a className="btn btn-sm btn-outline-primary" href={s.UrlExterna} target="_blank" rel="noreferrer">Abrir fuente externa</a>}{Boolean(s.TieneArchivoPrivado) && <button type="button" className="btn btn-sm btn-outline-secondary" onClick={()=>descargar(s.EvidenciaId,s.NombreOriginal)}>Descargar archivo privado</button>}<Link className="btn btn-sm btn-outline-dark" to={`/peliculas/${s.PeliculaId}`}>Ver película</Link><Link className="btn btn-sm btn-outline-dark" to={`/actores/${s.ActorId}`}>Ver talento</Link></div></div>
        {!['APROBADO','RECHAZADO'].includes(s.Estado) && <><label className="form-label">Comentario de revisión</label><textarea className="form-control mb-3" rows="2" value={comentarios[s.Id] || ""} onChange={(e)=>setComentarios(a=>({...a,[s.Id]:e.target.value}))} placeholder="Motivo de rechazo o evidencia adicional requerida..."/><div className="d-flex flex-wrap gap-2"><button className="btn btn-outline-secondary" type="button" onClick={()=>revisar(s.Id,"EN_REVISION")}>Marcar en revisión</button><button className="btn btn-outline-warning" type="button" onClick={()=>revisar(s.Id,"REQUIERE_MAS_EVIDENCIA")}>Solicitar más evidencia</button><button className="btn btn-outline-danger" type="button" onClick={()=>revisar(s.Id,"RECHAZADO")}>Rechazar</button><button className="btn btn-success" type="button" onClick={()=>revisar(s.Id,"APROBADO")}>✓ Aprobar crédito</button></div></>}
      </div></article>)}
    </div>}
  </div>;
}

export default AdminSolicitudesCredito;
