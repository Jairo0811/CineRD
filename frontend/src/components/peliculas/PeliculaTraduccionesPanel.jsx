import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";

const PLANTILLA = {
  Titulo: "",
  Sinopsis: "",
  Eslogan: "",
  TipoFuente: "EDITORIAL",
  FuenteReferencia: "",
};

function PeliculaTraduccionesPanel({ peliculaId, idiomaOriginal = "es" }) {
  const [traduccion, setTraduccion] = useState(PLANTILLA);
  const [contenidoOriginal, setContenidoOriginal] = useState({ Titulo: "", Sinopsis: "" });
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const idiomaDestino = useMemo(() => (idiomaOriginal?.toLowerCase() === "en" ? "es" : "en"), [idiomaOriginal]);
  const nombreIdioma = idiomaDestino === "en" ? "Inglés" : "Español";
  const nombreIdiomaOriginal = idiomaOriginal?.toLowerCase() === "en" ? "Inglés" : "Español";

  useEffect(() => {
    let activo = true;
    const cargar = async () => {
      try {
        setCargando(true);
        setMensaje("");
        const [{ data: traducciones }, { data: pelicula }] = await Promise.all([
          api.get(`/peliculas/${peliculaId}/traducciones`),
          api.get(`/peliculas/${peliculaId}`),
        ]);
        const existente = (traducciones || []).find((item) => item.Idioma === idiomaDestino);
        if (!activo) return;
        setContenidoOriginal({
          Titulo: pelicula?.Titulo || "",
          Sinopsis: pelicula?.Sinopsis || "",
        });
        setTraduccion(existente ? {
          Titulo: existente.Titulo || "",
          Sinopsis: existente.Sinopsis || "",
          Eslogan: existente.Eslogan || "",
          TipoFuente: existente.TipoFuente || "EDITORIAL",
          FuenteReferencia: existente.FuenteReferencia || "",
        } : PLANTILLA);
      } catch (error) {
        console.error("Error al cargar traducciones:", error);
        if (activo) setMensaje(error.response?.data?.mensaje || "No fue posible cargar la traducción.");
      } finally {
        if (activo) setCargando(false);
      }
    };
    cargar();
    return () => { activo = false; };
  }, [peliculaId, idiomaDestino]);

  const cambiar = (e) => {
    const { name, value } = e.target;
    setTraduccion((actual) => ({ ...actual, [name]: value }));
  };

  const guardar = async () => {
    if (!traduccion.Titulo.trim() && !traduccion.Sinopsis.trim() && !traduccion.Eslogan.trim()) {
      setMensaje("Registra al menos el título, la sinopsis o el eslogan traducido.");
      return;
    }

    try {
      setGuardando(true);
      setMensaje("");
      await api.put(`/peliculas/${peliculaId}/traducciones/${idiomaDestino}`, {
        Titulo: traduccion.Titulo.trim() || null,
        Sinopsis: traduccion.Sinopsis.trim() || null,
        Eslogan: traduccion.Eslogan.trim() || null,
        TipoFuente: traduccion.TipoFuente,
        FuenteReferencia: traduccion.FuenteReferencia.trim() || null,
      });
      setMensaje(`Traducción en ${nombreIdioma} guardada correctamente.`);
    } catch (error) {
      console.error("Error al guardar traducción:", error);
      setMensaje(error.response?.data?.mensaje || "No fue posible guardar la traducción.");
    } finally {
      setGuardando(false);
    }
  };

  return <section className="movie-translation-panel mt-4">
    <div className="movie-translation-header">
      <div>
        <span>🌐 Internacionalización editorial</span>
        <h3>Contenido original y versión en {nombreIdioma}</h3>
        <p>El contenido original se conserva como referencia canónica. Solo registra títulos oficiales, de distribución o traducciones editoriales revisadas.</p>
      </div>
      <span className="movie-translation-language">{idiomaDestino.toUpperCase()}</span>
    </div>

    {cargando ? <div className="py-4 text-center text-muted">Cargando traducción...</div> : <div className="movie-translation-body">
      <div className="card border mb-4">
        <div className="card-body">
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
            <div>
              <span className="catalog-eyebrow">CONTENIDO ORIGINAL</span>
              <h4 className="h6 fw-bold mb-0">{nombreIdiomaOriginal} · {String(idiomaOriginal || "es").toUpperCase()}</h4>
            </div>
            <span className="badge bg-secondary">Canónico</span>
          </div>
          <div className="mb-3">
            <label className="form-label">Título original</label>
            <input className="form-control" value={contenidoOriginal.Titulo || "Sin título registrado"} readOnly />
          </div>
          <div>
            <label className="form-label">Sinopsis original</label>
            <textarea className="form-control" rows="4" value={contenidoOriginal.Sinopsis || "Sin sinopsis registrada"} readOnly />
          </div>
        </div>
      </div>

      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <div>
          <span className="catalog-eyebrow">VERSIÓN INTERNACIONAL</span>
          <h4 className="h6 fw-bold mb-0">{nombreIdioma} · {idiomaDestino.toUpperCase()}</h4>
        </div>
        {traduccion.Sinopsis.trim() || traduccion.Titulo.trim() || traduccion.Eslogan.trim()
          ? <span className="badge bg-success">✓ Traducción registrada</span>
          : <span className="badge bg-light text-dark border">Pendiente</span>}
      </div>

      <div className="mb-3">
        <label className="form-label">Título localizado</label>
        <input className="form-control" name="Titulo" value={traduccion.Titulo} onChange={cambiar} placeholder={`Título público en ${nombreIdioma}`} />
        <div className="form-text">Si no existe un título oficial o revisado, déjalo vacío y CineRD mostrará el título original.</div>
      </div>

      <div className="mb-3">
        <label className="form-label">Sinopsis localizada</label>
        <textarea className="form-control" rows="6" name="Sinopsis" value={traduccion.Sinopsis} onChange={cambiar} maxLength="5000" placeholder={`Sinopsis en ${nombreIdioma}`} />
      </div>

      <div className="mb-3">
        <label className="form-label">Eslogan localizado</label>
        <input className="form-control" name="Eslogan" value={traduccion.Eslogan} onChange={cambiar} maxLength="300" placeholder="Eslogan o tagline" />
      </div>

      <div className="row g-3">
        <div className="col-12 col-md-5">
          <label className="form-label">Procedencia</label>
          <select className="form-select" name="TipoFuente" value={traduccion.TipoFuente} onChange={cambiar}>
            <option value="OFICIAL">Oficial</option>
            <option value="DISTRIBUCION">Distribución</option>
            <option value="EDITORIAL">Editorial CineRD</option>
          </select>
        </div>
        <div className="col-12 col-md-7">
          <label className="form-label">Fuente / referencia</label>
          <input className="form-control" name="FuenteReferencia" value={traduccion.FuenteReferencia} onChange={cambiar} maxLength="500" placeholder="Sitio oficial, distribuidor o referencia editorial" />
        </div>
      </div>

      {traduccion.TipoFuente === "EDITORIAL" && <div className="alert alert-primary mt-3 mb-0">
        <strong>✓ Revisión editorial CineRD.</strong> Esta versión se presentará públicamente como una traducción revisada por CineRD, no como un título oficial de distribución.
      </div>}

      {mensaje && <div className={`alert mt-3 mb-0 ${mensaje.includes("correctamente") ? "alert-success" : "alert-info"}`}>{mensaje}</div>}

      <div className="mt-3 d-flex justify-content-end">
        <button type="button" className="btn btn-outline-primary" onClick={guardar} disabled={guardando}>
          {guardando ? "Guardando..." : `Guardar traducción ${idiomaDestino.toUpperCase()}`}
        </button>
      </div>
    </div>}
  </section>;
}

export default PeliculaTraduccionesPanel;
