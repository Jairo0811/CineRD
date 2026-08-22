import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import { API_URL } from "../config/api";

const TIPOS = [
  ["FOTO_RODAJE", "Foto de rodaje"],
  ["POSTER_ALTERNATIVO", "Póster alternativo"],
  ["BACKDROP", "Backdrop"],
  ["PROMOCIONAL", "Promocional"],
  ["PRENSA", "Prensa"],
  ["EVENTO", "Evento"],
  ["TRAILER", "Trailer de YouTube"],
  ["OTRO", "Otro"],
];

const estadoInicial = {
  entidad: "pelicula",
  PeliculaId: "",
  ActorId: "",
  Tipo: "PROMOCIONAL",
  Titulo: "",
  Descripcion: "",
  VideoUrl: "",
  FuenteUrl: "",
  Orden: "",
  EsDestacada: false,
  Imagen: null,
};

const resolverImagen = (ruta) => !ruta ? "" : ruta.startsWith("http") ? ruta : `${API_URL}${ruta}`;

const obtenerYoutubeId = (valor) => {
  if (!valor) return null;
  try {
    const url = new URL(valor);
    const host = url.hostname.toLowerCase().replace(/^www\./, "");
    if (host === "youtu.be") return url.pathname.split("/").filter(Boolean)[0] || null;
    if (host === "youtube.com" || host === "m.youtube.com") {
      if (url.pathname === "/watch") return url.searchParams.get("v");
      const partes = url.pathname.split("/").filter(Boolean);
      if (["embed", "shorts", "live"].includes(partes[0])) return partes[1] || null;
    }
  } catch {
    return null;
  }
  return null;
};

const obtenerThumbnailYoutube = (url) => {
  const id = obtenerYoutubeId(url);
  return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : "";
};

function AdminGaleria() {
  const [items, setItems] = useState([]);
  const [peliculas, setPeliculas] = useState([]);
  const [actores, setActores] = useState([]);
  const [form, setForm] = useState(estadoInicial);
  const [editandoId, setEditandoId] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [filtro, setFiltro] = useState("todos");

  const cargar = async () => {
    try {
      setCargando(true);
      const [galeriaRes, peliculasRes, actoresRes] = await Promise.all([
        api.get("/galeria"),
        api.get("/peliculas"),
        api.get("/actores"),
      ]);
      setItems(galeriaRes.data || []);
      setPeliculas(peliculasRes.data || []);
      setActores(actoresRes.data || []);
    } catch (e) {
      console.error(e);
      setError(e.response?.data?.mensaje || "No fue posible cargar la galería");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  const itemsFiltrados = useMemo(() => {
    if (filtro === "peliculas") return items.filter((x) => x.PeliculaId);
    if (filtro === "talentos") return items.filter((x) => x.ActorId);
    if (filtro === "trailers") return items.filter((x) => x.Tipo === "TRAILER");
    return items;
  }, [items, filtro]);

  const esTrailer = form.Tipo === "TRAILER";

  const cambiar = (campo, valor) => setForm((actual) => ({ ...actual, [campo]: valor }));

  const cambiarEntidad = (entidad) => {
    setForm((actual) => ({
      ...actual,
      entidad,
      PeliculaId: entidad === "pelicula" ? actual.PeliculaId : "",
      ActorId: entidad === "talento" ? actual.ActorId : "",
    }));
  };

  const cambiarTipo = (tipo) => {
    setForm((actual) => ({
      ...actual,
      Tipo: tipo,
      entidad: tipo === "TRAILER" ? "pelicula" : actual.entidad,
      ActorId: tipo === "TRAILER" ? "" : actual.ActorId,
      Imagen: tipo === "TRAILER" ? null : actual.Imagen,
      VideoUrl: tipo === "TRAILER" ? actual.VideoUrl : "",
    }));
  };

  const resetear = () => {
    setForm(estadoInicial);
    setEditandoId(null);
    setError("");
  };

  const editar = (item) => {
    setEditandoId(item.Id);
    setForm({
      entidad: item.PeliculaId ? "pelicula" : "talento",
      PeliculaId: item.PeliculaId ? String(item.PeliculaId) : "",
      ActorId: item.ActorId ? String(item.ActorId) : "",
      Tipo: item.Tipo,
      Titulo: item.Titulo || "",
      Descripcion: item.Descripcion || "",
      VideoUrl: item.VideoUrl || "",
      FuenteUrl: item.FuenteUrl || "",
      Orden: item.Orden ?? "",
      EsDestacada: Boolean(item.EsDestacada),
      Imagen: null,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const construirFormData = () => {
    const data = new FormData();
    data.append("PeliculaId", form.entidad === "pelicula" ? form.PeliculaId : "");
    data.append("ActorId", form.entidad === "talento" ? form.ActorId : "");
    data.append("Tipo", form.Tipo);
    data.append("Titulo", form.Titulo);
    data.append("Descripcion", form.Descripcion);
    data.append("VideoUrl", form.VideoUrl);
    data.append("FuenteUrl", form.FuenteUrl);
    data.append("Orden", form.Orden);
    data.append("EsDestacada", String(form.EsDestacada));
    if (form.Imagen) data.append("Imagen", form.Imagen);
    return data;
  };

  const guardar = async (e) => {
    e.preventDefault();
    const entidadId = form.entidad === "pelicula" ? form.PeliculaId : form.ActorId;
    if (!entidadId) {
      setError("Selecciona una película o talento");
      return;
    }
    if (esTrailer && !obtenerYoutubeId(form.VideoUrl)) {
      setError("Pega una URL válida de YouTube para el trailer");
      return;
    }
    if (!esTrailer && !editandoId && !form.Imagen) {
      setError("Selecciona una imagen");
      return;
    }

    try {
      setGuardando(true);
      setError("");
      const data = construirFormData();
      if (editandoId) {
        await api.put(`/galeria/${editandoId}`, data);
      } else {
        await api.post("/galeria", data);
      }
      resetear();
      await cargar();
    } catch (e2) {
      console.error(e2);
      setError(e2.response?.data?.mensaje || "No fue posible guardar el contenido multimedia");
    } finally {
      setGuardando(false);
    }
  };

  const eliminar = async (item) => {
    const etiqueta = item.Tipo === "TRAILER" ? "este trailer" : "esta imagen";
    if (!window.confirm(`¿Eliminar ${etiqueta} de la galería?`)) return;
    try {
      await api.delete(`/galeria/${item.Id}`);
      await cargar();
    } catch (e) {
      console.error(e);
      setError(e.response?.data?.mensaje || "No fue posible eliminar el contenido multimedia");
    }
  };

  return (
    <div className="table-page-container">
      <header className="mb-4">
        <span className="catalog-eyebrow">FASE 8 · CATÁLOGO</span>
        <h1 className="display-6 fw-bold">Galerías multimedia</h1>
        <p className="text-muted mb-0">Administra imágenes de películas y talentos, además de trailers enlazados directamente desde YouTube.</p>
      </header>

      {error && <div className="alert alert-danger">{error}</div>}

      <section className="card mb-4">
        <div className="card-body p-4">
          <h2 className="h5 mb-3">{editandoId ? "Editar contenido" : "Agregar contenido"}</h2>
          <form onSubmit={guardar} className="row g-3">
            <div className="col-12 col-md-3">
              <label className="form-label">Entidad</label>
              <select className="form-select" value={form.entidad} onChange={(e)=>cambiarEntidad(e.target.value)} disabled={esTrailer}>
                <option value="pelicula">Película</option>
                <option value="talento">Talento</option>
              </select>
              {esTrailer && <div className="form-text">Los trailers se asocian únicamente a películas.</div>}
            </div>

            <div className="col-12 col-md-5">
              <label className="form-label">{form.entidad === "pelicula" ? "Película" : "Talento"}</label>
              {form.entidad === "pelicula" ? (
                <select className="form-select" value={form.PeliculaId} onChange={(e)=>cambiar("PeliculaId", e.target.value)} required>
                  <option value="">Seleccionar...</option>
                  {peliculas.map((p)=><option key={p.Id} value={p.Id}>{p.Titulo}</option>)}
                </select>
              ) : (
                <select className="form-select" value={form.ActorId} onChange={(e)=>cambiar("ActorId", e.target.value)} required>
                  <option value="">Seleccionar...</option>
                  {actores.map((a)=><option key={a.Id} value={a.Id}>{a.NombreArtistico || a.NombreCompleto}</option>)}
                </select>
              )}
            </div>

            <div className="col-12 col-md-4">
              <label className="form-label">Tipo</label>
              <select className="form-select" value={form.Tipo} onChange={(e)=>cambiarTipo(e.target.value)}>
                {TIPOS.map(([valor,etiqueta])=><option key={valor} value={valor}>{etiqueta}</option>)}
              </select>
            </div>

            <div className="col-12 col-md-6">
              <label className="form-label">Título</label>
              <input className="form-control" maxLength={180} value={form.Titulo} onChange={(e)=>cambiar("Titulo",e.target.value)} placeholder={esTrailer ? "Trailer oficial" : "Título opcional"} />
            </div>

            {esTrailer ? (
              <div className="col-12 col-md-4">
                <label className="form-label">URL de YouTube</label>
                <input className="form-control" type="url" maxLength={500} value={form.VideoUrl} onChange={(e)=>cambiar("VideoUrl",e.target.value)} placeholder="https://www.youtube.com/watch?v=..." required />
              </div>
            ) : (
              <div className="col-12 col-md-4">
                <label className="form-label">Imagen {editandoId ? "(opcional)" : ""}</label>
                <input className="form-control" type="file" accept="image/jpeg,image/png,image/webp" onChange={(e)=>cambiar("Imagen",e.target.files?.[0] || null)} />
              </div>
            )}

            <div className="col-12 col-md-2">
              <label className="form-label">Orden</label>
              <input className="form-control" type="number" min="0" value={form.Orden} onChange={(e)=>cambiar("Orden",e.target.value)} />
            </div>

            <div className="col-12 col-md-8">
              <label className="form-label">Descripción</label>
              <textarea className="form-control" rows="2" maxLength={700} value={form.Descripcion} onChange={(e)=>cambiar("Descripcion",e.target.value)} />
            </div>
            <div className="col-12 col-md-4">
              <label className="form-label">Fuente / referencia URL</label>
              <input className="form-control" type="url" maxLength={500} value={form.FuenteUrl} onChange={(e)=>cambiar("FuenteUrl",e.target.value)} placeholder={esTrailer ? "Opcional: página oficial de la película" : "https://..."} />
            </div>

            {esTrailer && form.VideoUrl && obtenerYoutubeId(form.VideoUrl) && (
              <div className="col-12">
                <div className="ratio ratio-16x9 rounded-3 overflow-hidden border" style={{maxWidth:"720px"}}>
                  <iframe src={`https://www.youtube.com/embed/${obtenerYoutubeId(form.VideoUrl)}`} title="Vista previa del trailer" allowFullScreen />
                </div>
              </div>
            )}

            <div className="col-12 d-flex flex-wrap gap-3 align-items-center">
              <div className="form-check">
                <input className="form-check-input" type="checkbox" id="galeriaDestacada" checked={form.EsDestacada} onChange={(e)=>cambiar("EsDestacada",e.target.checked)} />
                <label className="form-check-label" htmlFor="galeriaDestacada">{esTrailer ? "Trailer principal de la película" : "Imagen destacada"}</label>
              </div>
              <button className="btn btn-primary" disabled={guardando}>{guardando ? "Guardando..." : editandoId ? "Guardar cambios" : "Agregar a galería"}</button>
              {editandoId && <button className="btn btn-outline-secondary" type="button" onClick={resetear}>Cancelar</button>}
            </div>
          </form>
        </div>
      </section>

      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <div className="btn-group" role="group" aria-label="Filtrar galería">
          <button className={`btn btn-sm ${filtro==="todos"?"btn-primary":"btn-outline-primary"}`} onClick={()=>setFiltro("todos")}>Todo</button>
          <button className={`btn btn-sm ${filtro==="peliculas"?"btn-primary":"btn-outline-primary"}`} onClick={()=>setFiltro("peliculas")}>Películas</button>
          <button className={`btn btn-sm ${filtro==="talentos"?"btn-primary":"btn-outline-primary"}`} onClick={()=>setFiltro("talentos")}>Talentos</button>
          <button className={`btn btn-sm ${filtro==="trailers"?"btn-primary":"btn-outline-primary"}`} onClick={()=>setFiltro("trailers")}>Trailers</button>
        </div>
        <span className="text-muted small">{itemsFiltrados.length} elementos</span>
      </div>

      {cargando ? <div className="text-center py-5"><div className="spinner-border" /></div> : (
        <div className="row g-3">
          {itemsFiltrados.map((item)=>{
            const trailer = item.Tipo === "TRAILER";
            const miniatura = trailer ? obtenerThumbnailYoutube(item.VideoUrl) : resolverImagen(item.Archivo);
            return <div className="col-12 col-sm-6 col-lg-4 col-xl-3" key={item.Id}>
              <article className="card h-100 overflow-hidden">
                {miniatura ? <img src={miniatura} alt={item.Titulo || item.Pelicula || item.Talento || "Galería CineRD"} style={{width:"100%",aspectRatio:"4/3",objectFit:"cover"}} /> : <div className="d-grid bg-light" style={{aspectRatio:"4/3",placeItems:"center",fontSize:"2rem"}}>🎞️</div>}
                <div className="card-body">
                  <div className="d-flex justify-content-between gap-2 align-items-start mb-2">
                    <span className={`badge ${trailer ? "bg-danger" : "bg-secondary"}`}>{TIPOS.find(([v])=>v===item.Tipo)?.[1] || item.Tipo}</span>
                    {item.EsDestacada && <span title={trailer ? "Trailer principal" : "Destacada"}>⭐</span>}
                  </div>
                  <strong className="d-block">{item.Titulo || item.Pelicula || item.Talento}</strong>
                  <small className="text-muted d-block mb-2">{item.Pelicula ? `🎬 ${item.Pelicula}` : `🎭 ${item.Talento}`}</small>
                  {item.Descripcion && <p className="small text-muted mb-3">{item.Descripcion}</p>}
                  <div className="d-flex flex-wrap gap-2">
                    {trailer && <a className="btn btn-sm btn-danger" href={item.VideoUrl} target="_blank" rel="noreferrer noopener">YouTube ↗</a>}
                    <button className="btn btn-sm btn-outline-primary" onClick={()=>editar(item)}>Editar</button>
                    <button className="btn btn-sm btn-outline-danger" onClick={()=>eliminar(item)}>Eliminar</button>
                  </div>
                </div>
              </article>
            </div>;
          })}
          {!itemsFiltrados.length && <div className="col-12"><div className="text-center text-muted py-5">Todavía no hay contenido multimedia registrado.</div></div>}
        </div>
      )}
    </div>
  );
}

export default AdminGaleria;