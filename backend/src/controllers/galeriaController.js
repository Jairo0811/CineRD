const fs = require("fs");
const path = require("path");
const { poolPromise, sql } = require("../config/db");

const TIPOS_IMAGEN = new Set([
  "FOTO_RODAJE",
  "POSTER_ALTERNATIVO",
  "BACKDROP",
  "PROMOCIONAL",
  "PRENSA",
  "EVENTO",
  "OTRO",
]);
const TIPOS_VIDEO = new Set(["TRAILER"]);
const TIPOS_MUSICA = new Set(["TEMA_OFICIAL", "CANCION_ORIGINAL", "BANDA_SONORA", "SCORE"]);
const TIPOS_PERMITIDOS = new Set([...TIPOS_IMAGEN, ...TIPOS_VIDEO, ...TIPOS_MUSICA]);

const limpiar = (valor) => (typeof valor === "string" ? valor.trim() : valor);
const enteroOpcional = (valor) => (valor === "" || valor == null ? null : Number(valor));
const booleano = (valor) => valor === true || valor === "true" || valor === "1" || valor === 1;

const validarEntidad = ({ PeliculaId, ActorId }) => Boolean(PeliculaId) !== Boolean(ActorId);

const obtenerYoutubeId = (valor) => {
  if (!valor) return null;
  try {
    const url = new URL(valor);
    const host = url.hostname.toLowerCase().replace(/^www\./, "");

    if (host === "youtu.be") {
      return url.pathname.split("/").filter(Boolean)[0] || null;
    }

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

const normalizarYoutubeUrl = (valor) => {
  const id = obtenerYoutubeId(limpiar(valor));
  return id ? `https://www.youtube.com/watch?v=${id}` : null;
};

const normalizarSpotifyUrl = (valor) => {
  if (!valor) return null;
  try {
    const url = new URL(limpiar(valor));
    const host = url.hostname.toLowerCase().replace(/^www\./, "");
    if (host !== "open.spotify.com") return null;

    const partes = url.pathname.split("/").filter(Boolean);
    const tipo = partes[0];
    const id = partes[1];
    if (!["track", "album", "playlist"].includes(tipo) || !id) return null;

    return `https://open.spotify.com/${tipo}/${id}`;
  } catch {
    return null;
  }
};

const borrarArchivoGaleria = (archivo) => {
  if (!archivo || !archivo.startsWith("/uploads/galerias/")) return;

  const nombre = path.basename(archivo);
  const ruta = path.join(process.cwd(), "uploads", "galerias", nombre);

  try {
    if (fs.existsSync(ruta)) fs.unlinkSync(ruta);
  } catch (error) {
    console.warn("No se pudo eliminar archivo de galería:", ruta, error.message);
  }
};

const consultaBase = `
  SELECT
    G.Id,
    G.PeliculaId,
    P.Titulo AS Pelicula,
    G.ActorId,
    COALESCE(A.NombreArtistico, A.NombreCompleto) AS Talento,
    G.Tipo,
    G.Titulo,
    G.Artista,
    G.Descripcion,
    G.Archivo,
    G.VideoUrl,
    G.AudioUrl,
    G.Proveedor,
    G.FuenteUrl,
    G.Orden,
    G.EsDestacada,
    G.FechaCreacion,
    G.FechaActualizacion
  FROM GaleriaMultimedia G
  LEFT JOIN Peliculas P ON P.Id = G.PeliculaId
  LEFT JOIN Actores A ON A.Id = G.ActorId
`;

const obtenerGaleria = async (req, res) => {
  try {
    const pool = await poolPromise;
    const request = pool.request();
    const filtros = [];

    if (req.query.peliculaId) {
      request.input("PeliculaId", sql.Int, Number(req.query.peliculaId));
      filtros.push("G.PeliculaId = @PeliculaId");

      if (String(req.query.incluirExternos || "").toLowerCase() !== "true") {
        filtros.push("G.Tipo NOT IN (N'TRAILER', N'TEMA_OFICIAL', N'CANCION_ORIGINAL', N'BANDA_SONORA', N'SCORE')");
      }
    }

    if (req.query.actorId) {
      request.input("ActorId", sql.Int, Number(req.query.actorId));
      filtros.push("G.ActorId = @ActorId");
    }

    if (req.query.tipo) {
      const tipo = String(req.query.tipo).toUpperCase();
      request.input("Tipo", sql.NVarChar(40), tipo);
      filtros.push("G.Tipo = @Tipo");
    }

    if (String(req.query.musica || "").toLowerCase() === "true") {
      filtros.push("G.Tipo IN (N'TEMA_OFICIAL', N'CANCION_ORIGINAL', N'BANDA_SONORA', N'SCORE')");
    }

    const where = filtros.length ? ` WHERE ${filtros.join(" AND ")}` : "";
    const result = await request.query(
      `${consultaBase}${where} ORDER BY G.EsDestacada DESC, COALESCE(G.Orden, 2147483647), G.FechaCreacion DESC;`,
    );

    res.json(result.recordset);
  } catch (error) {
    console.error("Error al obtener galería:", error);
    res.status(500).json({ mensaje: "No fue posible obtener la galería multimedia" });
  }
};

const crearElementoGaleria = async (req, res) => {
  const PeliculaId = enteroOpcional(req.body.PeliculaId);
  const ActorId = enteroOpcional(req.body.ActorId);
  const Tipo = String(req.body.Tipo || "PROMOCIONAL").toUpperCase();
  const EsDestacada = booleano(req.body.EsDestacada);
  const esVideo = TIPOS_VIDEO.has(Tipo);
  const esMusica = TIPOS_MUSICA.has(Tipo);
  const VideoUrl = esVideo ? normalizarYoutubeUrl(req.body.VideoUrl) : null;
  const AudioUrl = esMusica ? normalizarSpotifyUrl(req.body.AudioUrl) : null;
  const Proveedor = esMusica ? "SPOTIFY" : esVideo ? "YOUTUBE" : null;

  if (!validarEntidad({ PeliculaId, ActorId })) {
    if (req.file?.filename) borrarArchivoGaleria(`/uploads/galerias/${req.file.filename}`);
    return res.status(400).json({ mensaje: "El elemento debe pertenecer a una película o a un talento, pero no a ambos" });
  }

  if (!TIPOS_PERMITIDOS.has(Tipo)) {
    if (req.file?.filename) borrarArchivoGaleria(`/uploads/galerias/${req.file.filename}`);
    return res.status(400).json({ mensaje: "Tipo de contenido inválido" });
  }

  if ((esVideo || esMusica) && (!PeliculaId || ActorId)) {
    if (req.file?.filename) borrarArchivoGaleria(`/uploads/galerias/${req.file.filename}`);
    return res.status(400).json({ mensaje: "El contenido audiovisual y musical solo puede asociarse a películas" });
  }

  if (esVideo && !VideoUrl) {
    if (req.file?.filename) borrarArchivoGaleria(`/uploads/galerias/${req.file.filename}`);
    return res.status(400).json({ mensaje: "Indica una URL válida de YouTube para el trailer" });
  }

  if (esMusica && !AudioUrl) {
    if (req.file?.filename) borrarArchivoGaleria(`/uploads/galerias/${req.file.filename}`);
    return res.status(400).json({ mensaje: "Indica una URL válida de Spotify (canción, álbum o playlist)" });
  }

  if (!esVideo && !esMusica && !req.file?.filename) {
    return res.status(400).json({ mensaje: "La imagen es obligatoria" });
  }

  if ((esVideo || esMusica) && req.file?.filename) {
    borrarArchivoGaleria(`/uploads/galerias/${req.file.filename}`);
  }

  const Archivo = !esVideo && !esMusica && req.file?.filename
    ? `/uploads/galerias/${req.file.filename}`
    : null;

  try {
    const pool = await poolPromise;
    const tx = new sql.Transaction(pool);
    await tx.begin();

    try {
      if (esVideo && EsDestacada) {
        await new sql.Request(tx)
          .input("PeliculaId", sql.Int, PeliculaId)
          .query("UPDATE dbo.GaleriaMultimedia SET EsDestacada = 0 WHERE PeliculaId = @PeliculaId AND Tipo = N'TRAILER';");
      }

      if (esMusica && EsDestacada) {
        await new sql.Request(tx)
          .input("PeliculaId", sql.Int, PeliculaId)
          .query(`UPDATE dbo.GaleriaMultimedia
                  SET EsDestacada = 0
                  WHERE PeliculaId = @PeliculaId
                    AND Tipo IN (N'TEMA_OFICIAL', N'CANCION_ORIGINAL', N'BANDA_SONORA', N'SCORE');`);
      }

      const result = await new sql.Request(tx)
        .input("PeliculaId", sql.Int, PeliculaId)
        .input("ActorId", sql.Int, ActorId)
        .input("Tipo", sql.NVarChar(40), Tipo)
        .input("Titulo", sql.NVarChar(180), limpiar(req.body.Titulo) || null)
        .input("Artista", sql.NVarChar(180), limpiar(req.body.Artista) || null)
        .input("Descripcion", sql.NVarChar(700), limpiar(req.body.Descripcion) || null)
        .input("Archivo", sql.NVarChar(300), Archivo)
        .input("VideoUrl", sql.NVarChar(500), VideoUrl)
        .input("AudioUrl", sql.NVarChar(500), AudioUrl)
        .input("Proveedor", sql.NVarChar(30), Proveedor)
        .input("FuenteUrl", sql.NVarChar(500), limpiar(req.body.FuenteUrl) || null)
        .input("Orden", sql.Int, enteroOpcional(req.body.Orden))
        .input("EsDestacada", sql.Bit, EsDestacada)
        .query(`
          INSERT INTO GaleriaMultimedia
            (PeliculaId, ActorId, Tipo, Titulo, Artista, Descripcion, Archivo, VideoUrl, AudioUrl, Proveedor, FuenteUrl, Orden, EsDestacada)
          OUTPUT INSERTED.*
          VALUES
            (@PeliculaId, @ActorId, @Tipo, @Titulo, @Artista, @Descripcion, @Archivo, @VideoUrl, @AudioUrl, @Proveedor, @FuenteUrl, @Orden, @EsDestacada);
        `);

      if (esVideo && EsDestacada) {
        await new sql.Request(tx)
          .input("PeliculaId", sql.Int, PeliculaId)
          .input("TrailerUrl", sql.NVarChar(500), VideoUrl)
          .query("UPDATE dbo.Peliculas SET TrailerUrl = @TrailerUrl WHERE Id = @PeliculaId;");
      }

      await tx.commit();
      res.status(201).json(result.recordset[0]);
    } catch (error) {
      await tx.rollback();
      throw error;
    }
  } catch (error) {
    if (Archivo) borrarArchivoGaleria(Archivo);
    if (error.number === 547) {
      return res.status(400).json({ mensaje: "La película o talento seleccionado no existe" });
    }
    console.error("Error al crear elemento de galería:", error);
    res.status(500).json({ mensaje: "No fue posible guardar el contenido multimedia" });
  }
};

const actualizarElementoGaleria = async (req, res) => {
  const Id = Number(req.params.id);
  const PeliculaId = enteroOpcional(req.body.PeliculaId);
  const ActorId = enteroOpcional(req.body.ActorId);
  const Tipo = String(req.body.Tipo || "PROMOCIONAL").toUpperCase();
  const EsDestacada = booleano(req.body.EsDestacada);
  const esVideo = TIPOS_VIDEO.has(Tipo);
  const esMusica = TIPOS_MUSICA.has(Tipo);
  const VideoUrl = esVideo ? normalizarYoutubeUrl(req.body.VideoUrl) : null;
  const AudioUrl = esMusica ? normalizarSpotifyUrl(req.body.AudioUrl) : null;
  const Proveedor = esMusica ? "SPOTIFY" : esVideo ? "YOUTUBE" : null;

  if (!validarEntidad({ PeliculaId, ActorId })) {
    if (req.file?.filename) borrarArchivoGaleria(`/uploads/galerias/${req.file.filename}`);
    return res.status(400).json({ mensaje: "El elemento debe pertenecer a una película o a un talento, pero no a ambos" });
  }

  if (!TIPOS_PERMITIDOS.has(Tipo)) {
    if (req.file?.filename) borrarArchivoGaleria(`/uploads/galerias/${req.file.filename}`);
    return res.status(400).json({ mensaje: "Tipo de contenido inválido" });
  }

  if ((esVideo || esMusica) && (!PeliculaId || ActorId)) {
    if (req.file?.filename) borrarArchivoGaleria(`/uploads/galerias/${req.file.filename}`);
    return res.status(400).json({ mensaje: "El contenido audiovisual y musical solo puede asociarse a películas" });
  }

  if (esVideo && !VideoUrl) {
    if (req.file?.filename) borrarArchivoGaleria(`/uploads/galerias/${req.file.filename}`);
    return res.status(400).json({ mensaje: "Indica una URL válida de YouTube para el trailer" });
  }

  if (esMusica && !AudioUrl) {
    if (req.file?.filename) borrarArchivoGaleria(`/uploads/galerias/${req.file.filename}`);
    return res.status(400).json({ mensaje: "Indica una URL válida de Spotify (canción, álbum o playlist)" });
  }

  try {
    const pool = await poolPromise;
    const actual = await pool.request()
      .input("Id", sql.Int, Id)
      .query("SELECT Archivo, VideoUrl, AudioUrl, PeliculaId, Tipo, EsDestacada FROM GaleriaMultimedia WHERE Id = @Id;");

    if (!actual.recordset.length) {
      if (req.file?.filename) borrarArchivoGaleria(`/uploads/galerias/${req.file.filename}`);
      return res.status(404).json({ mensaje: "Contenido multimedia no encontrado" });
    }

    const anterior = actual.recordset[0];

    if (!esVideo && !esMusica && !req.file?.filename && !anterior.Archivo) {
      return res.status(400).json({ mensaje: "La imagen es obligatoria" });
    }

    if ((esVideo || esMusica) && req.file?.filename) {
      borrarArchivoGaleria(`/uploads/galerias/${req.file.filename}`);
    }

    const Archivo = esVideo || esMusica
      ? null
      : req.file?.filename
        ? `/uploads/galerias/${req.file.filename}`
        : anterior.Archivo;

    const tx = new sql.Transaction(pool);
    await tx.begin();

    try {
      if (esVideo && EsDestacada) {
        await new sql.Request(tx)
          .input("PeliculaId", sql.Int, PeliculaId)
          .input("Id", sql.Int, Id)
          .query("UPDATE dbo.GaleriaMultimedia SET EsDestacada = 0 WHERE PeliculaId = @PeliculaId AND Tipo = N'TRAILER' AND Id <> @Id;");
      }

      if (esMusica && EsDestacada) {
        await new sql.Request(tx)
          .input("PeliculaId", sql.Int, PeliculaId)
          .input("Id", sql.Int, Id)
          .query(`UPDATE dbo.GaleriaMultimedia
                  SET EsDestacada = 0
                  WHERE PeliculaId = @PeliculaId
                    AND Tipo IN (N'TEMA_OFICIAL', N'CANCION_ORIGINAL', N'BANDA_SONORA', N'SCORE')
                    AND Id <> @Id;`);
      }

      const result = await new sql.Request(tx)
        .input("Id", sql.Int, Id)
        .input("PeliculaId", sql.Int, PeliculaId)
        .input("ActorId", sql.Int, ActorId)
        .input("Tipo", sql.NVarChar(40), Tipo)
        .input("Titulo", sql.NVarChar(180), limpiar(req.body.Titulo) || null)
        .input("Artista", sql.NVarChar(180), limpiar(req.body.Artista) || null)
        .input("Descripcion", sql.NVarChar(700), limpiar(req.body.Descripcion) || null)
        .input("Archivo", sql.NVarChar(300), Archivo)
        .input("VideoUrl", sql.NVarChar(500), VideoUrl)
        .input("AudioUrl", sql.NVarChar(500), AudioUrl)
        .input("Proveedor", sql.NVarChar(30), Proveedor)
        .input("FuenteUrl", sql.NVarChar(500), limpiar(req.body.FuenteUrl) || null)
        .input("Orden", sql.Int, enteroOpcional(req.body.Orden))
        .input("EsDestacada", sql.Bit, EsDestacada)
        .query(`
          UPDATE GaleriaMultimedia
          SET PeliculaId = @PeliculaId,
              ActorId = @ActorId,
              Tipo = @Tipo,
              Titulo = @Titulo,
              Artista = @Artista,
              Descripcion = @Descripcion,
              Archivo = @Archivo,
              VideoUrl = @VideoUrl,
              AudioUrl = @AudioUrl,
              Proveedor = @Proveedor,
              FuenteUrl = @FuenteUrl,
              Orden = @Orden,
              EsDestacada = @EsDestacada,
              FechaActualizacion = SYSUTCDATETIME()
          OUTPUT INSERTED.*
          WHERE Id = @Id;
        `);

      if (esVideo && EsDestacada) {
        await new sql.Request(tx)
          .input("PeliculaId", sql.Int, PeliculaId)
          .input("TrailerUrl", sql.NVarChar(500), VideoUrl)
          .query("UPDATE dbo.Peliculas SET TrailerUrl = @TrailerUrl WHERE Id = @PeliculaId;");
      } else if (anterior.Tipo === "TRAILER" && anterior.EsDestacada && anterior.PeliculaId) {
        const siguiente = await new sql.Request(tx)
          .input("PeliculaId", sql.Int, anterior.PeliculaId)
          .input("Id", sql.Int, Id)
          .query(`SELECT TOP 1 VideoUrl FROM dbo.GaleriaMultimedia
                  WHERE PeliculaId = @PeliculaId AND Tipo = N'TRAILER' AND EsDestacada = 1 AND Id <> @Id
                  ORDER BY FechaActualizacion DESC, FechaCreacion DESC;`);

        await new sql.Request(tx)
          .input("PeliculaId", sql.Int, anterior.PeliculaId)
          .input("TrailerUrl", sql.NVarChar(500), siguiente.recordset[0]?.VideoUrl || null)
          .input("AnteriorUrl", sql.NVarChar(500), anterior.VideoUrl)
          .query("UPDATE dbo.Peliculas SET TrailerUrl = @TrailerUrl WHERE Id = @PeliculaId AND TrailerUrl = @AnteriorUrl;");
      }

      await tx.commit();

      if (req.file?.filename && anterior.Archivo !== Archivo) {
        borrarArchivoGaleria(anterior.Archivo);
      }
      if ((esVideo || esMusica) && anterior.Archivo) borrarArchivoGaleria(anterior.Archivo);

      res.json(result.recordset[0]);
    } catch (error) {
      await tx.rollback();
      throw error;
    }
  } catch (error) {
    if (req.file?.filename && !esVideo && !esMusica) {
      borrarArchivoGaleria(`/uploads/galerias/${req.file.filename}`);
    }
    if (error.number === 547) {
      return res.status(400).json({ mensaje: "La película o talento seleccionado no existe" });
    }
    console.error("Error al actualizar elemento de galería:", error);
    res.status(500).json({ mensaje: "No fue posible actualizar el contenido multimedia" });
  }
};

const eliminarElementoGaleria = async (req, res) => {
  try {
    const pool = await poolPromise;
    const tx = new sql.Transaction(pool);
    await tx.begin();

    try {
      const actual = await new sql.Request(tx)
        .input("Id", sql.Int, Number(req.params.id))
        .query("SELECT Id, Archivo, VideoUrl, AudioUrl, PeliculaId, Tipo, EsDestacada FROM dbo.GaleriaMultimedia WHERE Id = @Id;");

      if (!actual.recordset.length) {
        await tx.rollback();
        return res.status(404).json({ mensaje: "Contenido multimedia no encontrado" });
      }

      const item = actual.recordset[0];
      await new sql.Request(tx)
        .input("Id", sql.Int, item.Id)
        .query("DELETE FROM dbo.GaleriaMultimedia WHERE Id = @Id;");

      if (item.Tipo === "TRAILER" && item.EsDestacada && item.PeliculaId) {
        const siguiente = await new sql.Request(tx)
          .input("PeliculaId", sql.Int, item.PeliculaId)
          .query(`SELECT TOP 1 VideoUrl FROM dbo.GaleriaMultimedia
                  WHERE PeliculaId = @PeliculaId AND Tipo = N'TRAILER' AND EsDestacada = 1
                  ORDER BY FechaActualizacion DESC, FechaCreacion DESC;`);

        await new sql.Request(tx)
          .input("PeliculaId", sql.Int, item.PeliculaId)
          .input("TrailerUrl", sql.NVarChar(500), siguiente.recordset[0]?.VideoUrl || null)
          .input("AnteriorUrl", sql.NVarChar(500), item.VideoUrl)
          .query("UPDATE dbo.Peliculas SET TrailerUrl = @TrailerUrl WHERE Id = @PeliculaId AND TrailerUrl = @AnteriorUrl;");
      }

      await tx.commit();
      borrarArchivoGaleria(item.Archivo);
      res.status(204).send();
    } catch (error) {
      await tx.rollback();
      throw error;
    }
  } catch (error) {
    console.error("Error al eliminar elemento de galería:", error);
    res.status(500).json({ mensaje: "No fue posible eliminar el contenido multimedia" });
  }
};

module.exports = {
  obtenerGaleria,
  crearElementoGaleria,
  actualizarElementoGaleria,
  eliminarElementoGaleria,
};