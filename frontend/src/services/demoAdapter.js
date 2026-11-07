// Adaptador de solo lectura para publicar una demo estática CineRD sin Express ni SQL Server.
// No simula escritura ni autenticación. Los premios y la galería se leen
// exclusivamente del snapshot público versionado (nunca de datos privados).
let catalogPromise;

const value = x => String(x ?? '').trim();
const norm = x => value(x).toLocaleLowerCase('es');
const includes = (x, q) => norm(x).includes(norm(q));
const byName = (a, b) => value(a).localeCompare(value(b), 'es');
const byDate = x => Date.parse(x?.FechaEstreno ?? '') || 0;

function errorResponse(message, status, config) {
  const error = new Error(message);
  error.response = { status, data: { mensaje: message }, config, headers: {} };
  error.config = config;
  return error;
}

async function getCatalog() {
  if (!catalogPromise) {
    catalogPromise = fetch('/demo/catalog.json')
      .then(response => {
        if (!response.ok) throw new Error(`No se encontró el catálogo de demo (HTTP ${response.status})`);
        return response.json();
      })
      .then(data => {
        if (data.format !== 'CineRD.PublicDemoCatalog' || !data.tables) {
          throw new Error('Catálogo de demo inválido. Ejecuta prepareNetlifyDemo.mjs antes de compilar.');
        }
        return data.tables;
      })
      .catch(error => { catalogPromise = null; throw error; });
  }
  return catalogPromise;
}

function getData(t, route, p, config) {
  const actores = t.Actores || [];
  const peliculas = t.Peliculas || [];
  const relaciones = t.ActoresPeliculas || [];
  const creditos = t.PeliculaCreditos || [];
  const traducciones = t.PeliculaTraducciones || [];
  const premios = t.Premios || [];
  const nominaciones = t.Nominaciones || [];
  const galeria = t.GaleriaMultimedia || [];
  const relationCountMovie = id => relaciones.filter(r => Number(r.PeliculaId) === Number(id)).length;
  const relationCountActor = id => relaciones.filter(r => Number(r.ActorId) === Number(id)).length;
  const film = x => ({ ...x, CantidadActores: relationCountMovie(x.Id) });
  const actor = x => ({
    ...x,
    EsVerificado: false, // Las verificaciones de usuarios no se exportan al catálogo público.
    CantidadPeliculas: relationCountActor(x.Id),
    CantidadPeliculasDirigidas: peliculas.filter(m =>
      norm(m.Director) === norm(x.NombreCompleto) ||
      (x.NombreArtistico && norm(m.Director) === norm(x.NombreArtistico))
    ).length,
  });
  const filmById = id => peliculas.find(x => Number(x.Id) === Number(id));
  const actorById = id => actores.find(x => Number(x.Id) === Number(id));
  const descending = (a,b) => byDate(b)-byDate(a);
  const galeriaOrdenada = (a,b) => Number(Boolean(b.EsDestacada)) - Number(Boolean(a.EsDestacada)) ||
    Number(a.Orden ?? 2147483647) - Number(b.Orden ?? 2147483647) || Number(b.Id) - Number(a.Id);
  const tiposMusica = new Set(['TEMA_OFICIAL','CANCION_ORIGINAL','BANDA_SONORA','SCORE']);
  const tiposExternos = new Set([...tiposMusica, 'TRAILER']);

  if (route === '/actores-peliculas/debuts') {
    // Mostrar solo créditos marcados como debut; no inferir desde el año más antiguo.
    return relaciones
      .filter(r => norm(r.TipoParticipacion) === 'debut cinematográfico')
      .map(r => {
        const a = actorById(r.ActorId);
        const m = filmById(r.PeliculaId);
        if (!a || !m) return null;
        return {
          ActorId: a.Id,
          NombreCompleto: a.NombreCompleto,
          NombreArtistico: a.NombreArtistico,
          Sexo: a.Sexo,
          FotoTalento: a.Foto,
          PeliculaId: m.Id,
          PeliculaTitulo: m.Titulo,
          FechaEstreno: m.FechaEstreno,
          PeliculaFoto: m.Foto,
          Personaje: r.Personaje,
        };
      })
      .filter(Boolean)
      .sort((a,b) => byDate(b) - byDate(a) ||
        byName(a.NombreCompleto, b.NombreCompleto) ||
        Number(a.PeliculaId) - Number(b.PeliculaId))
      .slice(0, 8);
  }

  if (route === '/premios') {
    return premios.map(premio => {
      const delPremio = nominaciones.filter(n => Number(n.PremioId) === Number(premio.Id));
      return { ...premio, CantidadNominaciones: delPremio.length, CantidadGanadores: delPremio.filter(n => n.Resultado === 'GANADOR').length };
    }).sort((a,b) => byName(a.Nombre,b.Nombre));
  }

  if (route === '/premios/nominaciones') {
    return nominaciones.filter(n =>
      (!p.peliculaId || Number(n.PeliculaId) === Number(p.peliculaId)) &&
      (!p.actorId || Number(n.ActorId) === Number(p.actorId)) &&
      (!p.premioId || Number(n.PremioId) === Number(p.premioId)) &&
      (!p.anio || Number(n.Anio) === Number(p.anio)) &&
      (!p.resultado || norm(n.Resultado) === norm(p.resultado))
    ).map(n => {
      const premio = premios.find(x => Number(x.Id) === Number(n.PremioId));
      return {
        ...n, Premio: premio?.Nombre ?? null, Organizacion: premio?.Organizacion ?? null,
        Pelicula: filmById(n.PeliculaId)?.Titulo ?? null,
        Talento: actorById(n.ActorId)?.NombreArtistico || actorById(n.ActorId)?.NombreCompleto || null,
      };
    }).sort((a,b) => Number(b.Anio) - Number(a.Anio) || byName(a.Premio,b.Premio) || byName(a.Categoria,b.Categoria));
  }

  const premioMatch = route.match(/^\/premios\/(\d+)$/);
  if (premioMatch) {
    const premio = premios.find(x => Number(x.Id) === Number(premioMatch[1]));
    if (!premio) throw errorResponse('Premio no encontrado',404,config);
    return premio;
  }

  if (route === '/galeria') {
    return galeria.filter(g => {
      if (p.peliculaId && Number(g.PeliculaId) !== Number(p.peliculaId)) return false;
      if (p.actorId && Number(g.ActorId) !== Number(p.actorId)) return false;
      if (p.tipo && norm(g.Tipo) !== norm(p.tipo)) return false;
      if (norm(p.musica) === 'true' && !tiposMusica.has(g.Tipo)) return false;
      if (p.peliculaId && norm(p.incluirExternos) !== 'true' && tiposExternos.has(g.Tipo)) return false;
      return true;
    }).map(g => ({
      ...g,
      Pelicula: filmById(g.PeliculaId)?.Titulo ?? null,
      Talento: actorById(g.ActorId)?.NombreArtistico || actorById(g.ActorId)?.NombreCompleto || null,
    })).sort(galeriaOrdenada);
  }

  if (route === '/peliculas') {
    let list = peliculas.map(film);
    if (p.buscar) list = list.filter(m => [m.Titulo, m.Director, m.Productora].some(v => includes(v, p.buscar)));
    if (p.genero) list = list.filter(m => norm(m.Genero) === norm(p.genero));
    const s = p.orden;
    list.sort(s === 'estrenoAsc' ? (a,b)=>byDate(a)-byDate(b) :
      s === 'az' ? (a,b)=>byName(a.Titulo,b.Titulo) :
      s === 'za' ? (a,b)=>byName(b.Titulo,a.Titulo) :
      s === 'masActores' ? (a,b)=>b.CantidadActores-a.CantidadActores || byName(a.Titulo,b.Titulo) :
      s === 'menosActores' ? (a,b)=>a.CantidadActores-b.CantidadActores || byName(a.Titulo,b.Titulo) : descending);
    return list;
  }

  if (route === '/actores') {
    let list = actores.map(actor);
    if (p.buscar) list = list.filter(a => [a.Nombres,a.Apellidos,a.NombreCompleto,a.NombreArtistico,a.Profesion].some(v => includes(v,p.buscar)));
    if (p.estado === 'vivo') list = list.filter(a => Boolean(a.EstaVivo));
    if (p.estado === 'fallecido') list = list.filter(a => !a.EstaVivo);
    if (p.anio) list = list.filter(a => Number((a.FechaNacimiento || '').slice(0,4) || a.AnioNacimiento) === Number(p.anio));
    if (p.profesion) list = list.filter(a => includes(a.Profesion,p.profesion));
    const bYear = a => Number((a.FechaNacimiento || '').slice(0,4) || a.AnioNacimiento) || 0;
    list.sort(p.orden === 'za' ? (a,b)=>byName(b.NombreCompleto,a.NombreCompleto) :
      p.orden === 'masPeliculas' ? (a,b)=>b.CantidadPeliculas-a.CantidadPeliculas || byName(a.NombreCompleto,b.NombreCompleto) :
      p.orden === 'menosPeliculas' ? (a,b)=>a.CantidadPeliculas-b.CantidadPeliculas || byName(a.NombreCompleto,b.NombreCompleto) :
      p.orden === 'nacimientoReciente' ? (a,b)=>bYear(b)-bYear(a) :
      p.orden === 'nacimientoAntiguo' ? (a,b)=>bYear(a)-bYear(b) :
      (a,b)=>byName(a.NombreCompleto,b.NombreCompleto));
    return list;
  }

  if (route === '/busqueda') {
    const q = value(p.q);
    if (q.length < 2) return { peliculas: [], talentos: [] };
    return {
      peliculas: peliculas.filter(m => [m.Titulo,m.Genero,m.Director,m.Productora].some(v=>includes(v,q))).slice(0,10),
      talentos: actores.filter(a => [a.NombreCompleto,a.NombreArtistico,a.Profesion].some(v=>includes(v,q))).slice(0,10),
    };
  }

  let match;
  if ((match = route.match(/^\/peliculas\/director\/(.+)$/))) {
    const name = decodeURIComponent(match[1]);
    return peliculas.filter(m => includes(m.Director,name)).sort(descending);
  }
  if ((match = route.match(/^\/peliculas\/creditos\/actor\/(\d+)$/))) {
    return creditos.filter(c=>Number(c.ActorId)===Number(match[1])).map(c=>({
      ...filmById(c.PeliculaId), ...c, Id:c.PeliculaId,
    }));
  }
  if ((match = route.match(/^\/peliculas\/(\d+)\/creditos$/))) {
    // Misma proyección pública que el endpoint SQL: datos del talento del
    // catálogo YA FILTRADO por la revisión de derechos (jamás del snapshot crudo).
    return creditos.filter(c=>Number(c.PeliculaId)===Number(match[1])).map(c=>{
      const a = actorById(c.ActorId);
      return {
        ...c,
        NombreCompleto: a?.NombreCompleto ?? null,
        NombreArtistico: a?.NombreArtistico ?? null,
        Profesion: a?.Profesion ?? null,
        Sexo: a?.Sexo ?? null,
        Foto: a?.Foto ?? null,
      };
    });
  }
  if ((match = route.match(/^\/peliculas\/(\d+)\/traducciones$/))) {
    return traducciones.filter(t=>Number(t.PeliculaId)===Number(match[1]));
  }
  if ((match = route.match(/^\/peliculas\/(\d+)\/perfil$/))) {
    const m = filmById(match[1]);
    if (!m) throw errorResponse('Película no encontrada',404,config);
    const lang = value(p.lang) || 'es';
    const translated = traducciones.find(t=>Number(t.PeliculaId)===Number(m.Id) && norm(t.Idioma)===norm(lang));
    const applied = Boolean(translated && [translated.Titulo,translated.Sinopsis,translated.Eslogan].some(Boolean));
    return {
      ...film(m),
      TituloOriginal:m.Titulo, SinopsisOriginal:m.Sinopsis || null, EsloganOriginal:m.Eslogan || null,
      IdiomaContenido:norm(m.IdiomaOriginal)||'es',
      ...(applied ? {
        Titulo:translated.Titulo || m.Titulo,
        Sinopsis:translated.Sinopsis || m.Sinopsis,
        Eslogan:translated.Eslogan || m.Eslogan,
      } : {}),
      TraduccionAplicada:applied,
      TipoFuenteTraduccion:applied?translated.TipoFuente:null,
      FuenteReferenciaTraduccion:applied?translated.FuenteReferencia:null,
    };
  }
  if ((match = route.match(/^\/peliculas\/(\d+)$/))) {
    const m = filmById(match[1]);
    if (!m) throw errorResponse('Película no encontrada',404,config);
    return film(m);
  }
  if ((match = route.match(/^\/actores\/(\d+)$/))) {
    const a = actorById(match[1]);
    if (!a) throw errorResponse('Talento no encontrado',404,config);
    return actor(a);
  }
  if ((match = route.match(/^\/actores-peliculas\/pelicula\/(\d+)$/))) {
    return relaciones.filter(r=>Number(r.PeliculaId)===Number(match[1])).map(r=>({
      ...actorById(r.ActorId), Personaje:r.Personaje, EsPrincipal:r.EsPrincipal,
      TipoParticipacion:r.TipoParticipacion,
    })).sort((a,b)=>byName(a.TipoParticipacion,b.TipoParticipacion) || byName(a.NombreCompleto,b.NombreCompleto));
  }
  if ((match = route.match(/^\/actores-peliculas\/actor\/(\d+)$/))) {
    return relaciones.filter(r=>Number(r.ActorId)===Number(match[1])).map(r=>({
      ...filmById(r.PeliculaId), Personaje:r.Personaje, EsPrincipal:r.EsPrincipal,
      TipoParticipacion:r.TipoParticipacion,
    })).sort(descending);
  }
   throw errorResponse(`La ruta ${route} no está disponible en la demo de solo lectura.`, 501, config);
}

export default async function demoAdapter(config) {
  if (norm(config.method || 'get') !== 'get') {
    throw errorResponse('La demo pública es de solo lectura. Edita los registros desde tu instalación local.',403,config);
  }
  const url = new URL(config.url || '/',window.location.origin);
  const route = url.pathname.replace(/^\/api(?=\/|$)/,'');
  const params = { ...Object.fromEntries(url.searchParams.entries()), ...(config.params || {}) };
  const tables = await getCatalog();
  const data = getData(tables,route,params,config);
  return { data, status:200, statusText:'OK', headers:{}, config, request:null };
}
