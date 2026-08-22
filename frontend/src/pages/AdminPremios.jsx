import { useEffect, useMemo, useState } from "react";
import api from "../services/api";

const premioInicial = {
  Id: null,
  Nombre: "",
  Organizacion: "",
  Pais: "",
  SitioWeb: "",
};

const nominacionInicial = {
  Id: null,
  PremioId: "",
  Categoria: "",
  Anio: new Date().getFullYear(),
  TipoEntidad: "pelicula",
  PeliculaId: "",
  ActorId: "",
  Resultado: "NOMINADO",
  Detalle: "",
  FuenteUrl: "",
};

function AdminPremios() {
  const [premios, setPremios] = useState([]);
  const [nominaciones, setNominaciones] = useState([]);
  const [peliculas, setPeliculas] = useState([]);
  const [actores, setActores] = useState([]);
  const [premio, setPremio] = useState(premioInicial);
  const [nominacion, setNominacion] = useState(nominacionInicial);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");

  const cargarDatos = async () => {
    try {
      setCargando(true);
      setMensaje("");
      const [premiosRes, nominacionesRes, peliculasRes, actoresRes] = await Promise.all([
        api.get("/premios"),
        api.get("/premios/nominaciones"),
        api.get("/peliculas"),
        api.get("/actores"),
      ]);

      setPremios(premiosRes.data || []);
      setNominaciones(nominacionesRes.data || []);
      setPeliculas(peliculasRes.data || []);
      setActores(actoresRes.data || []);
    } catch (error) {
      console.error(error);
      setMensaje(error.response?.data?.mensaje || "No fue posible cargar premios y nominaciones.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const resumen = useMemo(() => ({
    premios: premios.length,
    nominaciones: nominaciones.length,
    ganadores: nominaciones.filter((item) => item.Resultado === "GANADOR").length,
  }), [premios, nominaciones]);

  const manejarPremio = (event) => {
    const { name, value } = event.target;
    setPremio((actual) => ({ ...actual, [name]: value }));
  };

  const manejarNominacion = (event) => {
    const { name, value } = event.target;
    setNominacion((actual) => {
      const siguiente = { ...actual, [name]: value };
      if (name === "TipoEntidad") {
        siguiente.PeliculaId = "";
        siguiente.ActorId = "";
      }
      return siguiente;
    });
  };

  const guardarPremio = async (event) => {
    event.preventDefault();
    if (!premio.Nombre.trim()) return;

    try {
      setGuardando(true);
      setMensaje("");
      const payload = {
        Nombre: premio.Nombre.trim(),
        Organizacion: premio.Organizacion.trim(),
        Pais: premio.Pais.trim(),
        SitioWeb: premio.SitioWeb.trim(),
      };

      if (premio.Id) {
        await api.put(`/premios/${premio.Id}`, payload);
      } else {
        await api.post("/premios", payload);
      }

      setPremio(premioInicial);
      await cargarDatos();
    } catch (error) {
      console.error(error);
      setMensaje(error.response?.data?.mensaje || "No fue posible guardar el premio.");
    } finally {
      setGuardando(false);
    }
  };

  const editarPremio = (item) => {
    setPremio({
      Id: item.Id,
      Nombre: item.Nombre || "",
      Organizacion: item.Organizacion || "",
      Pais: item.Pais || "",
      SitioWeb: item.SitioWeb || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const eliminarPremio = async (id) => {
    if (!window.confirm("¿Eliminar este premio y todas sus nominaciones?")) return;
    try {
      await api.delete(`/premios/${id}`);
      await cargarDatos();
    } catch (error) {
      console.error(error);
      setMensaje(error.response?.data?.mensaje || "No fue posible eliminar el premio.");
    }
  };

  const guardarNominacion = async (event) => {
    event.preventDefault();

    const payload = {
      PremioId: Number(nominacion.PremioId),
      Categoria: nominacion.Categoria.trim(),
      Anio: Number(nominacion.Anio),
      PeliculaId: nominacion.TipoEntidad === "pelicula" ? Number(nominacion.PeliculaId) || null : null,
      ActorId: nominacion.TipoEntidad === "talento" ? Number(nominacion.ActorId) || null : null,
      Resultado: nominacion.Resultado,
      Detalle: nominacion.Detalle.trim(),
      FuenteUrl: nominacion.FuenteUrl.trim(),
    };

    try {
      setGuardando(true);
      setMensaje("");
      if (nominacion.Id) {
        await api.put(`/premios/nominaciones/${nominacion.Id}`, payload);
      } else {
        await api.post("/premios/nominaciones", payload);
      }
      setNominacion(nominacionInicial);
      await cargarDatos();
    } catch (error) {
      console.error(error);
      setMensaje(error.response?.data?.mensaje || "No fue posible guardar la nominación.");
    } finally {
      setGuardando(false);
    }
  };

  const editarNominacion = (item) => {
    setNominacion({
      Id: item.Id,
      PremioId: String(item.PremioId || ""),
      Categoria: item.Categoria || "",
      Anio: item.Anio || new Date().getFullYear(),
      TipoEntidad: item.ActorId ? "talento" : "pelicula",
      PeliculaId: item.PeliculaId ? String(item.PeliculaId) : "",
      ActorId: item.ActorId ? String(item.ActorId) : "",
      Resultado: item.Resultado || "NOMINADO",
      Detalle: item.Detalle || "",
      FuenteUrl: item.FuenteUrl || "",
    });
    document.getElementById("form-nominacion")?.scrollIntoView({ behavior: "smooth" });
  };

  const eliminarNominacion = async (id) => {
    if (!window.confirm("¿Eliminar esta nominación?")) return;
    try {
      await api.delete(`/premios/nominaciones/${id}`);
      await cargarDatos();
    } catch (error) {
      console.error(error);
      setMensaje(error.response?.data?.mensaje || "No fue posible eliminar la nominación.");
    }
  };

  return (
    <div className="table-page-container">
      <header className="mb-4">
        <span className="text-uppercase text-muted small fw-semibold">Fase 8 · Enriquecimiento del catálogo</span>
        <h1 className="mt-2 mb-2">🏆 Premios y nominaciones</h1>
        <p className="text-muted mb-0">Administra reconocimientos obtenidos por películas y talentos de CineRD.</p>
      </header>

      <section className="row g-3 mb-4">
        <div className="col-12 col-md-4"><div className="card h-100 shadow-sm"><div className="card-body"><small className="text-muted">Premios</small><div className="display-6 fw-bold">{resumen.premios}</div></div></div></div>
        <div className="col-12 col-md-4"><div className="card h-100 shadow-sm"><div className="card-body"><small className="text-muted">Nominaciones</small><div className="display-6 fw-bold">{resumen.nominaciones}</div></div></div></div>
        <div className="col-12 col-md-4"><div className="card h-100 shadow-sm"><div className="card-body"><small className="text-muted">Ganadores</small><div className="display-6 fw-bold">{resumen.ganadores}</div></div></div></div>
      </section>

      {mensaje && <div className="alert alert-warning">{mensaje}</div>}

      <section className="card shadow-sm mb-4">
        <div className="card-body">
          <h2 className="h5">{premio.Id ? "Editar premio" : "Registrar premio"}</h2>
          <form onSubmit={guardarPremio} className="row g-3">
            <div className="col-12 col-md-6"><label className="form-label">Nombre *</label><input className="form-control" name="Nombre" value={premio.Nombre} onChange={manejarPremio} required /></div>
            <div className="col-12 col-md-6"><label className="form-label">Organización</label><input className="form-control" name="Organizacion" value={premio.Organizacion} onChange={manejarPremio} /></div>
            <div className="col-12 col-md-4"><label className="form-label">País</label><input className="form-control" name="Pais" value={premio.Pais} onChange={manejarPremio} /></div>
            <div className="col-12 col-md-8"><label className="form-label">Sitio web oficial</label><input className="form-control" type="url" name="SitioWeb" value={premio.SitioWeb} onChange={manejarPremio} /></div>
            <div className="col-12 d-flex gap-2"><button className="btn btn-primary" disabled={guardando}>{guardando ? "Guardando..." : premio.Id ? "Actualizar" : "Registrar"}</button>{premio.Id && <button type="button" className="btn btn-outline-secondary" onClick={() => setPremio(premioInicial)}>Cancelar</button>}</div>
          </form>
        </div>
      </section>

      <section className="card shadow-sm mb-4">
        <div className="card-body">
          <h2 className="h5">Premios registrados</h2>
          {cargando ? <div className="text-center py-3"><div className="spinner-border" role="status" /></div> : (
            <div className="table-responsive"><table className="table align-middle"><thead><tr><th>Premio</th><th>Organización</th><th>Nominaciones</th><th>Ganadores</th><th></th></tr></thead><tbody>{premios.map((item) => <tr key={item.Id}><td><strong>{item.Nombre}</strong><div className="small text-muted">{item.Pais || "—"}</div></td><td>{item.Organizacion || "—"}</td><td>{item.CantidadNominaciones || 0}</td><td>{item.CantidadGanadores || 0}</td><td className="text-end"><button className="btn btn-sm btn-outline-primary me-2" onClick={() => editarPremio(item)}>Editar</button><button className="btn btn-sm btn-outline-danger" onClick={() => eliminarPremio(item.Id)}>Eliminar</button></td></tr>)}</tbody></table></div>
          )}
        </div>
      </section>

      <section className="card shadow-sm mb-4" id="form-nominacion">
        <div className="card-body">
          <h2 className="h5">{nominacion.Id ? "Editar nominación" : "Registrar nominación"}</h2>
          <form onSubmit={guardarNominacion} className="row g-3">
            <div className="col-12 col-md-6"><label className="form-label">Premio *</label><select className="form-select" name="PremioId" value={nominacion.PremioId} onChange={manejarNominacion} required><option value="">Seleccione...</option>{premios.map((item) => <option key={item.Id} value={item.Id}>{item.Nombre}</option>)}</select></div>
            <div className="col-12 col-md-4"><label className="form-label">Categoría *</label><input className="form-control" name="Categoria" value={nominacion.Categoria} onChange={manejarNominacion} placeholder="Ej. Mejor película" required /></div>
            <div className="col-12 col-md-2"><label className="form-label">Año *</label><input className="form-control" type="number" min="1900" max="2200" name="Anio" value={nominacion.Anio} onChange={manejarNominacion} required /></div>
            <div className="col-12 col-md-3"><label className="form-label">Reconocimiento para</label><select className="form-select" name="TipoEntidad" value={nominacion.TipoEntidad} onChange={manejarNominacion}><option value="pelicula">Película</option><option value="talento">Talento</option></select></div>
            <div className="col-12 col-md-6">{nominacion.TipoEntidad === "pelicula" ? <><label className="form-label">Película *</label><select className="form-select" name="PeliculaId" value={nominacion.PeliculaId} onChange={manejarNominacion} required><option value="">Seleccione...</option>{peliculas.map((item) => <option key={item.Id} value={item.Id}>{item.Titulo}</option>)}</select></> : <><label className="form-label">Talento *</label><select className="form-select" name="ActorId" value={nominacion.ActorId} onChange={manejarNominacion} required><option value="">Seleccione...</option>{actores.map((item) => <option key={item.Id} value={item.Id}>{item.NombreArtistico || item.NombreCompleto}</option>)}</select></>}</div>
            <div className="col-12 col-md-3"><label className="form-label">Resultado</label><select className="form-select" name="Resultado" value={nominacion.Resultado} onChange={manejarNominacion}><option value="NOMINADO">Nominado</option><option value="GANADOR">🏆 Ganador</option></select></div>
            <div className="col-12 col-md-6"><label className="form-label">Detalle</label><input className="form-control" name="Detalle" value={nominacion.Detalle} onChange={manejarNominacion} placeholder="Ceremonia, edición o nota adicional" /></div>
            <div className="col-12 col-md-6"><label className="form-label">Fuente</label><input className="form-control" type="url" name="FuenteUrl" value={nominacion.FuenteUrl} onChange={manejarNominacion} placeholder="https://..." /></div>
            <div className="col-12 d-flex gap-2"><button className="btn btn-primary" disabled={guardando}>{guardando ? "Guardando..." : nominacion.Id ? "Actualizar nominación" : "Registrar nominación"}</button>{nominacion.Id && <button type="button" className="btn btn-outline-secondary" onClick={() => setNominacion(nominacionInicial)}>Cancelar</button>}</div>
          </form>
        </div>
      </section>

      <section className="card shadow-sm">
        <div className="card-body">
          <h2 className="h5">Historial de nominaciones</h2>
          <div className="table-responsive"><table className="table align-middle"><thead><tr><th>Año</th><th>Premio</th><th>Categoría</th><th>Película / talento</th><th>Resultado</th><th></th></tr></thead><tbody>{nominaciones.map((item) => <tr key={item.Id}><td>{item.Anio}</td><td>{item.Premio}</td><td>{item.Categoria}</td><td>{item.Pelicula || item.Talento || "—"}</td><td><span className={`badge ${item.Resultado === "GANADOR" ? "bg-success" : "bg-secondary"}`}>{item.Resultado === "GANADOR" ? "🏆 Ganador" : "Nominado"}</span></td><td className="text-end"><button className="btn btn-sm btn-outline-primary me-2" onClick={() => editarNominacion(item)}>Editar</button><button className="btn btn-sm btn-outline-danger" onClick={() => eliminarNominacion(item.Id)}>Eliminar</button></td></tr>)}</tbody></table></div>
        </div>
      </section>
    </div>
  );
}

export default AdminPremios;
