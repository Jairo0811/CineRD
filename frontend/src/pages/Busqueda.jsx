import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "../services/api";
import { API_URL } from "../config/api";
import { manejarErrorFotoTalento, obtenerFotoTalento } from "../utils/talentoPlaceholder";

const resolverImagen = (ruta) => !ruta ? null : ruta.startsWith("http") ? ruta : `${API_URL}${ruta}`;

function Busqueda() {
  const { i18n } = useTranslation();
  const [params, setParams] = useSearchParams();
  const idioma = i18n.language?.startsWith("en") ? "en" : "es";
  const [termino, setTermino] = useState(params.get("q") || "");
  const [resultados, setResultados] = useState({ peliculas: [], talentos: [] });
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  const copy = idioma === "en" ? {
    eyebrow: "DISCOVER · CINERD", title: "Search the Dominican film archive", placeholder: "Movie, talent, director, production company...",
    action: "Search", movies: "Movies", talents: "Talents", empty: "No matches found.", hint: "Enter at least 2 characters to search.",
  } : {
    eyebrow: "DESCUBRIR · CINERD", title: "Buscar en el archivo cinematográfico dominicano", placeholder: "Película, talento, director, productora...",
    action: "Buscar", movies: "Películas", talents: "Talentos", empty: "No se encontraron coincidencias.", hint: "Escribe al menos 2 caracteres para buscar.",
  };

  const buscar = async (valor) => {
    const q = valor.trim();
    if (q.length < 2) {
      setResultados({ peliculas: [], talentos: [] });
      return;
    }
    try {
      setCargando(true);
      setError("");
      const { data } = await api.get("/busqueda", { params: { q } });
      setResultados(data || { peliculas: [], talentos: [] });
    } catch (e) {
      console.error(e);
      setError(e.response?.data?.mensaje || "Error");
    } finally { setCargando(false); }
  };

  useEffect(() => { buscar(params.get("q") || ""); }, [params]);

  const enviar = (e) => {
    e.preventDefault();
    const q = termino.trim();
    if (q.length >= 2) setParams({ q });
  };

  const total = resultados.peliculas.length + resultados.talentos.length;

  return <div className="global-search-page">
    <section className="global-search-hero">
      <span>{copy.eyebrow}</span>
      <h1>{copy.title}</h1>
      <form onSubmit={enviar} className="global-search-form">
        <input value={termino} onChange={(e)=>setTermino(e.target.value)} placeholder={copy.placeholder} autoFocus />
        <button type="submit">🔎 {copy.action}</button>
      </form>
      {termino.trim().length < 2 && <small>{copy.hint}</small>}
    </section>

    {error && <div className="alert alert-danger">{error}</div>}
    {cargando ? <div className="py-5 text-center">Cargando...</div> : params.get("q") && total === 0 ? <div className="global-search-empty">{copy.empty}</div> : <>
      {resultados.peliculas.length > 0 && <section className="global-search-section">
        <h2>{copy.movies}</h2>
        <div className="global-search-grid">{resultados.peliculas.map((p)=><Link key={p.Id} to={`/peliculas/${p.Id}`} className="global-search-result">
          {resolverImagen(p.Foto) ? <img src={resolverImagen(p.Foto)} alt={p.Titulo} /> : <div className="global-search-placeholder">🎬</div>}
          <div><strong>{p.Titulo}</strong><span>{[p.Genero,p.Director,p.Productora].filter(Boolean).join(" · ")}</span></div>
        </Link>)}</div>
      </section>}

      {resultados.talentos.length > 0 && <section className="global-search-section">
        <h2>{copy.talents}</h2>
        <div className="global-search-grid">{resultados.talentos.map((a)=><Link key={a.Id} to={`/actores/${a.Id}`} className="global-search-result">
          <img src={obtenerFotoTalento(a)} alt={a.NombreArtistico || a.NombreCompleto} onError={(e)=>manejarErrorFotoTalento(e,a.Sexo)} />
          <div><strong>{a.NombreArtistico || a.NombreCompleto}</strong><span>{a.Profesion || "Talento"}</span></div>
        </Link>)}</div>
      </section>}
    </>}
  </div>;
}

export default Busqueda;
