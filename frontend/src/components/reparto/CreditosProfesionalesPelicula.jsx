import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";

const TIPOS = [
  ["DIRECTOR", "Dirección"],
  ["DIRECTOR_CASTING", "Director de casting"],
  ["PRODUCTOR", "Producción"],
  ["GUIONISTA", "Guion"],
  ["COMPOSITOR", "Música / composición"],
  ["FOTOGRAFIA", "Dirección de fotografía"],
  ["EDICION", "Edición"],
  ["OTRO", "Otro crédito"],
];

const ETIQUETAS = Object.fromEntries(TIPOS);

const estadoInicial = {
  ActorId: "",
  TipoCredito: "DIRECTOR_CASTING",
  Orden: "",
  EsPrincipal: false,
  Fuente: "CREDITOS_OFICIALES",
};

function CreditosProfesionalesPelicula({ peliculaId, actores = [] }) {
  const [creditos, setCreditos] = useState([]);
  const [form, setForm] = useState(estadoInicial);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  const cargar = async () => {
    try {
      setCargando(true);
      const { data } = await api.get(`/peliculas/${peliculaId}/creditos`);
      setCreditos(data || []);
    } catch (e) {
      console.error(e);
      setError(e.response?.data?.mensaje || "No fue posible cargar los créditos profesionales");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (peliculaId) cargar();
  }, [peliculaId]);

  const creditosProfesionales = useMemo(
    () => creditos.filter((credito) => credito.TipoCredito !== "ACTOR"),
    [creditos],
  );

  const cambiar = (campo, valor) => {
    setForm((actual) => ({ ...actual, [campo]: valor }));
  };

  const guardar = async (event) => {
    event.preventDefault();
    if (!form.ActorId) {
      setError("Selecciona un talento");
      return;
    }

    try {
      setGuardando(true);
      setError("");
      await api.post(`/peliculas/${peliculaId}/creditos`, {
        ActorId: Number(form.ActorId),
        TipoCredito: form.TipoCredito,
        Orden: form.Orden === "" ? null : Number(form.Orden),
        EsPrincipal: form.EsPrincipal,
        Fuente: form.Fuente.trim() || null,
        CreditoVerificado: true,
        FuenteCredito: "CREDITOS_OFICIALES",
      });
      setForm(estadoInicial);
      await cargar();
    } catch (e) {
      console.error(e);
      setError(e.response?.data?.mensaje || "No fue posible guardar el crédito profesional");
    } finally {
      setGuardando(false);
    }
  };

  const eliminar = async (credito) => {
    const nombre = credito.NombreArtistico || credito.NombreCompleto;
    if (!window.confirm(`¿Eliminar el crédito ${ETIQUETAS[credito.TipoCredito] || credito.TipoCredito} de ${nombre}?`)) return;

    try {
      setError("");
      await api.delete(`/peliculas/${peliculaId}/creditos/${credito.Id}`);
      await cargar();
    } catch (e) {
      console.error(e);
      setError(e.response?.data?.mensaje || "No fue posible eliminar el crédito profesional");
    }
  };

  return (
    <section className="card shadow-sm mb-4">
      <div className="card-body p-4">
        <div className="d-flex flex-wrap justify-content-between align-items-start gap-2 mb-3">
          <div>
            <span className="catalog-eyebrow">CRÉDITOS</span>
            <h3 className="h5 mb-1">Créditos profesionales</h3>
            <p className="text-muted small mb-0">
              Registra funciones adicionales del talento en esta película sin alterar su participación como intérprete.
            </p>
          </div>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={guardar} className="row g-3 mb-4">
          <div className="col-12 col-lg-5">
            <label className="form-label">Talento</label>
            <select className="form-select" value={form.ActorId} onChange={(e) => cambiar("ActorId", e.target.value)} required>
              <option value="">Seleccionar...</option>
              {actores.map((actor) => (
                <option key={actor.Id} value={actor.Id}>
                  {actor.NombreArtistico || actor.NombreCompleto}
                </option>
              ))}
            </select>
          </div>

          <div className="col-12 col-md-6 col-lg-3">
            <label className="form-label">Tipo de crédito</label>
            <select className="form-select" value={form.TipoCredito} onChange={(e) => cambiar("TipoCredito", e.target.value)}>
              {TIPOS.map(([valor, etiqueta]) => <option key={valor} value={valor}>{etiqueta}</option>)}
            </select>
          </div>

          <div className="col-6 col-md-3 col-lg-2">
            <label className="form-label">Orden</label>
            <input className="form-control" type="number" min="0" value={form.Orden} onChange={(e) => cambiar("Orden", e.target.value)} />
          </div>

          <div className="col-6 col-md-3 col-lg-2 d-flex align-items-end">
            <div className="form-check mb-2">
              <input className="form-check-input" type="checkbox" id="creditoPrincipal" checked={form.EsPrincipal} onChange={(e) => cambiar("EsPrincipal", e.target.checked)} />
              <label className="form-check-label" htmlFor="creditoPrincipal">Principal</label>
            </div>
          </div>

          <div className="col-12 col-lg-8">
            <label className="form-label">Fuente</label>
            <input className="form-control" maxLength={300} value={form.Fuente} onChange={(e) => cambiar("Fuente", e.target.value)} placeholder="Ej.: CREDITOS_OFICIALES" />
            <div className="form-text">Los créditos registrados aquí por un administrador se consideran verificados contra la fuente indicada.</div>
          </div>

          <div className="col-12 col-lg-4 d-flex align-items-end">
            <button className="btn btn-primary w-100" disabled={guardando}>
              {guardando ? "Guardando..." : "Agregar crédito profesional"}
            </button>
          </div>
        </form>

        {cargando ? (
          <div className="text-center py-3"><div className="spinner-border spinner-border-sm" /></div>
        ) : creditosProfesionales.length ? (
          <div className="row g-3">
            {creditosProfesionales.map((credito) => (
              <div className="col-12 col-md-6" key={credito.Id}>
                <article className="border rounded-3 p-3 h-100 d-flex justify-content-between gap-3">
                  <div>
                    <strong className="d-block">{credito.NombreArtistico || credito.NombreCompleto}</strong>
                    <span className="text-muted small">{ETIQUETAS[credito.TipoCredito] || credito.TipoCredito}</span>
                    {credito.Fuente && <small className="d-block text-muted mt-1">Fuente: {credito.Fuente}</small>}
                    {Boolean(credito.CreditoVerificado) && <span className="badge bg-success mt-2">✓ Crédito verificado</span>}
                  </div>
                  <button type="button" className="btn btn-sm btn-outline-danger align-self-start" onClick={() => eliminar(credito)}>
                    Eliminar
                  </button>
                </article>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-muted small">Todavía no hay créditos profesionales adicionales registrados.</div>
        )}
      </div>
    </section>
  );
}

export default CreditosProfesionalesPelicula;
