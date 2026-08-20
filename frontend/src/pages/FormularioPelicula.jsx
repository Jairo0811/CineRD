import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import PeliculaTraduccionesPanel from "../components/peliculas/PeliculaTraduccionesPanel";
import PeliculaCreditosPanel from "../components/peliculas/PeliculaCreditosPanel";

const generos = [
  "Acción", "Animación", "Aventura", "Biográfica", "Ciencia ficción",
  "Comedia", "Documental", "Drama", "Fantasía", "Infantil",
  "Musical", "Romance", "Suspenso", "Terror",
];

const MAPA_GENEROS_TMDB = {
  Action: "Acción", Acción: "Acción", Animation: "Animación", Animación: "Animación",
  Adventure: "Aventura", Aventura: "Aventura", Biography: "Biográfica", Biográfica: "Biográfica",
  "Science Fiction": "Ciencia ficción", "Ciencia ficción": "Ciencia ficción",
  Comedy: "Comedia", Comedia: "Comedia", Documentary: "Documental", Documental: "Documental",
  Drama: "Drama", Fantasy: "Fantasía", Fantasía: "Fantasía", Family: "Infantil",
  Familia: "Infantil", Infantil: "Infantil", Music: "Musical", Música: "Musical",
  Musical: "Musical", Romance: "Romance", Thriller: "Suspenso", Suspenso: "Suspenso",
  Horror: "Terror", Terror: "Terror",
};

const IDIOMAS = [
  ["es", "Español"], ["en", "Inglés"], ["fr", "Francés"], ["pt", "Portugués"],
  ["it", "Italiano"], ["de", "Alemán"], ["ja", "Japonés"], ["ko", "Coreano"],
  ["zh", "Chino"], ["ht", "Criollo haitiano"], ["other", "Otro"],
];

function FormularioPelicula() {
  const navigate = useNavigate();
  const { id } = useParams();
  const esEdicion = Boolean(id);
  const API_URL = "http://localhost:3000";

  const [formulario, setFormulario] = useState({
    TMDbId: "",
    Titulo: "",
    Genero: "",
    Director: "",
    Productora: "",
    FechaEstreno: "",
    Sinopsis: "",
    IdiomaOriginal: "",
  });

  const [foto, setFoto] = useState(null);
  const [vistaPrevia, setVistaPrevia] = useState(null);
  const [directores, setDirectores] = useState([]);
  const [resultadosTmdb, setResultadosTmdb] = useState([]);
  const [buscandoTmdb, setBuscandoTmdb] = useState(false);
  const [importandoTmdbId, setImportandoTmdbId] = useState(null);
  const [mensajeTmdb, setMensajeTmdb] = useState("");

  useEffect(() => {
    obtenerDirectores();
    if (esEdicion) obtenerPelicula();
  }, [id]);

  useEffect(() => () => {
    if (vistaPrevia?.startsWith("blob:")) URL.revokeObjectURL(vistaPrevia);
  }, [vistaPrevia]);

  const directorImportadoNoRegistrado = useMemo(() => {
    if (!formulario.Director) return false;
    return !directores.some((director) =>
      director.NombreCompleto.trim().toLowerCase() === formulario.Director.trim().toLowerCase());
  }, [directores, formulario.Director]);

  const formatearFecha = (fecha) => fecha ? fecha.substring(0, 10) : "";
  const formatearFechaVisual = (fecha) => fecha
    ? new Date(`${fecha}T00:00:00`).toLocaleDateString("es-DO", { day: "numeric", month: "long", year: "numeric" })
    : "Fecha no disponible";
  const normalizarGeneroTmdb = (genero) => genero ? (MAPA_GENEROS_TMDB[genero] || genero) : "";

  const obtenerDirectores = async () => {
    try {
      const response = await api.get("/actores", { params: { profesion: "Director" } });
      setDirectores(response.data || []);
    } catch (error) { console.error("Error al cargar los directores:", error); }
  };

  const obtenerPelicula = async () => {
    try {
      const { data: pelicula } = await api.get(`/peliculas/${id}`);
      setFormulario({
        TMDbId: pelicula.TMDbId || "",
        Titulo: pelicula.Titulo || "",
        Genero: pelicula.Genero || "",
        Director: pelicula.Director || "",
        Productora: pelicula.Productora || "",
        FechaEstreno: formatearFecha(pelicula.FechaEstreno),
        Sinopsis: pelicula.Sinopsis || "",
        IdiomaOriginal: pelicula.IdiomaOriginal || "",
      });
      if (pelicula.Foto) setVistaPrevia(`${API_URL}${pelicula.Foto}`);
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.mensaje || "Error al cargar la película");
    }
  };

  const manejarCambio = (e) => {
    const { name, value } = e.target;
    setFormulario((actual) => ({ ...actual, [name]: value }));
    if (name === "Titulo") setMensajeTmdb("");
  };

  const manejarFoto = (e) => {
    const archivo = e.target.files?.[0];
    if (!archivo) return;
    if (vistaPrevia?.startsWith("blob:")) URL.revokeObjectURL(vistaPrevia);
    setFoto(archivo);
    setVistaPrevia(URL.createObjectURL(archivo));
  };

  const buscarEnTmdb = async () => {
    const titulo = formulario.Titulo.trim();
    if (titulo.length < 2) return alert("Escribe al menos 2 caracteres para buscar en TMDb");

    try {
      setBuscandoTmdb(true);
      setMensajeTmdb("");
      setResultadosTmdb([]);
      const response = await api.get("/tmdb/peliculas/buscar", { params: { titulo } });
      const resultados = response.data || [];
      setResultadosTmdb(resultados);
      if (!resultados.length) setMensajeTmdb("No se encontraron resultados en TMDb. Puedes registrar la película manualmente.");
    } catch (error) {
      console.error("Error al buscar en TMDb:", error);
      setMensajeTmdb(error.response?.data?.mensaje || "No fue posible consultar TMDb en este momento.");
    } finally { setBuscandoTmdb(false); }
  };

  const descargarPosterComoArchivo = async (posterUrl, tmdbId) => {
    if (!posterUrl) return null;
    try {
      const response = await fetch(posterUrl);
      if (!response.ok) throw new Error("No fue posible descargar el póster");
      const blob = await response.blob();
      const extension = blob.type === "image/png" ? "png" : blob.type === "image/webp" ? "webp" : "jpg";
      return new File([blob], `tmdb-pelicula-${tmdbId}.${extension}`, { type: blob.type || "image/jpeg" });
    } catch (error) {
      console.warn("No fue posible descargar automáticamente el póster:", error);
      return null;
    }
  };

  const importarDesdeTmdb = async (resultado) => {
    try {
      setImportandoTmdbId(resultado.TmdbId);
      setMensajeTmdb("");
      const response = await api.get(`/tmdb/peliculas/${resultado.TmdbId}`);
      const peliculaTmdb = response.data;
      const generoNormalizado = normalizarGeneroTmdb(peliculaTmdb.Genero);

      setFormulario((actual) => ({
        ...actual,
        TMDbId: peliculaTmdb.TmdbId || resultado.TmdbId,
        Titulo: peliculaTmdb.Titulo || resultado.Titulo || actual.Titulo,
        Genero: generos.includes(generoNormalizado) ? generoNormalizado : "",
        Director: peliculaTmdb.Director || "",
        FechaEstreno: formatearFecha(peliculaTmdb.FechaEstreno) || formatearFecha(resultado.FechaEstreno),
        Sinopsis: peliculaTmdb.Sinopsis || resultado.Sinopsis || actual.Sinopsis,
        IdiomaOriginal: peliculaTmdb.IdiomaOriginal || actual.IdiomaOriginal,
      }));

      const posterUrl = peliculaTmdb.PosterUrl || resultado.PosterUrl || null;
      if (posterUrl) {
        if (vistaPrevia?.startsWith("blob:")) URL.revokeObjectURL(vistaPrevia);
        setVistaPrevia(posterUrl);
        setFoto(await descargarPosterComoArchivo(posterUrl, resultado.TmdbId));
      }

      setResultadosTmdb([]);
      if (peliculaTmdb.Director && !directores.some((director) =>
        director.NombreCompleto.trim().toLowerCase() === peliculaTmdb.Director.trim().toLowerCase())) {
        setMensajeTmdb(`Información importada. El director "${peliculaTmdb.Director}" todavía no está registrado como talento en CineRD.`);
      } else {
        setMensajeTmdb("Información importada correctamente. Revisa los datos antes de guardar.");
      }
    } catch (error) {
      console.error("Error al importar desde TMDb:", error);
      alert(error.response?.data?.mensaje || "No fue posible importar la información desde TMDb");
    } finally { setImportandoTmdbId(null); }
  };

  const desvincularTmdb = () => {
    if (!window.confirm("¿Deseas eliminar la vinculación de esta película con TMDb?")) return;
    setFormulario((actual) => ({ ...actual, TMDbId: "" }));
    setMensajeTmdb("La película quedará guardada sin vinculación con TMDb.");
  };

  const guardarPelicula = async (e) => {
    e.preventDefault();
    const titulo = formulario.Titulo.trim();
    if (!titulo || !formulario.Genero || !formulario.FechaEstreno) {
      return alert("Título, género y fecha de estreno son obligatorios");
    }

    const datos = new FormData();
    Object.entries({
      TMDbId: formulario.TMDbId || "",
      Titulo: titulo,
      Genero: formulario.Genero,
      Director: formulario.Director,
      Productora: formulario.Productora.trim(),
      FechaEstreno: formulario.FechaEstreno,
      Sinopsis: formulario.Sinopsis.trim(),
      IdiomaOriginal: formulario.IdiomaOriginal,
    }).forEach(([clave, valor]) => datos.append(clave, valor));
    if (foto) datos.append("Foto", foto);

    try {
      const config = { headers: { "Content-Type": "multipart/form-data" } };
      if (esEdicion) {
        await api.put(`/peliculas/${id}`, datos, config);
        alert("Película actualizada correctamente");
      } else {
        await api.post("/peliculas", datos, config);
        alert("Película registrada correctamente");
      }
      navigate("/peliculas");
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.mensaje || error.response?.data?.error || "Error al guardar la película");
    }
  };

  return <div className="form-page-container">
    <Link to="/peliculas" className="btn btn-secondary mb-3">← Volver a Películas</Link>
    <div className="text-center"><h2>{esEdicion ? "✏️ Editar Película" : "➕ Nueva Película"}</h2></div>

    <form onSubmit={guardarPelicula} className="card mt-3 shadow">
      <div className="card-body">
        <div className="card border-primary mb-4">
          <div className="card-header bg-white fw-bold text-primary">🎬 Asistente de importación desde TMDb</div>
          <div className="card-body">
            <p className="text-muted">Busca una película en TMDb para completar automáticamente sus datos. Podrás revisarlos antes de guardar.</p>
            <div className="row g-2">
              <div className="col-12 col-md-8"><input type="text" className="form-control" placeholder="Ej: Sanky Panky" value={formulario.Titulo} onChange={(e)=>setFormulario((actual)=>({...actual,Titulo:e.target.value}))} onKeyDown={(e)=>{if(e.key==="Enter"){e.preventDefault();buscarEnTmdb();}}}/></div>
              <div className="col-12 col-md-4"><button type="button" className="btn btn-outline-primary w-100" onClick={buscarEnTmdb} disabled={buscandoTmdb}>{buscandoTmdb ? "Buscando..." : "🔍 Buscar en TMDb"}</button></div>
            </div>

            {formulario.TMDbId && <div className="alert alert-success mt-3 mb-0"><div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2"><span>✅ Película vinculada con TMDb. <strong>ID: {formulario.TMDbId}</strong></span><button type="button" className="btn btn-sm btn-outline-danger" onClick={desvincularTmdb}>Desvincular</button></div></div>}
            {mensajeTmdb && <div className="alert alert-info mt-3 mb-0">{mensajeTmdb}</div>}

            {resultadosTmdb.length > 0 && <div className="mt-4">
              <div className="d-flex justify-content-between align-items-center mb-3"><h5 className="mb-0">Resultados encontrados</h5><button type="button" className="btn btn-sm btn-secondary" onClick={()=>{setResultadosTmdb([]);setMensajeTmdb("");}}>Cerrar resultados</button></div>
              <div className="row g-3">{resultadosTmdb.map((resultado)=><div className="col-12" key={resultado.TmdbId}><div className="card shadow-sm"><div className="card-body"><div className="d-flex flex-column flex-sm-row gap-3">{resultado.PosterUrl?<img src={resultado.PosterUrl} alt={`Póster de ${resultado.Titulo}`} style={{width:"100px",height:"150px",objectFit:"cover",borderRadius:"8px",flexShrink:0}}/>:<div className="d-flex align-items-center justify-content-center bg-light border rounded" style={{width:"100px",height:"150px",fontSize:"32px",flexShrink:0}}>🎬</div>}<div className="flex-grow-1"><h5>{resultado.Titulo}</h5>{resultado.TituloOriginal&&resultado.TituloOriginal!==resultado.Titulo&&<p className="text-muted mb-1">Título original: {resultado.TituloOriginal}</p>}<p className="mb-2">📅 {formatearFechaVisual(resultado.FechaEstreno)}</p><p className="text-muted">{resultado.Sinopsis||"Sinopsis no disponible."}</p><button type="button" className="btn btn-primary" disabled={importandoTmdbId===resultado.TmdbId} onClick={()=>importarDesdeTmdb(resultado)}>{importandoTmdbId===resultado.TmdbId?"Importando...":"📥 Importar información"}</button></div></div></div></div></div>)}</div>
              <p className="text-muted small mt-3 mb-0">Datos e imágenes proporcionados por TMDb.</p>
            </div>}
          </div>
        </div>

        <div className="mb-3"><label className="form-label">Título</label><input type="text" name="Titulo" className="form-control" value={formulario.Titulo} onChange={manejarCambio} required/></div>
        <div className="mb-3"><label className="form-label">Género</label><select name="Genero" className="form-select" value={formulario.Genero} onChange={manejarCambio} required><option value="">Seleccione un género</option>{generos.map((genero)=><option key={genero} value={genero}>{genero}</option>)}</select></div>
        <div className="mb-3"><label className="form-label">Director</label><select name="Director" className="form-select" value={formulario.Director} onChange={manejarCambio}><option value="">Seleccione un director</option>{directorImportadoNoRegistrado&&<option value={formulario.Director}>{formulario.Director} — Importado desde TMDb</option>}{directores.map((director)=><option key={director.Id} value={director.NombreCompleto}>{director.NombreCompleto}{director.NombreArtistico?` (${director.NombreArtistico})`:""}</option>)}</select>{directorImportadoNoRegistrado&&<small className="text-muted">Este director todavía no está registrado como talento en CineRD.</small>}</div>
        <div className="mb-3"><label className="form-label">Productora</label><input type="text" name="Productora" className="form-control" value={formulario.Productora} onChange={manejarCambio}/></div>
        <div className="mb-3"><label className="form-label">Fecha de estreno</label><input type="date" name="FechaEstreno" className="form-control" value={formulario.FechaEstreno} onChange={manejarCambio} required/></div>
        <div className="mb-3"><label className="form-label">Sinopsis</label><textarea name="Sinopsis" className="form-control" rows="5" maxLength="5000" value={formulario.Sinopsis} onChange={manejarCambio} placeholder="Resumen argumental de la película..."/><div className="form-text">Se muestra en la ficha pública de la película. Puedes editar la información importada desde TMDb.</div></div>
        <div className="mb-3"><label className="form-label">Idioma original</label><select name="IdiomaOriginal" className="form-select" value={formulario.IdiomaOriginal} onChange={manejarCambio}><option value="">Seleccione el idioma original</option>{IDIOMAS.map(([codigo,nombre])=><option key={codigo} value={codigo}>{nombre} ({codigo})</option>)}</select><div className="form-text">TMDb utiliza códigos ISO como es, en o fr.</div></div>
        <div className="mb-3"><label className="form-label">Portada de la película</label><input type="file" name="Foto" className="form-control" accept="image/jpeg,image/png,image/webp" onChange={manejarFoto}/><small className="text-muted">Puedes reemplazar manualmente la portada obtenida desde TMDb.</small></div>

        {vistaPrevia&&<div className="mb-3 text-center"><p className="text-muted mb-2">Vista previa</p><img src={vistaPrevia} alt="Vista previa de la película" className="img-thumbnail" style={{width:"180px",height:"260px",objectFit:"cover"}}/></div>}

        {esEdicion ? <>
          <PeliculaTraduccionesPanel peliculaId={Number(id)} idiomaOriginal={formulario.IdiomaOriginal || "es"} />
          <PeliculaCreditosPanel peliculaId={Number(id)} />
        </> : <div className="alert alert-light border mt-4 mb-0"><strong>🌐 Datos avanzados:</strong> guarda primero la película y luego podrás registrar traducciones y créditos profesionales estructurados desde la pantalla de edición.</div>}

        <div className="d-flex gap-2 flex-wrap mt-4"><button type="submit" className="btn btn-primary">Guardar</button><Link to="/peliculas" className="btn btn-secondary">Cancelar</Link></div>
      </div>
    </form>
  </div>;
}

export default FormularioPelicula;
