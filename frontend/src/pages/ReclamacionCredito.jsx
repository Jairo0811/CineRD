import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../services/api";

const TIPOS = [
  ["ACTOR", "Actor / Actriz"], ["DIRECTOR", "Dirección"], ["PRODUCTOR", "Producción"],
  ["GUIONISTA", "Guion"], ["COMPOSITOR", "Música / composición"], ["FOTOGRAFIA", "Fotografía"],
  ["EDICION", "Edición"], ["OTRO", "Otro"],
];

const EVIDENCIAS = [
  ["CAPTURA_ESCENA", "Captura de la escena"], ["CLIP_REFERENCIA", "Clip o referencia temporal"],
  ["CREDITOS_OFICIALES", "Créditos oficiales"], ["CALL_SHEET", "Hoja de llamado / call sheet"],
  ["CONTRATO", "Contrato o documento de producción"], ["BACKSTAGE", "Foto de rodaje / backstage"],
  ["PUBLICACION_OFICIAL", "Publicación oficial"], ["PERFIL_PROFESIONAL", "Perfil profesional verificable"],
  ["OTRO", "Otra evidencia"],
];

function ReclamacionCredito() {
  const [searchParams] = useSearchParams();
  const peliculaInicial = searchParams.get("pelicula") || "";
  const [perfil, setPerfil] = useState(null);
  const [peliculas, setPeliculas] = useState([]);
  const [misSolicitudes, setMisSolicitudes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [form, setForm] = useState({
    PeliculaId: peliculaInicial,
    TipoParticipacion: "ACTOR",
    PersonajeFuncion: "",
    EstaAcreditado: false,
    MinutoInicio: "",
    MinutoFin: "",
    DescripcionEscena: "",
    TipoEvidencia: "CAPTURA_ESCENA",
    UrlExterna: "",
    DescripcionEvidencia: "",
  });
  const [archivo, setArchivo] = useState(null);

  const cargar = async () => {
    setCargando(true);
    try {
      const [perfilR, peliculasR, solicitudesR] = await Promise.all([
        api.get("/verificaciones/mi-perfil"),
        api.get("/peliculas"),
        api.get("/solicitudes-creditos/mias"),
      ]);
      setPerfil(perfilR.data);
      setPeliculas(peliculasR.data || []);
      setMisSolicitudes(solicitudesR.data || []);
    } catch (error) {
      setMensaje(error.response?.data?.mensaje || "No fue posible preparar el formulario de reclamación.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  const peliculasOrdenadas = useMemo(
    () => [...peliculas].sort((a,b) => String(a.Titulo || "").localeCompare(String(b.Titulo || ""), "es")),
    [peliculas],
  );

  const cambiar = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((actual) => ({ ...actual, [name]: type === "checkbox" ? checked : value }));
  };

  const enviar = async (e) => {
    e.preventDefault();
    setMensaje("");
    if (!archivo && !form.UrlExterna.trim()) {
      setMensaje("Adjunta un archivo o agrega una URL verificable. Una declaración por sí sola no es suficiente.");
      return;
    }
    const data = new FormData();
    Object.entries(form).forEach(([key, value]) => data.append(key, String(value)));
    if (archivo) data.append("Evidencia", archivo);

    try {
      setGuardando(true);
      const response = await api.post("/solicitudes-creditos", data);
      setMensaje(response.data?.mensaje || "Reclamación enviada correctamente.");
      setArchivo(null);
      setForm((actual) => ({ ...actual, PersonajeFuncion:"", MinutoInicio:"", MinutoFin:"", DescripcionEscena:"", UrlExterna:"", DescripcionEvidencia:"" }));
      await cargar();
    } catch (error) {
      setMensaje(error.response?.data?.mensaje || "No fue posible enviar la reclamación.");
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) return <div className="text-center py-5"><div className="spinner-border text-primary"/><p className="mt-3 text-muted">Preparando reclamación...</p></div>;

  return <div className="table-page-container">
    <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
      <div><span className="catalog-eyebrow">TRAYECTORIA VERIFICABLE</span><h1 className="h2 mb-1">Reclamar participación</h1><p className="text-muted mb-0">Solicita agregar un crédito faltante aportando evidencia comprobable.</p></div>
      {perfil?.Id && <Link to={`/actores/${perfil.Id}`} className="btn btn-outline-secondary">← Mi perfil</Link>}
    </div>

    <div className="alert alert-warning border">
      <strong>Regla de integridad:</strong> CineRD no incorpora participaciones únicamente por declaración. Si no apareces en los créditos oficiales, debes indicar la escena y aportar evidencia suficiente para revisión.
    </div>

    <form className="card mb-4" onSubmit={enviar}><div className="card-body p-4">
      <div className="mb-3"><label className="form-label">Talento</label><input className="form-control" value={perfil?.NombreArtistico || perfil?.NombreCompleto || "Perfil verificado"} disabled/></div>
      <div className="mb-3"><label className="form-label">Película</label><select className="form-select" name="PeliculaId" value={form.PeliculaId} onChange={cambiar} required><option value="">Selecciona una película</option>{peliculasOrdenadas.map(p=><option key={p.Id} value={p.Id}>{p.Titulo}</option>)}</select></div>
      <div className="row g-3">
        <div className="col-md-6"><label className="form-label">Tipo de participación</label><select className="form-select" name="TipoParticipacion" value={form.TipoParticipacion} onChange={cambiar}>{TIPOS.map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></div>
        <div className="col-md-6"><label className="form-label">Personaje o función</label><input className="form-control" name="PersonajeFuncion" value={form.PersonajeFuncion} onChange={cambiar} maxLength="200"/></div>
      </div>
      <div className="form-check my-3"><input className="form-check-input" type="checkbox" id="acreditado" name="EstaAcreditado" checked={form.EstaAcreditado} onChange={cambiar}/><label className="form-check-label" htmlFor="acreditado">Mi nombre aparece en los créditos oficiales de la película</label></div>
      <div className="row g-3">
        <div className="col-md-3"><label className="form-label">Minuto inicial</label><input className="form-control" name="MinutoInicio" value={form.MinutoInicio} onChange={cambiar} placeholder="00:42:18" pattern="[0-9]{2}:[0-9]{2}:[0-9]{2}"/></div>
        <div className="col-md-3"><label className="form-label">Minuto final</label><input className="form-control" name="MinutoFin" value={form.MinutoFin} onChange={cambiar} placeholder="00:42:27" pattern="[0-9]{2}:[0-9]{2}:[0-9]{2}"/></div>
        <div className="col-md-6"><label className="form-label">Descripción de la escena</label><input className="form-control" name="DescripcionEscena" value={form.DescripcionEscena} onChange={cambiar} maxLength="1500" placeholder="Describe dónde y cómo apareces"/></div>
      </div>

      <hr className="my-4"/><h2 className="h5">Evidencia</h2>
      <div className="row g-3">
        <div className="col-md-5"><label className="form-label">Tipo de evidencia</label><select className="form-select" name="TipoEvidencia" value={form.TipoEvidencia} onChange={cambiar}>{EVIDENCIAS.map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></div>
        <div className="col-md-7"><label className="form-label">Archivo privado</label><input className="form-control" type="file" accept="image/jpeg,image/png,image/webp,application/pdf" onChange={(e)=>setArchivo(e.target.files?.[0] || null)}/><div className="form-text">JPG, PNG, WEBP o PDF. Máximo 10 MB. No se publica automáticamente.</div></div>
        <div className="col-12"><label className="form-label">URL externa verificable</label><input className="form-control" name="UrlExterna" value={form.UrlExterna} onChange={cambiar} placeholder="https://..."/></div>
        <div className="col-12"><label className="form-label">Descripción de la evidencia</label><textarea className="form-control" rows="3" name="DescripcionEvidencia" value={form.DescripcionEvidencia} onChange={cambiar} maxLength="1000"/></div>
      </div>
      {mensaje && <div className="alert alert-info mt-3 mb-0">{mensaje}</div>}
      <div className="mt-4 d-flex justify-content-end"><button className="btn btn-primary" disabled={guardando}>{guardando ? "Enviando..." : "Enviar para revisión"}</button></div>
    </div></form>

    <section className="card"><div className="card-body p-4"><h2 className="h5 mb-3">Mis reclamaciones</h2>{misSolicitudes.length === 0 ? <p className="text-muted mb-0">Todavía no has enviado reclamaciones de crédito.</p> : <div className="table-responsive"><table className="table align-middle"><thead><tr><th>Película</th><th>Participación</th><th>Estado</th><th>Fecha</th><th>Observación</th></tr></thead><tbody>{misSolicitudes.map(s=><tr key={s.Id}><td><Link to={`/peliculas/${s.PeliculaId}`}>{s.Titulo}</Link></td><td>{s.TipoParticipacion}</td><td><span className="badge bg-secondary">{s.Estado}</span></td><td>{new Date(s.FechaSolicitud).toLocaleDateString("es-DO")}</td><td>{s.ComentarioAdmin || "—"}</td></tr>)}</tbody></table></div>}</div></section>
  </div>;
}

export default ReclamacionCredito;
