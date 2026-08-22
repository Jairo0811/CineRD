import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "../services/api";
import { API_URL } from "../config/api";
import { calcularEdad, calcularEdadAproximada, calcularEdadEnFecha, obtenerAnioFecha } from "../utils/fechas";

const PLACEHOLDER_ACTOR_MASCULINO = "/placeholders/actor-male.png";
const PLACEHOLDER_ACTOR_FEMENINO = "/placeholders/actor-female.png";

const obtenerPlaceholderTalento = (actor) => {
  const profesion = String(actor?.Profesion || "").trim().toLowerCase();
  const sexo = String(actor?.Sexo || "").trim().toLowerCase();

  if (profesion === "actriz" || sexo === "femenino") return PLACEHOLDER_ACTOR_FEMENINO;
  if (profesion === "actor" || sexo === "masculino") return PLACEHOLDER_ACTOR_MASCULINO;

  return null;
};

function Actores() {
  const { t } = useTranslation();
  const [actores, setActores] = useState([]);
  const [buscar, setBuscar] = useState(""); const [orden, setOrden] = useState("az"); const [estado, setEstado] = useState(""); const [anio, setAnio] = useState(""); const [profesion, setProfesion] = useState(""); const [cargando, setCargando] = useState(false);
  const usuario = (() => { try { return JSON.parse(localStorage.getItem("cineRdUsuario") || "null"); } catch { return null; } })();
  const esAdmin = usuario?.rol === "ADMINISTRADOR";

  useEffect(() => { obtenerActores(); }, [buscar, orden, estado, anio, profesion]);
  const obtenerActores = async () => { try { setCargando(true); const response = await api.get("/actores", { params:{buscar,orden,estado,anio,profesion} }); setActores(response.data || []); } catch(error){ console.error(error); } finally { setCargando(false); } };
  const eliminarActor = async (id) => { if (!esAdmin || !window.confirm(t("talents.confirmDelete"))) return; try { await api.delete(`/actores/${id}`); await obtenerActores(); } catch(error){ console.error(error); alert(error.response?.data?.mensaje || t("talents.deleteError")); } };
  const obtenerEdadActor = (actor) => { if(actor.FechaNacimiento){ if(!actor.EstaVivo && actor.FechaFallecimiento) return calcularEdadEnFecha(actor.FechaNacimiento,actor.FechaFallecimiento); return calcularEdad(actor.FechaNacimiento); } if(actor.AnioNacimiento){ const final=!actor.EstaVivo&&actor.FechaFallecimiento?obtenerAnioFecha(actor.FechaFallecimiento):new Date().getFullYear(); return calcularEdadAproximada(actor.AnioNacimiento,final); } return null; };
  const mostrarNacimiento = (actor) => { const edad=obtenerEdadActor(actor); if(actor.FechaNacimiento) return edad!==null?t("talents.age",{age:edad}):t("talents.ageUnavailable"); if(actor.AnioNacimiento) return edad!==null?t("talents.approxAge",{year:actor.AnioNacimiento,age:edad}):String(actor.AnioNacimiento); return t("talents.unknownDate"); };
  const profesionTraducida = (valor) => valor ? t(`professions.${valor}`, { defaultValue: valor }) : t("talents.talent");

  return <div className="table-page-container catalog-page">
    <header className="catalog-hero catalog-hero-talents"><div><span className="catalog-eyebrow">{t("talents.eyebrow")}</span><h1>{t("talents.title")}</h1><p>{t("talents.description")}</p></div><div className="catalog-hero-meta"><strong>{actores.length}</strong><span>{t("talents.found")}</span></div>{esAdmin&&<Link to="/actores/nuevo" className="btn catalog-admin-button">{t("talents.new")}</Link>}</header>
    <section className="catalog-filter-bar talent-filter-bar"><div className="catalog-search"><span>⌕</span><input type="text" placeholder={t("talents.search")} value={buscar} onChange={(e)=>setBuscar(e.target.value)}/></div>
      <select value={profesion} onChange={(e)=>setProfesion(e.target.value)} aria-label={t("talents.profession")}><option value="">{t("talents.allProfessions")}</option>{["Actor","Actriz","Comediante","Director","Productor","Guionista","Cantante","Artista urbano","Artista urbana","Otro"].map(p=><option key={p} value={p}>{profesionTraducida(p)}</option>)}</select>
      <select value={orden} onChange={(e)=>setOrden(e.target.value)} aria-label={t("talents.order")}><option value="az">{t("talents.nameAZ")}</option><option value="za">{t("talents.nameZA")}</option><option value="masPeliculas">{t("talents.moreMovies")}</option><option value="menosPeliculas">{t("talents.fewerMovies")}</option><option value="nacimientoReciente">{t("talents.younger")}</option><option value="nacimientoAntiguo">{t("talents.longerCareer")}</option></select>
      <select value={estado} onChange={(e)=>setEstado(e.target.value)} aria-label={t("talents.status")}><option value="">{t("talents.all")}</option><option value="vivo">{t("talents.livingPlural")}</option><option value="fallecido">{t("talents.deceasedPlural")}</option></select><input className="catalog-year" type="number" placeholder={t("talents.year")} value={anio} onChange={(e)=>setAnio(e.target.value)} aria-label={t("talents.birthYear")}/></section>
    {cargando&&<div className="catalog-loading"><div className="spinner-border" role="status"/><span>{t("talents.loading")}</span></div>}
    {!cargando&&<section className="talent-catalog-grid">{actores.map(actor=>{const placeholder=obtenerPlaceholderTalento(actor);return <article className="cinerd-talent-card" key={actor.Id}><Link to={`/actores/${actor.Id}`} className="cinerd-talent-visual">{actor.Foto?<img src={`${API_URL}${actor.Foto}`} alt={actor.NombreCompleto}/>:placeholder?<img src={placeholder} alt="" className="cinerd-talent-default-photo"/>:<div className="cinerd-talent-placeholder">🎭</div>}<div className="cinerd-talent-gradient"/><span className={`cinerd-status-dot ${actor.EstaVivo?"alive":"deceased"}`}>{actor.EstaVivo?t("talents.alive"):t("talents.inMemoriam")}</span>{actor.EsVerificado&&<span className="cinerd-verified-card-badge">✓ {t("home.verified")}</span>}</Link><div className="cinerd-talent-copy"><span className="cinerd-genre">{profesionTraducida(actor.Profesion)}</span><div className="cinerd-talent-name-row"><h2><Link to={`/actores/${actor.Id}`}>{actor.NombreArtistico||`${actor.Nombres||actor.NombreCompleto||t("talents.unnamed")}${actor.Apellidos?` ${actor.Apellidos}`:""}`}</Link></h2>{actor.EsVerificado&&<span className="cinerd-verified-mark" title={t("talents.verifiedBy")} aria-label={t("talents.verifiedProfile")}>✓</span>}</div>{actor.NombreArtistico&&<small className="cinerd-talent-real-name">{actor.NombreCompleto||`${actor.Nombres||""} ${actor.Apellidos||""}`}</small>}<div className="cinerd-talent-facts"><span>🎬 {t("talents.moviesCount",{count:actor.CantidadPeliculas||0})}</span>{Number(actor.CantidadPeliculasDirigidas||0)>0&&<span>🎥 {t("talents.directedMoviesCount",{count:actor.CantidadPeliculasDirigidas})}</span>}<span>🎂 {mostrarNacimiento(actor)}</span></div><Link to={`/actores/${actor.Id}`} className="cinerd-profile-link">{t("talents.viewFilmography")} <span>→</span></Link></div>{esAdmin&&<div className="cinerd-admin-strip"><Link to={`/actores/editar/${actor.Id}`}>{t("talents.edit")}</Link><button type="button" onClick={()=>eliminarActor(actor.Id)}>{t("talents.delete")}</button></div>}</article>})}</section>}
    {!cargando&&actores.length===0&&<div className="catalog-empty"><span>🎭</span><h2>{t("talents.emptyTitle")}</h2><p>{t("talents.emptyDescription")}</p></div>}
  </div>;
}
export default Actores;