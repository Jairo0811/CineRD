import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "../services/api";
import { API_URL } from "../config/api";
import { manejarErrorFotoTalento, obtenerFotoTalento } from "../utils/talentoPlaceholder";
import MusicaPelicula from "../components/peliculas/MusicaPelicula";
import { anioDe, decadaDe } from "../data/historiaCine";
import { getEditorialPelicula } from "../data/editorialPeliculas";
import PosterOriginal from "../components/media/PosterOriginal";
import FilmSectionHeading from "../components/peliculas/FilmSectionHeading";

const resolverImagen = (ruta) => !ruta ? null : ruta.startsWith("http") ? ruta : `${API_URL}${ruta}`;
const formatearDuracion = (minutos) => !minutos ? null : `${Math.floor(minutos / 60) ? `${Math.floor(minutos / 60)} h ` : ""}${minutos % 60} min`;
const obtenerYoutubeId = (url) => { if (!url) return null; try { const u=new URL(url); if(u.hostname.includes("youtu.be"))return u.pathname.replace("/",""); if(u.hostname.includes("youtube.com"))return u.searchParams.get("v")||u.pathname.split("/").pop(); } catch { return null; } return null; };
const ETIQUETAS_CREDITO={DIRECTOR:"Dirección",ACTOR:"Interpretación",DIRECTOR_CASTING:"Director de casting",PRODUCTOR:"Producción",GUIONISTA:"Guion",COMPOSITOR:"Música",FOTOGRAFIA:"Fotografía",EDICION:"Edición",OTRO:"Otro crédito"};

function PerfilPelicula(){
 const{id}=useParams();const{t,i18n}=useTranslation();const[pelicula,setPelicula]=useState(null),[reparto,setReparto]=useState([]),[creditos,setCreditos]=useState([]),[nominaciones,setNominaciones]=useState([]),[galeria,setGaleria]=useState([]),[cargando,setCargando]=useState(true),[error,setError]=useState("");
 const usuario=(()=>{try{return JSON.parse(localStorage.getItem("cineRdUsuario")||"null");}catch{return null;}})();const esAdmin=usuario?.rol==="ADMINISTRADOR",esTalentoVerificado=usuario?.rol==="TALENTO_VERIFICADO",idiomaUi=i18n.language?.startsWith("en")?"en":"es",locale=idiomaUi==="en"?"en-US":"es-DO";
 useEffect(()=>{setCargando(true);setError("");Promise.all([api.get(`/peliculas/${id}/perfil`,{params:{lang:idiomaUi}}),api.get(`/actores-peliculas/pelicula/${id}`),api.get(`/peliculas/${id}/creditos`),api.get("/premios/nominaciones",{params:{peliculaId:id}}),api.get("/galeria",{params:{peliculaId:id}})]).then(([p,r,c,n,g])=>{setPelicula(p.data);setReparto(r.data||[]);setCreditos(c.data||[]);setNominaciones(n.data||[]);setGaleria(g.data||[]);}).catch(e=>{console.error(e);setError(e.response?.data?.mensaje||t("movieProfile.loadError"));}).finally(()=>setCargando(false));},[id,idiomaUi,t]);
 const[todas,setTodas]=useState([]);useEffect(()=>{let activo=true;api.get("/peliculas").then(r=>{if(activo)setTodas(r.data||[]);}).catch(()=>{});return()=>{activo=false;};},[]);
 const anioPelicula=anioDe(pelicula?.FechaEstreno),decadaPelicula=decadaDe(anioPelicula);const mismaDecada=useMemo(()=>decadaPelicula?todas.filter(p=>p.Id!==Number(id)&&decadaDe(anioDe(p.FechaEstreno))===decadaPelicula).sort((a,b)=>Math.abs(anioDe(a.FechaEstreno)-anioPelicula)-Math.abs(anioDe(b.FechaEstreno)-anioPelicula)).slice(0,8).sort((a,b)=>String(a.FechaEstreno).localeCompare(String(b.FechaEstreno))):[],[todas,decadaPelicula,anioPelicula,id]);
 const repartoOrdenado=useMemo(()=>[...reparto].sort((a,b)=>(a.OrdenCreditos??9999)-(b.OrdenCreditos??9999)),[reparto]);const creditosOrdenados=useMemo(()=>[...creditos].sort((a,b)=>(a.Orden??9999)-(b.Orden??9999)),[creditos]);const youtubeId=useMemo(()=>obtenerYoutubeId(pelicula?.TrailerUrl),[pelicula?.TrailerUrl]);
 const formatearFechaLocal=fecha=>{if(!fecha)return t("movieProfile.noDate");const v=new Date(`${String(fecha).substring(0,10)}T12:00:00`);return Number.isNaN(v.getTime())?t("movieProfile.noDate"):new Intl.DateTimeFormat(locale,{day:"numeric",month:"long",year:"numeric"}).format(v);};const formatearDinero=v=>v==null?null:new Intl.NumberFormat(locale,{style:"currency",currency:"USD",maximumFractionDigits:0}).format(v);const obtenerIdioma=c=>{if(!c)return t("languages.unknown");const n=c.toLowerCase(),k=`languages.${n}`,tr=t(k);return tr===k?c.toUpperCase():tr;};
 if(cargando)return <div className="film-state"><div className="spinner-border" role="status"/><p>{t("movieProfile.loading")}</p></div>;
 if(error||!pelicula)return <div className="film-state"><div className="alert alert-danger">{error||t("movieProfile.notFound")}</div><Link to="/peliculas" className="btn btn-primary">{t("movieProfile.backToMovies")}</Link></div>;
 const backdrop=resolverImagen(pelicula.Backdrop),poster=resolverImagen(pelicula.Foto),tituloFueLocalizado=pelicula.TraduccionAplicada&&pelicula.TituloOriginal&&pelicula.TituloOriginal!==pelicula.Titulo;
 const hechos=[
  [t("movieProfile.director"),pelicula.Director||t("movieProfile.notRegistered")],
  [t("movieProfile.productionCompany"),pelicula.Productora||t("movieProfile.notRegisteredFemale")],
  [t("movieProfile.originalLanguage"),obtenerIdioma(pelicula.IdiomaOriginal)],
  pelicula.DuracionMinutos?[t("movieProfile.runtime",{defaultValue:idiomaUi==="en"?"Runtime":"Duración"}),formatearDuracion(pelicula.DuracionMinutos)]:null,
  pelicula.Presupuesto!=null?[t("movieProfile.budget"),formatearDinero(pelicula.Presupuesto)]:null,
  pelicula.Recaudacion!=null?[t("movieProfile.revenue"),formatearDinero(pelicula.Recaudacion)]:null,
 ].filter(Boolean);
 const premiosGanados=nominaciones.filter(n=>n.Resultado==="GANADOR").length;
 const fondo=backdrop||poster;
 const editorial=getEditorialPelicula(pelicula);
 const editorialIdioma=editorial?.[idiomaUi];
 return <div className="table-page-container movie-profile-page film-page">
 <header className={`film-hero${backdrop?" has-backdrop":""}`}>
  {fondo&&<img className="film-hero-bg" src={fondo} alt="" aria-hidden="true"/>}
  {!backdrop&&anioPelicula&&<span className="film-hero-year" aria-hidden="true">{anioPelicula}</span>}
  <div className="film-hero-top"><Link to="/peliculas" className="film-back">{t("movieProfile.back")}</Link>
   {(esAdmin||esTalentoVerificado)&&<div className="film-hero-actions">{esAdmin&&<><Link to={`/peliculas/editar/${pelicula.Id}`}>{t("movieProfile.edit")}</Link><Link to={`/peliculas/${pelicula.Id}/reparto`}>{t("movieProfile.manageCast")}</Link><Link to={`/peliculas/${pelicula.Id}/creditos`}>🎬 Créditos</Link><Link to="/admin/premios">🏆 Premios</Link><Link to="/admin/galeria">🖼️ Galería</Link></>}{esTalentoVerificado&&<Link to={`/mi-perfil/reclamar-credito?pelicula=${pelicula.Id}`}>➕ Reclamar participación</Link>}</div>}
  </div>
  <div className="film-hero-body">
   <div className="film-poster">{poster?<img src={poster} alt={pelicula.Titulo}/>:<PosterOriginal peliculaId={pelicula.Id} titulo={pelicula.Titulo} anio={anioPelicula} idioma={idiomaUi} />}</div>
   <div className="film-hero-copy">
    <span className="public-eyebrow">{t("movieProfile.dominicanCinema")}{anioPelicula?` · ${anioPelicula}`:""}</span>
    <h1>{pelicula.Titulo}</h1>
    {tituloFueLocalizado&&<p className="film-original"><strong>{t("movieProfile.originalTitle")}:</strong> <em>{pelicula.TituloOriginal}</em></p>}
    {pelicula.Eslogan&&<p className="film-tagline">“{pelicula.Eslogan}”</p>}
    <ul className="film-chips">
     <li>{pelicula.Genero||t("movieProfile.noGenre")}</li>
     <li>{formatearFechaLocal(pelicula.FechaEstreno)}</li>
     {decadaPelicula&&<li><Link to={`/peliculas?decada=${decadaPelicula}`}>{decadaPelicula}s</Link></li>}
     {pelicula.Calificacion!=null&&<li className="is-rating">★ {Number(pelicula.Calificacion).toFixed(1)}/10</li>}
     <li>{t("movieProfile.talents",{count:reparto.length})}</li>
     {premiosGanados>0&&<li className="is-award">🏆 {premiosGanados}</li>}
     {galeria.length>0&&<li>🖼️ {galeria.length}</li>}
     {pelicula.Estado&&<li>{pelicula.Estado}</li>}
    </ul>
   </div>
  </div>
  <div className="film-hero-strip" aria-hidden="true"/>
 </header>

 <section className="film-section film-overview">
  <div className="film-synopsis"><span className="catalog-eyebrow">{t("movieProfile.history")}</span><h2>{t("movieProfile.synopsis")}</h2><p style={{whiteSpace:"pre-line"}}>{pelicula.Sinopsis||t("movieProfile.synopsisMissing")}</p>{pelicula.TraduccionAplicada&&<p className="film-note">{t("movieProfile.localizedNotice",{source:t(`translationSources.${pelicula.TipoFuenteTraduccion||"EDITORIAL"}`)})}</p>}</div>
  <dl className="film-facts">{hechos.map(([k,v])=><div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
 </section>

 {editorial&&editorialIdioma&&<section className="film-section film-editorial" aria-labelledby="film-editorial-title">
   <header className="film-section-head"><div>
     <span className="catalog-eyebrow">{idiomaUi==="en"?"CONTEXT & FILM HISTORY":"CONTEXTO E HISTORIA DEL CINE"}</span>
     <h2 id="film-editorial-title">{editorialIdioma.titulo}</h2>
   </div></header>
   <div className="film-editorial-prose">{editorialIdioma.parrafos.map((texto,i)=><p key={i}>{texto}</p>)}</div>
   <div className="film-editorial-sources">
     <h3>{idiomaUi==="en"?"References":"Fuentes y lecturas complementarias"}</h3>
     <ul>{editorial.fuentes.map(f=><li key={f.url}><a href={f.url} target="_blank" rel="noopener noreferrer">{f.titulo}</a></li>)}</ul>
     <p className="film-editorial-status">{idiomaUi==="en"?"Source-based editorial draft; final owner review pending.":"Borrador editorial basado en fuentes; pendiente de revisión final del titular."}</p>
   </div>
 </section>}

 {(youtubeId||pelicula.TrailerUrl)&&<section className="film-section"><FilmSectionHeading eyebrow={t("movieProfile.audiovisual")} title={t("movieProfile.trailer")} />{youtubeId?<div className="ratio ratio-16x9 film-trailer"><iframe src={`https://www.youtube.com/embed/${youtubeId}`} title={`${t("movieProfile.trailer")}: ${pelicula.Titulo}`} allowFullScreen/></div>:<a href={pelicula.TrailerUrl} target="_blank" rel="noreferrer" className="btn btn-danger">{t("movieProfile.watchTrailer")}</a>}</section>}

 <section className="film-section"><header className="film-section-head"><div><span className="catalog-eyebrow">{t("movieProfile.cast")}</span><h2>{t("movieProfile.talentsCharacters")}</h2></div>{esAdmin&&<Link to={`/peliculas/${pelicula.Id}/reparto`} className="film-link">{t("movieProfile.manageCast")}</Link>}</header>
  {repartoOrdenado.length===0?<p className="film-empty">{t("movieProfile.emptyCast")}</p>:<ul className="film-people">{repartoOrdenado.map(a=><li key={a.Id}><Link to={`/actores/${a.Id}`} className="film-person"><img src={obtenerFotoTalento(a)} onError={e=>manejarErrorFotoTalento(e,a.Sexo)} alt={a.NombreCompleto} loading="lazy"/><div><strong>{a.NombreArtistico||a.NombreCompleto}</strong><span>{a.Personaje||t("movieProfile.characterMissing")}</span><small className={`film-tag${/principal/i.test(a.TipoParticipacion||"")?" is-lead":""}`}>{a.TipoParticipacion||t("movieProfile.castRole")}</small></div></Link></li>)}</ul>}
 </section>

 {creditosOrdenados.length>0&&<section className="film-section"><FilmSectionHeading eyebrow="CRÉDITOS" title="Créditos profesionales" /><ul className="film-people">{creditosOrdenados.map(c=><li key={c.Id}><Link to={`/actores/${c.ActorId}`} className="film-person"><img src={obtenerFotoTalento(c)} onError={e=>manejarErrorFotoTalento(e,c.Sexo)} alt={c.NombreArtistico||c.NombreCompleto} loading="lazy"/><div><strong>{c.NombreArtistico||c.NombreCompleto}</strong><span>{ETIQUETAS_CREDITO[c.TipoCredito]||c.TipoCredito}{c.Personaje?` · ${c.Personaje}`:""}</span>{Boolean(c.CreditoVerificado)&&<small className="film-tag is-verified">✓ {c.FuenteCredito==="RECLAMACION_TALENTO"?"Participación verificada":"Crédito verificado"}</small>}</div></Link></li>)}</ul><p className="film-note">Una “participación verificada” indica que CineRD revisó evidencia. No implica necesariamente que el nombre figure en los créditos oficiales de la obra.</p></section>}

 {nominaciones.length>0&&<section className="film-section"><FilmSectionHeading eyebrow="RECONOCIMIENTOS" title="🏆 Premios y nominaciones" /><ul className="film-awards">{nominaciones.map(n=><li key={n.Id}><div><strong>{n.Premio}</strong><span>{n.Categoria} · {n.Anio}</span></div><small className={`film-tag${n.Resultado==="GANADOR"?" is-award":""}`}>{n.Resultado==="GANADOR"?"🏆 Ganador":"Nominado"}</small>{n.Detalle&&<p>{n.Detalle}</p>}{n.FuenteUrl&&<a href={n.FuenteUrl} target="_blank" rel="noreferrer noopener">Fuente ↗</a>}</li>)}</ul></section>}

 {galeria.length>0&&<section className="film-section"><FilmSectionHeading eyebrow="ARCHIVO VISUAL" title="🖼️ Galería multimedia" /><ul className="film-gallery">{galeria.map(g=><li key={g.Id}><a href={resolverImagen(g.Archivo)} target="_blank" rel="noreferrer"><img src={resolverImagen(g.Archivo)} alt={g.Titulo||pelicula.Titulo} loading="lazy"/><div><strong>{g.Titulo||"Imagen de archivo"}{g.EsDestacada&&" ⭐"}</strong><small>{g.Tipo.replaceAll("_"," ")}</small>{g.Descripcion&&<p>{g.Descripcion}</p>}</div></a></li>)}</ul></section>}

 <MusicaPelicula peliculaId={pelicula.Id}/>

 {mismaDecada.length>0&&<section className="film-section same-decade"><span className="catalog-eyebrow">{t("movieProfile.contextEyebrow")}</span><div className="same-decade-head"><h2>{t("movieProfile.sameDecadeTitle")} · {decadaPelicula}s</h2><Link to={`/peliculas?decada=${decadaPelicula}`}>{t("movieProfile.viewDecade")}</Link></div><ul className="same-decade-row">{mismaDecada.map(p=><li key={p.Id}><Link to={`/peliculas/${p.Id}`} title={p.Titulo}>{p.Foto?<img src={resolverImagen(p.Foto)} alt={p.Titulo} loading="lazy"/>:<span>{p.Titulo}</span>}<small>{anioDe(p.FechaEstreno)}</small></Link></li>)}</ul></section>}
 </div>;
}
export default PerfilPelicula;