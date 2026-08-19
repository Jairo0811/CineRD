const { sql, poolPromise } = require("../config/db");

const normalizarFecha = (fecha) => {
  if (!fecha || fecha.toString().trim() === "") return null;
  return fecha;
};

const normalizarEntero = (valor) => {
  if (valor === null || valor === undefined || valor.toString().trim() === "") return null;
  const numero = Number.parseInt(valor, 10);
  return Number.isNaN(numero) ? null : numero;
};

const normalizarTexto = (valor) => {
  if (!valor || valor.toString().trim() === "") return null;
  return valor.toString().trim();
};

const construirNombreCompleto = (nombres, apellidos) => `${nombres || ""} ${apellidos || ""}`.replace(/\s+/g, " ").trim();

const verificarTmdbIdDisponible = async ({ pool, tmdbId, actorId = null }) => {
  if (!tmdbId) return null;
  const request = pool.request().input("TMDbId", sql.Int, tmdbId);
  let query = `SELECT Id, NombreCompleto FROM Actores WHERE TMDbId = @TMDbId`;
  if (actorId) { request.input("ActorId", sql.Int, actorId); query += ` AND Id <> @ActorId`; }
  const resultado = await request.query(query);
  return resultado.recordset[0] || null;
};

const verificarNombreExistente = async ({ pool, nombreCompleto, actorId = null }) => {
  const request = pool.request().input("NombreCompleto", sql.NVarChar(300), nombreCompleto);
  let query = `SELECT Id, NombreCompleto, TMDbId FROM Actores WHERE LOWER(LTRIM(RTRIM(NombreCompleto))) = LOWER(LTRIM(RTRIM(@NombreCompleto)))`;
  if (actorId) { request.input("ActorId", sql.Int, actorId); query += ` AND Id <> @ActorId`; }
  const resultado = await request.query(query);
  return resultado.recordset[0] || null;
};

const obtenerActores = async (req, res) => {
  try {
    const { buscar = "", estado = "", anio = "", profesion = "", orden = "az" } = req.query;
    const pool = await poolPromise;
    let query = `
      SELECT A.Id,A.TMDbId,A.Nombres,A.Apellidos,A.NombreCompleto,A.NombreArtistico,A.Profesion,
             A.FechaNacimiento,A.AnioNacimiento,A.Sexo,A.EstaVivo,A.FechaFallecimiento,A.Foto,
             A.InstagramUrl,A.FacebookUrl,A.TikTokUrl,A.YouTubeUrl,A.XUrl,A.SitioWebUrl,
             COUNT(AP.PeliculaId) AS CantidadPeliculas
      FROM Actores A
      LEFT JOIN ActoresPeliculas AP ON A.Id = AP.ActorId
      WHERE 1 = 1`;
    if (buscar) query += ` AND (A.Nombres LIKE @Buscar OR A.Apellidos LIKE @Buscar OR A.NombreCompleto LIKE @Buscar OR A.NombreArtistico LIKE @Buscar OR A.Profesion LIKE @Buscar)`;
    if (estado === "vivo") query += ` AND A.EstaVivo = 1`;
    if (estado === "fallecido") query += ` AND A.EstaVivo = 0`;
    if (anio) query += ` AND (YEAR(A.FechaNacimiento) = @Anio OR A.AnioNacimiento = @Anio)`;
    if (profesion) query += ` AND A.Profesion LIKE @Profesion`;
    query += ` GROUP BY A.Id,A.TMDbId,A.Nombres,A.Apellidos,A.NombreCompleto,A.NombreArtistico,A.Profesion,A.FechaNacimiento,A.AnioNacimiento,A.Sexo,A.EstaVivo,A.FechaFallecimiento,A.Foto,A.InstagramUrl,A.FacebookUrl,A.TikTokUrl,A.YouTubeUrl,A.XUrl,A.SitioWebUrl`;
    switch (orden) {
      case "za": query += ` ORDER BY A.NombreCompleto DESC`; break;
      case "masPeliculas": query += ` ORDER BY CantidadPeliculas DESC, A.NombreCompleto ASC`; break;
      case "menosPeliculas": query += ` ORDER BY CantidadPeliculas ASC, A.NombreCompleto ASC`; break;
      case "nacimientoReciente": query += ` ORDER BY COALESCE(YEAR(A.FechaNacimiento),A.AnioNacimiento) DESC,A.NombreCompleto ASC`; break;
      case "nacimientoAntiguo": query += ` ORDER BY COALESCE(YEAR(A.FechaNacimiento),A.AnioNacimiento) ASC,A.NombreCompleto ASC`; break;
      default: query += ` ORDER BY A.NombreCompleto ASC`;
    }
    const request = pool.request();
    if (buscar) request.input("Buscar", sql.NVarChar(150), `%${buscar.trim()}%`);
    if (anio) request.input("Anio", sql.Int, Number.parseInt(anio, 10));
    if (profesion) request.input("Profesion", sql.NVarChar(100), `%${profesion.trim()}%`);
    const resultado = await request.query(query);
    res.json(resultado.recordset);
  } catch (error) {
    console.error("Error al obtener los actores:", error);
    res.status(500).json({ mensaje: "Error al obtener los actores", error: error.message });
  }
};

const obtenerActorPorId = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ mensaje: "El identificador del actor no es válido" });
    const pool = await poolPromise;
    const resultado = await pool.request().input("Id", sql.Int, id).query(`
      SELECT Id,TMDbId,Nombres,Apellidos,NombreCompleto,NombreArtistico,Profesion,FechaNacimiento,AnioNacimiento,
             Sexo,EstaVivo,FechaFallecimiento,Foto,InstagramUrl,FacebookUrl,TikTokUrl,YouTubeUrl,XUrl,SitioWebUrl
      FROM Actores WHERE Id = @Id`);
    if (!resultado.recordset.length) return res.status(404).json({ mensaje: "Actor no encontrado" });
    res.json(resultado.recordset[0]);
  } catch (error) {
    console.error("Error al obtener el actor:", error);
    res.status(500).json({ mensaje: "Error al obtener el actor", error: error.message });
  }
};

const crearActor = async (req, res) => {
  try {
    const { TMDbId,Nombres,Apellidos,NombreArtistico,Profesion,FechaNacimiento,AnioNacimiento,Sexo,EstaVivo,FechaFallecimiento,InstagramUrl,FacebookUrl,TikTokUrl,YouTubeUrl,XUrl,SitioWebUrl } = req.body;
    const nombresNormalizados = normalizarTexto(Nombres);
    const apellidosNormalizados = normalizarTexto(Apellidos);
    if (!nombresNormalizados || !Sexo) return res.status(400).json({ mensaje: "Nombres y sexo son obligatorios" });
    const NombreCompleto = construirNombreCompleto(nombresNormalizados, apellidosNormalizados);
    const tmdbIdNormalizado = normalizarEntero(TMDbId);
    const estaVivoNormalizado = EstaVivo === true || EstaVivo === "true";
    if (!estaVivoNormalizado && !normalizarFecha(FechaFallecimiento)) return res.status(400).json({ mensaje: "Debe indicar la fecha de fallecimiento" });
    const pool = await poolPromise;
    const actorTmdbExistente = await verificarTmdbIdDisponible({ pool, tmdbId: tmdbIdNormalizado });
    if (actorTmdbExistente) return res.status(409).json({ mensaje: "Este talento de TMDb ya está registrado en CineRD", actor: actorTmdbExistente });
    const actorNombreExistente = await verificarNombreExistente({ pool, nombreCompleto: NombreCompleto });
    if (actorNombreExistente) return res.status(409).json({ mensaje: "Ya existe un talento registrado con ese nombre", actor: actorNombreExistente });
    const Foto = req.file ? `/uploads/actores/${req.file.filename}` : null;
    const request = pool.request()
      .input("TMDbId",sql.Int,tmdbIdNormalizado).input("Nombres",sql.NVarChar(150),nombresNormalizados).input("Apellidos",sql.NVarChar(150),apellidosNormalizados)
      .input("NombreCompleto",sql.NVarChar(300),NombreCompleto).input("NombreArtistico",sql.NVarChar(150),normalizarTexto(NombreArtistico)).input("Profesion",sql.NVarChar(100),normalizarTexto(Profesion))
      .input("FechaNacimiento",sql.Date,normalizarFecha(FechaNacimiento)).input("AnioNacimiento",sql.Int,normalizarEntero(AnioNacimiento)).input("Sexo",sql.NVarChar(20),Sexo).input("EstaVivo",sql.Bit,estaVivoNormalizado)
      .input("FechaFallecimiento",sql.Date,estaVivoNormalizado?null:normalizarFecha(FechaFallecimiento)).input("Foto",sql.NVarChar(255),Foto)
      .input("InstagramUrl",sql.NVarChar(300),normalizarTexto(InstagramUrl)).input("FacebookUrl",sql.NVarChar(300),normalizarTexto(FacebookUrl)).input("TikTokUrl",sql.NVarChar(300),normalizarTexto(TikTokUrl))
      .input("YouTubeUrl",sql.NVarChar(300),normalizarTexto(YouTubeUrl)).input("XUrl",sql.NVarChar(300),normalizarTexto(XUrl)).input("SitioWebUrl",sql.NVarChar(300),normalizarTexto(SitioWebUrl));
    const resultado = await request.query(`
      INSERT INTO Actores (TMDbId,Nombres,Apellidos,NombreCompleto,NombreArtistico,Profesion,FechaNacimiento,AnioNacimiento,Sexo,EstaVivo,FechaFallecimiento,Foto,InstagramUrl,FacebookUrl,TikTokUrl,YouTubeUrl,XUrl,SitioWebUrl)
      OUTPUT INSERTED.* VALUES (@TMDbId,@Nombres,@Apellidos,@NombreCompleto,@NombreArtistico,@Profesion,@FechaNacimiento,@AnioNacimiento,@Sexo,@EstaVivo,@FechaFallecimiento,@Foto,@InstagramUrl,@FacebookUrl,@TikTokUrl,@YouTubeUrl,@XUrl,@SitioWebUrl)`);
    res.status(201).json({ mensaje: "Actor registrado correctamente", actor: resultado.recordset[0] });
  } catch (error) {
    console.error("Error al registrar el actor:", error);
    res.status(500).json({ mensaje: "Error al registrar el actor", error: error.message });
  }
};

const actualizarActor = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ mensaje: "El identificador del actor no es válido" });
    const { TMDbId,Nombres,Apellidos,NombreArtistico,Profesion,FechaNacimiento,AnioNacimiento,Sexo,EstaVivo,FechaFallecimiento,InstagramUrl,FacebookUrl,TikTokUrl,YouTubeUrl,XUrl,SitioWebUrl } = req.body;
    const nombresNormalizados = normalizarTexto(Nombres);
    const apellidosNormalizados = normalizarTexto(Apellidos);
    if (!nombresNormalizados || !Sexo) return res.status(400).json({ mensaje: "Nombres y sexo son obligatorios" });
    const NombreCompleto = construirNombreCompleto(nombresNormalizados, apellidosNormalizados);
    const tmdbIdNormalizado = normalizarEntero(TMDbId);
    const estaVivoNormalizado = EstaVivo === true || EstaVivo === "true";
    if (!estaVivoNormalizado && !normalizarFecha(FechaFallecimiento)) return res.status(400).json({ mensaje: "Debe indicar la fecha de fallecimiento" });
    const pool = await poolPromise;
    const actorActual = await pool.request().input("Id", sql.Int, id).query(`SELECT Id,TMDbId,Foto FROM Actores WHERE Id=@Id`);
    if (!actorActual.recordset.length) return res.status(404).json({ mensaje: "Actor no encontrado" });
    const tmdbIdFinal = tmdbIdNormalizado ?? actorActual.recordset[0].TMDbId ?? null;
    const actorTmdbExistente = await verificarTmdbIdDisponible({ pool, tmdbId: tmdbIdFinal, actorId: id });
    if (actorTmdbExistente) return res.status(409).json({ mensaje: "Este perfil de TMDb ya está vinculado con otro talento", actor: actorTmdbExistente });
    const actorNombreExistente = await verificarNombreExistente({ pool, nombreCompleto: NombreCompleto, actorId: id });
    if (actorNombreExistente) return res.status(409).json({ mensaje: "Ya existe otro talento registrado con ese nombre", actor: actorNombreExistente });
    const Foto = req.file ? `/uploads/actores/${req.file.filename}` : actorActual.recordset[0].Foto || null;
    const request = pool.request().input("Id",sql.Int,id).input("TMDbId",sql.Int,tmdbIdFinal).input("Nombres",sql.NVarChar(150),nombresNormalizados).input("Apellidos",sql.NVarChar(150),apellidosNormalizados)
      .input("NombreCompleto",sql.NVarChar(300),NombreCompleto).input("NombreArtistico",sql.NVarChar(150),normalizarTexto(NombreArtistico)).input("Profesion",sql.NVarChar(100),normalizarTexto(Profesion))
      .input("FechaNacimiento",sql.Date,normalizarFecha(FechaNacimiento)).input("AnioNacimiento",sql.Int,normalizarEntero(AnioNacimiento)).input("Sexo",sql.NVarChar(20),Sexo).input("EstaVivo",sql.Bit,estaVivoNormalizado)
      .input("FechaFallecimiento",sql.Date,estaVivoNormalizado?null:normalizarFecha(FechaFallecimiento)).input("Foto",sql.NVarChar(255),Foto)
      .input("InstagramUrl",sql.NVarChar(300),normalizarTexto(InstagramUrl)).input("FacebookUrl",sql.NVarChar(300),normalizarTexto(FacebookUrl)).input("TikTokUrl",sql.NVarChar(300),normalizarTexto(TikTokUrl))
      .input("YouTubeUrl",sql.NVarChar(300),normalizarTexto(YouTubeUrl)).input("XUrl",sql.NVarChar(300),normalizarTexto(XUrl)).input("SitioWebUrl",sql.NVarChar(300),normalizarTexto(SitioWebUrl));
    const resultado = await request.query(`
      UPDATE Actores SET TMDbId=@TMDbId,Nombres=@Nombres,Apellidos=@Apellidos,NombreCompleto=@NombreCompleto,NombreArtistico=@NombreArtistico,Profesion=@Profesion,
        FechaNacimiento=@FechaNacimiento,AnioNacimiento=@AnioNacimiento,Sexo=@Sexo,EstaVivo=@EstaVivo,FechaFallecimiento=@FechaFallecimiento,Foto=@Foto,
        InstagramUrl=@InstagramUrl,FacebookUrl=@FacebookUrl,TikTokUrl=@TikTokUrl,YouTubeUrl=@YouTubeUrl,XUrl=@XUrl,SitioWebUrl=@SitioWebUrl
      OUTPUT INSERTED.* WHERE Id=@Id`);
    res.json({ mensaje: "Actor actualizado correctamente", actor: resultado.recordset[0] });
  } catch (error) {
    console.error("Error al actualizar el actor:", error);
    res.status(500).json({ mensaje: "Error al actualizar el actor", error: error.message });
  }
};

const eliminarActor = async (req, res) => {
  const transaction = new sql.Transaction(await poolPromise);
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ mensaje: "El identificador del actor no es válido" });
    await transaction.begin();
    await new sql.Request(transaction).input("ActorId", sql.Int, id).query(`DELETE FROM ActoresPeliculas WHERE ActorId = @ActorId`);
    const resultado = await new sql.Request(transaction).input("Id", sql.Int, id).query(`DELETE FROM Actores OUTPUT DELETED.* WHERE Id = @Id`);
    if (!resultado.recordset.length) { await transaction.rollback(); return res.status(404).json({ mensaje: "Actor no encontrado" }); }
    await transaction.commit();
    res.json({ mensaje: "Actor eliminado correctamente", actor: resultado.recordset[0] });
  } catch (error) {
    try { await transaction.rollback(); } catch (rollbackError) { console.error("Error al revertir la transacción:", rollbackError); }
    console.error("Error al eliminar el actor:", error);
    res.status(500).json({ mensaje: "Error al eliminar el actor", error: error.message });
  }
};

module.exports = { obtenerActores, obtenerActorPorId, crearActor, actualizarActor, eliminarActor };