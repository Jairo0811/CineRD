import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api";

import ActorFormFields from "../components/actores/ActorFormFields";
import ParticipacionFormFields from "../components/reparto/ParticipacionFormFields";

import {
  obtenerClaseParticipacion,
  obtenerTextoParticipacion,
} from "../constants/tiposParticipacion";

const formularioParticipacionInicial = {
  ActorId: "",
  Personaje: "",
  TipoParticipacion: "Principal",
};

const formularioNuevoTalentoInicial = {
  TMDbId: "",
  Nombres: "",
  Apellidos: "",
  NombreArtistico: "",
  Profesion: "Actor",
  Sexo: "Masculino",
  FechaNacimiento: "",
  AnioNacimiento: "",
  FechaFallecimiento: "",
  EstaVivo: true,
  Personaje: "",
  TipoParticipacion: "Reparto",
  FotoUrl: "",
  FotoLocal: null,
};

function RepartoPelicula() {
  const { id } = useParams();

  const API_URL = "http://localhost:3000";

  const [pelicula, setPelicula] = useState(null);
  const [actores, setActores] = useState([]);
  const [reparto, setReparto] = useState([]);

  const [formulario, setFormulario] = useState(formularioParticipacionInicial);

  const [editando, setEditando] = useState(null);

  const [repartoTmdb, setRepartoTmdb] = useState([]);
  const [resumenTmdb, setResumenTmdb] = useState(null);
  const [consultandoTmdb, setConsultandoTmdb] = useState(false);
  const [mensajeTmdb, setMensajeTmdb] = useState("");
  const [procesandoTmdbId, setProcesandoTmdbId] = useState(null);

  const [nuevoTalento, setNuevoTalento] = useState(null);
  const [guardandoTalento, setGuardandoTalento] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, [id]);

  const actoresEnReparto = useMemo(
    () => new Set(reparto.map((actor) => Number(actor.Id))),
    [reparto],
  );

  const cargarDatos = async () => {
    try {
      const [peliculaResponse, actoresResponse, repartoResponse] =
        await Promise.all([
          api.get(`/peliculas/${id}`),
          api.get("/actores"),
          api.get(`/actores-peliculas/pelicula/${id}`),
        ]);

      setPelicula(peliculaResponse.data);
      setActores(actoresResponse.data);
      setReparto(repartoResponse.data);
    } catch (error) {
      console.error(error);
      alert("Error al cargar el reparto");
    }
  };

  const manejarCambioParticipacion = (e) => {
    const { name, value } = e.target;

    setFormulario((actual) => ({
      ...actual,
      [name]: value,
    }));
  };

  const manejarCambioEdicion = (e) => {
    const { name, value } = e.target;

    setEditando((actual) => ({
      ...actual,
      [name]: value,
    }));
  };

  const agregarRelacion = async ({
    actorId,
    personaje = "",
    tipoParticipacion = "Reparto",
  }) => {
    await api.post("/actores-peliculas", {
      PeliculaId: Number(id),
      ActorId: Number(actorId),
      Personaje: personaje,
      TipoParticipacion: tipoParticipacion,
    });
  };

  const agregarActor = async (e) => {
    e.preventDefault();

    if (!formulario.ActorId) {
      alert("Debe seleccionar un actor");
      return;
    }

    try {
      await agregarRelacion({
        actorId: formulario.ActorId,
        personaje: formulario.Personaje,
        tipoParticipacion: formulario.TipoParticipacion,
      });

      setFormulario(formularioParticipacionInicial);

      await cargarDatos();
    } catch (error) {
      console.error(error);

      alert(
        error.response?.data?.mensaje ||
          error.response?.data?.error ||
          "Error al agregar actor al reparto",
      );
    }
  };

  const abrirEdicion = (actor) => {
    setEditando({
      ActorId: actor.Id,
      NombreCompleto: actor.NombreCompleto,
      Personaje: actor.Personaje || "",
      TipoParticipacion: actor.TipoParticipacion || "Secundario",
    });
  };

  const guardarEdicion = async (e) => {
    e.preventDefault();

    try {
      await api.put(`/actores-peliculas/${id}/${editando.ActorId}`, {
        Personaje: editando.Personaje,
        TipoParticipacion: editando.TipoParticipacion,
      });

      setEditando(null);
      await cargarDatos();
    } catch (error) {
      console.error(error);

      alert(
        error.response?.data?.mensaje || "Error al actualizar la participación",
      );
    }
  };

  const eliminarDelReparto = async (actorId) => {
    const confirmar = window.confirm("¿Desea quitar este actor del reparto?");

    if (!confirmar) return;

    try {
      await api.delete(`/actores-peliculas/${id}/${actorId}`);

      await cargarDatos();
    } catch (error) {
      console.error(error);
      alert("Error al quitar actor del reparto");
    }
  };

  const consultarRepartoTmdb = async () => {
    if (!pelicula?.TMDbId) {
      setMensajeTmdb("Esta película todavía no está vinculada con TMDb.");
      return;
    }

    try {
      setConsultandoTmdb(true);
      setMensajeTmdb("");

      const response = await api.get(
        `/tmdb/peliculas/${pelicula.TMDbId}/reparto`,
      );

      setRepartoTmdb(response.data.Reparto || []);
      setResumenTmdb(response.data.Resumen || null);
    } catch (error) {
      console.error(error);

      setMensajeTmdb(
        error.response?.data?.mensaje ||
          "No fue posible consultar el reparto de TMDb.",
      );
    } finally {
      setConsultandoTmdb(false);
    }
  };

  const usarActorExistente = async (personaTmdb, actorExistente) => {
    if (!actorExistente?.Id) {
      alert("No se encontró un actor válido");
      return;
    }

    if (actoresEnReparto.has(Number(actorExistente.Id))) {
      alert("Este actor ya pertenece al reparto");
      return;
    }

    try {
      setProcesandoTmdbId(personaTmdb.TmdbId);

      if (
        personaTmdb.TmdbId &&
        Number(actorExistente.TMDbId) !== Number(personaTmdb.TmdbId)
      ) {
        await api.patch(`/tmdb/actores/${actorExistente.Id}/vincular`, {
          TMDbId: personaTmdb.TmdbId,
        });
      }

      await agregarRelacion({
        actorId: actorExistente.Id,
        personaje: personaTmdb.Personaje || "",
        tipoParticipacion: "Reparto",
      });

      await cargarDatos();
      await consultarRepartoTmdb();
    } catch (error) {
      console.error(error);

      alert(
        error.response?.data?.mensaje ||
          "No fue posible utilizar el actor existente.",
      );
    } finally {
      setProcesandoTmdbId(null);
    }
  };

  const separarNombreInicial = (nombreCompleto = "") => {
    const partes = nombreCompleto.trim().split(/\s+/).filter(Boolean);

    if (partes.length <= 1) {
      return {
        Nombres: partes[0] || "",
        Apellidos: "",
      };
    }

    return {
      Nombres: partes[0],
      Apellidos: partes.slice(1).join(" "),
    };
  };

  const abrirCreacionTalento = async (personaTmdb) => {
    try {
      setProcesandoTmdbId(personaTmdb.TmdbId);

      const response = await api.get(`/tmdb/personas/${personaTmdb.TmdbId}`);

      const persona = response.data;
      const nombreSeparado = separarNombreInicial(persona.NombreCompleto);

      const sexo = persona.SexoTmdb === 1 ? "Femenino" : "Masculino";

      const profesion =
        persona.Departamento === "Directing"
          ? "Director"
          : sexo === "Femenino"
            ? "Actriz"
            : "Actor";

      setNuevoTalento({
        ...formularioNuevoTalentoInicial,
        TMDbId: persona.TmdbId,
        Nombres: nombreSeparado.Nombres,
        Apellidos: nombreSeparado.Apellidos,
        NombreArtistico: persona.NombreArtistico || "",
        Profesion: profesion,
        Sexo: sexo,
        FechaNacimiento: persona.FechaNacimiento || "",
        FechaFallecimiento: persona.FechaFallecimiento || "",
        EstaVivo: !persona.FechaFallecimiento,
        Personaje: personaTmdb.Personaje || "",
        FotoUrl: persona.FotoUrl || personaTmdb.FotoUrl || "",
      });
    } catch (error) {
      console.error(error);

      alert(
        error.response?.data?.mensaje ||
          "No fue posible obtener los datos de la persona.",
      );
    } finally {
      setProcesandoTmdbId(null);
    }
  };

  const manejarCambioNuevoTalento = (e) => {
    const { name, value } = e.target;

    setNuevoTalento((actual) => {
      const actualizado = {
        ...actual,
        [name]: value,
      };

      if (name === "FechaNacimiento" && value) {
        actualizado.AnioNacimiento = "";
      }

      return actualizado;
    });
  };

  const cambiarEstadoNuevoTalento = (e) => {
    const estaVivo = e.target.value === "true";

    setNuevoTalento((actual) => ({
      ...actual,
      EstaVivo: estaVivo,
      FechaFallecimiento: estaVivo ? "" : actual.FechaFallecimiento,
    }));
  };

  const manejarFotoNuevoTalento = (e) => {
    const archivo = e.target.files?.[0];

    if (!archivo) return;

    setNuevoTalento((actual) => ({
      ...actual,
      FotoLocal: archivo,
      FotoUrl: URL.createObjectURL(archivo),
    }));
  };

  const manejarParticipacionNuevoTalento = (e) => {
    const { name, value } = e.target;

    setNuevoTalento((actual) => ({
      ...actual,
      [name]: value,
    }));
  };

  const descargarFotoComoArchivo = async (url, tmdbId) => {
    if (!url || url.startsWith("blob:")) return null;

    try {
      const response = await fetch(url);

      if (!response.ok) return null;

      const blob = await response.blob();

      return new File([blob], `tmdb-persona-${tmdbId}.jpg`, {
        type: blob.type || "image/jpeg",
      });
    } catch (error) {
      console.warn("No se pudo descargar la fotografía:", error);

      return null;
    }
  };

  const guardarNuevoTalento = async (e) => {
    e.preventDefault();

    if (!nuevoTalento.Nombres.trim()) {
      alert("Debe indicar los nombres del talento");
      return;
    }

    if (!nuevoTalento.EstaVivo && !nuevoTalento.FechaFallecimiento) {
      alert("Debe indicar la fecha de fallecimiento");
      return;
    }

    try {
      setGuardandoTalento(true);

      const datos = new FormData();

      datos.append("TMDbId", nuevoTalento.TMDbId || "");
      datos.append("Nombres", nuevoTalento.Nombres.trim());
      datos.append("Apellidos", nuevoTalento.Apellidos.trim());
      datos.append("NombreArtistico", nuevoTalento.NombreArtistico.trim());
      datos.append("Profesion", nuevoTalento.Profesion);
      datos.append("FechaNacimiento", nuevoTalento.FechaNacimiento || "");
      datos.append("AnioNacimiento", nuevoTalento.AnioNacimiento || "");
      datos.append("Sexo", nuevoTalento.Sexo);
      datos.append("EstaVivo", nuevoTalento.EstaVivo);
      datos.append(
        "FechaFallecimiento",
        nuevoTalento.EstaVivo ? "" : nuevoTalento.FechaFallecimiento,
      );

      let foto = nuevoTalento.FotoLocal;

      if (!foto) {
        foto = await descargarFotoComoArchivo(
          nuevoTalento.FotoUrl,
          nuevoTalento.TMDbId,
        );
      }

      if (foto) {
        datos.append("Foto", foto);
      }

      const actorResponse = await api.post("/actores", datos, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const actorCreado = actorResponse.data.actor || actorResponse.data;

      await agregarRelacion({
        actorId: actorCreado.Id,
        personaje: nuevoTalento.Personaje,
        tipoParticipacion: nuevoTalento.TipoParticipacion,
      });

      setNuevoTalento(null);

      await cargarDatos();
      await consultarRepartoTmdb();
    } catch (error) {
      console.error(error);

      alert(
        error.response?.data?.mensaje ||
          error.response?.data?.error ||
          "No fue posible crear el talento.",
      );
    } finally {
      setGuardandoTalento(false);
    }
  };

  const renderEstadoCoincidencia = (persona) => {
    if (persona.EstadoCoincidencia === "existente") {
      return <span className="badge bg-success">✅ Existe en CineRD</span>;
    }

    if (persona.EstadoCoincidencia === "posible") {
      return (
        <span className="badge bg-warning text-dark">
          ⚠️ Posible coincidencia
        </span>
      );
    }

    return <span className="badge bg-primary">➕ Nuevo talento</span>;
  };

  return (
    <div className="table-page-container">
      <Link to="/peliculas" className="btn btn-secondary mb-3">
        ← Volver a Películas
      </Link>

      <div className="mb-4">
        <h2>👥 Reparto</h2>

        {pelicula && <p className="text-muted mb-0">🎬 {pelicula.Titulo}</p>}
      </div>

      <form onSubmit={agregarActor} className="card shadow-sm mb-4">
        <div className="card-body">
          <h5 className="mb-3">➕ Agregar actor manualmente</h5>

          <div className="row g-3">
            <div className="col-12">
              <label className="form-label">Actor</label>

              <select
                name="ActorId"
                className="form-select"
                value={formulario.ActorId}
                onChange={manejarCambioParticipacion}
              >
                <option value="">Seleccione un actor</option>

                {actores.map((actor) => (
                  <option key={actor.Id} value={actor.Id}>
                    {actor.NombreCompleto}
                    {actor.NombreArtistico ? ` (${actor.NombreArtistico})` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-12">
              <ParticipacionFormFields
                valores={formulario}
                onChange={manejarCambioParticipacion}
              />
            </div>

            <div className="col-12">
              <button type="submit" className="btn btn-primary">
                Agregar
              </button>
            </div>
          </div>
        </div>
      </form>

      <div className="card shadow-sm mb-4">
        <div className="card-header bg-white fw-bold text-primary">
          🌍 Reparto disponible en TMDb
        </div>

        <div className="card-body">
          <button
            type="button"
            className="btn btn-outline-primary"
            onClick={consultarRepartoTmdb}
            disabled={consultandoTmdb}
          >
            {consultandoTmdb
              ? "Consultando..."
              : "👥 Consultar reparto en TMDb"}
          </button>

          {mensajeTmdb && (
            <div className="alert alert-info mt-3">{mensajeTmdb}</div>
          )}

          {resumenTmdb && (
            <div className="row g-3 mt-2">
              {[
                ["Total", resumenTmdb.Total],
                ["Existentes", resumenTmdb.Existentes],
                ["Posibles", resumenTmdb.Posibles],
                ["Nuevos", resumenTmdb.Nuevos],
              ].map(([texto, valor]) => (
                <div className="col-6 col-md-3" key={texto}>
                  <div className="border rounded p-3 text-center">
                    <strong>{valor}</strong>
                    <div className="small text-muted">{texto}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {repartoTmdb.length > 0 && (
            <div className="row g-3 mt-2">
              {repartoTmdb.map((persona) => {
                const actorCoincidente = persona.ActorCoincidente;

                const yaAsignado =
                  actorCoincidente?.Id &&
                  actoresEnReparto.has(Number(actorCoincidente.Id));

                return (
                  <div
                    className="col-12 col-lg-6"
                    key={`${persona.TmdbId}-${persona.Personaje}`}
                  >
                    <div className="card h-100 shadow-sm">
                      <div className="card-body d-flex gap-3">
                        {persona.FotoUrl ? (
                          <img
                            src={persona.FotoUrl}
                            alt={persona.NombreCompleto}
                            style={{
                              width: "80px",
                              height: "110px",
                              objectFit: "cover",
                              borderRadius: "8px",
                            }}
                          />
                        ) : (
                          <div
                            className="bg-light border rounded d-flex align-items-center justify-content-center"
                            style={{
                              width: "80px",
                              height: "110px",
                            }}
                          >
                            🎭
                          </div>
                        )}

                        <div className="flex-grow-1">
                          <h6>{persona.NombreCompleto}</h6>

                          <p className="text-muted mb-2">
                            Personaje:{" "}
                            <strong>{persona.Personaje || "-"}</strong>
                          </p>

                          <div className="mb-2">
                            {renderEstadoCoincidencia(persona)}
                          </div>

                          {actorCoincidente && (
                            <p className="small">
                              Coincidencia:{" "}
                              <strong>{actorCoincidente.NombreCompleto}</strong>
                            </p>
                          )}

                          {yaAsignado ? (
                            <span className="text-success small">
                              ✅ Ya pertenece al reparto
                            </span>
                          ) : persona.EstadoCoincidencia === "nuevo" ? (
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-primary"
                              disabled={procesandoTmdbId === persona.TmdbId}
                              onClick={() => abrirCreacionTalento(persona)}
                            >
                              Crear talento
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="btn btn-sm btn-primary"
                              disabled={procesandoTmdbId === persona.TmdbId}
                              onClick={() =>
                                usarActorExistente(persona, actorCoincidente)
                              }
                            >
                              Usar actor existente
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="row g-4">
        {reparto.map((actor) => (
          <div className="col-12 col-sm-6 col-md-4 col-lg-3" key={actor.Id}>
            <div className="card h-100 shadow actor-card">
              <div className="text-center pt-3">
                {actor.Foto ? (
                  <img
                    src={`${API_URL}${actor.Foto}`}
                    alt={actor.NombreCompleto}
                    className="actor-photo"
                  />
                ) : (
                  <div className="actor-photo-placeholder">🎭</div>
                )}
              </div>

              <div className="card-body text-center">
                <h5>{actor.NombreCompleto}</h5>

                <p className="text-muted">
                  {actor.NombreArtistico || "Sin nombre artístico"}
                </p>

                <p>
                  Personaje: <strong>{actor.Personaje || "-"}</strong>
                </p>

                <span
                  className={`badge ${obtenerClaseParticipacion(
                    actor.TipoParticipacion,
                  )}`}
                >
                  {obtenerTextoParticipacion(actor.TipoParticipacion)}
                </span>
              </div>

              <div className="card-footer bg-white border-0">
                <div className="d-flex gap-2">
                  <button
                    type="button"
                    className="btn btn-warning btn-sm w-50"
                    onClick={() => abrirEdicion(actor)}
                  >
                    ✏️ Editar
                  </button>

                  <button
                    type="button"
                    className="btn btn-danger btn-sm w-50"
                    onClick={() => eliminarDelReparto(actor.Id)}
                  >
                    🗑️ Quitar
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {editando && (
        <div
          className="modal fade show"
          style={{
            display: "block",
            backgroundColor: "rgba(0,0,0,.5)",
          }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <form onSubmit={guardarEdicion}>
                <div className="modal-header">
                  <h5 className="modal-title">✏️ Editar participación</h5>

                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setEditando(null)}
                  />
                </div>

                <div className="modal-body">
                  <p>
                    Actor: <strong>{editando.NombreCompleto}</strong>
                  </p>

                  <ParticipacionFormFields
                    valores={editando}
                    onChange={manejarCambioEdicion}
                    columnas={false}
                  />
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setEditando(null)}
                  >
                    Cancelar
                  </button>

                  <button type="submit" className="btn btn-primary">
                    Guardar cambios
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {nuevoTalento && (
        <div
          className="modal fade show"
          style={{
            display: "block",
            backgroundColor: "rgba(0,0,0,.5)",
          }}
        >
          <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content">
              <form onSubmit={guardarNuevoTalento}>
                <div className="modal-header">
                  <h5 className="modal-title">➕ Crear talento desde TMDb</h5>

                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setNuevoTalento(null)}
                  />
                </div>

                <div className="modal-body">
                  <ActorFormFields
                    formulario={nuevoTalento}
                    onChange={manejarCambioNuevoTalento}
                    onChangeEstadoVida={cambiarEstadoNuevoTalento}
                    onFotoChange={manejarFotoNuevoTalento}
                    vistaPrevia={nuevoTalento.FotoUrl}
                  />

                  <hr className="my-4" />

                  <h6 className="mb-3">Participación en la película</h6>

                  <ParticipacionFormFields
                    valores={nuevoTalento}
                    onChange={manejarParticipacionNuevoTalento}
                  />
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setNuevoTalento(null)}
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={guardandoTalento}
                  >
                    {guardandoTalento
                      ? "Guardando..."
                      : "Crear y agregar al reparto"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RepartoPelicula;
