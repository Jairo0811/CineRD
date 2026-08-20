import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";

const TIPOS = [
  ["DIRECTOR", "Dirección"],
  ["PRODUCTOR", "Producción"],
  ["GUIONISTA", "Guion"],
  ["ACTOR", "Interpretación"],
  ["COMPOSITOR", "Música"],
  ["FOTOGRAFIA", "Fotografía"],
  ["EDICION", "Edición"],
  ["OTRO", "Otro"],
];

function PeliculaCreditosPanel({ peliculaId }) {
  const [talentos, setTalentos] = useState([]);
  const [creditos, setCreditos] = useState([]);
  const [form, setForm] = useState({ ActorId: "", TipoCredito: "DIRECTOR", Personaje: "", Orden: "", EsPrincipal: false, Fuente: "CineRD" });
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");

  const cargar = async () => {
    try {
      setCargando(true);
      const [talentosRes, creditosRes] = await Promise.all([
        api.get("/actores", { params: { orden: "az" } }),
        api.get(`/peliculas/${peliculaId}/creditos`),
      ]);
      setTalentos(talentosRes.data || []);
      setCreditos(creditosRes.data || []);
    } catch (error) {
      console.error(error);
      setMensaje(error.response?.data?.mensaje || "No fue posible cargar los créditos profesionales.");
    } finally { setCargando(false); }
  };

  useEffect(() => { cargar(); }, [peliculaId]);

  const talentosDisponibles = useMemo(() => talentos.map((t) => ({
    ...t,
    etiqueta: t.NombreArtistico ? `${t.NombreArtistico} — ${t.NombreCompleto}` : t.NombreCompleto,
  })), [talentos]);

  const guardar = async () => {
    if (!form.ActorId) return setMensaje("Selecciona un talento.");
    try {
      setGuardando(true);
      setMensaje("");
      await api.post(`/peliculas/${peliculaId}/creditos`, {
        ...form,
        ActorId: Number(form.ActorId),
        Orden: form.Orden === "" ? null : Number(form.Orden),
      });
      setForm({ ActorId: "", TipoCredito: "DIRECTOR", Personaje: "", Orden: "", EsPrincipal: false, Fuente: "CineRD" });
      await cargar();
      setMensaje("Crédito guardado correctamente.");
    } catch (error) {
      console.error(error);
      setMensaje(error.response?.data?.mensaje || "No fue posible guardar el crédito.");
    } finally { setGuardando(false); }
  };

  const eliminar = async (credito) => {
    if (!window.confirm(`¿Eliminar el crédito de ${credito.NombreArtistico || credito.NombreCompleto}?`)) return;
    try {
      await api.delete(`/peliculas/${peliculaId}/creditos/${credito.Id}`);
      await cargar();
    } catch (error) {
      setMensaje(error.response?.data?.mensaje || "No fue posible eliminar el crédito.");
    }
  };

  return <section className="movie-credits-panel mt-4">
    <div className="movie-translation-header">
      <div>
        <span>🎬 Créditos profesionales</span>
        <h3>Equipo creativo y artístico</h3>
        <p>Relaciona talentos reales con dirección, producción, guion y otros créditos. Esto reemplazará progresivamente los campos de texto históricos.</p>
      </div>
      <span className="movie-translation-language">{creditos.length}</span>
    </div>

    <div className="movie-translation-body">
      {cargando ? <div className="py-3 text-center text-muted">Cargando créditos...</div> : <>
        <div className="row g-3">
          <div className="col-12 col-lg-5">
            <label className="form-label">Talento</label>
            <select className="form-select" value={form.ActorId} onChange={(e)=>setForm((x)=>({...x,ActorId:e.target.value}))}>
              <option value="">Selecciona un talento</option>
              {talentosDisponibles.map((t)=><option key={t.Id} value={t.Id}>{t.etiqueta}</option>)}
            </select>
          </div>
          <div className="col-12 col-md-6 col-lg-3">
            <label className="form-label">Tipo de crédito</label>
            <select className="form-select" value={form.TipoCredito} onChange={(e)=>setForm((x)=>({...x,TipoCredito:e.target.value}))}>
              {TIPOS.map(([v,l])=><option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <div className="col-12 col-md-3 col-lg-2">
            <label className="form-label">Orden</label>
            <input type="number" min="1" className="form-control" value={form.Orden} onChange={(e)=>setForm((x)=>({...x,Orden:e.target.value}))}/>
          </div>
          <div className="col-12 col-md-3 col-lg-2 d-flex align-items-end">
            <button type="button" className="btn btn-outline-primary w-100" onClick={guardar} disabled={guardando}>{guardando ? "Guardando..." : "Añadir"}</button>
          </div>
        </div>

        {form.TipoCredito === "ACTOR" && <div className="mt-3"><label className="form-label">Personaje</label><input className="form-control" value={form.Personaje} onChange={(e)=>setForm((x)=>({...x,Personaje:e.target.value}))} placeholder="Nombre del personaje"/></div>}

        <div className="form-check mt-3"><input id="creditoPrincipal" className="form-check-input" type="checkbox" checked={form.EsPrincipal} onChange={(e)=>setForm((x)=>({...x,EsPrincipal:e.target.checked}))}/><label htmlFor="creditoPrincipal" className="form-check-label">Crédito principal</label></div>

        {mensaje && <div className={`alert mt-3 ${mensaje.includes("correctamente") ? "alert-success" : "alert-info"}`}>{mensaje}</div>}

        <div className="movie-credits-list mt-3">
          {creditos.length === 0 ? <div className="text-muted py-3">Todavía no hay créditos estructurados registrados.</div> : creditos.map((c)=><div className="movie-credit-row" key={c.Id}>
            <div>
              <strong>{c.NombreArtistico || c.NombreCompleto}</strong>
              <span>{TIPOS.find(([v])=>v===c.TipoCredito)?.[1] || c.TipoCredito}{c.Personaje ? ` · ${c.Personaje}` : ""}</span>
            </div>
            <button type="button" className="btn btn-sm btn-outline-danger" onClick={()=>eliminar(c)}>Eliminar</button>
          </div>)}
        </div>
      </>}
    </div>
  </section>;
}

export default PeliculaCreditosPanel;
