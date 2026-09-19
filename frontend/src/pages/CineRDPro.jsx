import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

const camposIniciales = {
  TitularProfesional: "",
  BiografiaProfesional: "",
  Ciudad: "",
  Pais: "",
  DisponibleCasting: false,
  EmailContacto: "",
  TelefonoContacto: "",
  NombreRepresentante: "",
  EmailRepresentante: "",
  TelefonoRepresentante: "",
  ReelUrl: "",
  PortfolioUrl: "",
};

function CineRDPro() {
  const [perfil, setPerfil] = useState(null);
  const [form, setForm] = useState(camposIniciales);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    api.get("/cinerd-pro/me")
      .then((response) => {
        const data = response.data;
        setPerfil(data);
        setForm({
          TitularProfesional: data.TitularProfesional || "",
          BiografiaProfesional: data.BiografiaProfesional || "",
          Ciudad: data.Ciudad || "",
          Pais: data.Pais || "",
          DisponibleCasting: Boolean(data.DisponibleCasting),
          EmailContacto: data.EmailContacto || "",
          TelefonoContacto: data.TelefonoContacto || "",
          NombreRepresentante: data.NombreRepresentante || "",
          EmailRepresentante: data.EmailRepresentante || "",
          TelefonoRepresentante: data.TelefonoRepresentante || "",
          ReelUrl: data.ReelUrl || "",
          PortfolioUrl: data.PortfolioUrl || "",
        });
      })
      .catch((error) => setMensaje(error.response?.data?.mensaje || "No fue posible cargar CineRD Pro."))
      .finally(() => setCargando(false));
  }, []);

  const esProActivo = perfil?.PlanCodigo === "PRO" && perfil?.EstadoSuscripcion === "ACTIVA";

  const cambiar = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((actual) => ({ ...actual, [name]: type === "checkbox" ? checked : value }));
  };

  const guardar = async (e) => {
    e.preventDefault();
    setMensaje("");
    try {
      setGuardando(true);
      const response = await api.put("/cinerd-pro/me", form);
      setPerfil((actual) => ({ ...actual, ...response.data.perfil }));
      setMensaje("Perfil CineRD Pro actualizado correctamente.");
    } catch (error) {
      setMensaje(error.response?.data?.mensaje || "No fue posible guardar CineRD Pro.");
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return <div className="text-center py-5"><div className="spinner-border text-primary"/><p className="mt-3 text-muted">Preparando CineRD Pro...</p></div>;
  }

  return <div className="table-page-container">
    <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
      <div>
        <span className="catalog-eyebrow">CINERD PRO</span>
        <h1 className="h2 mb-1">Perfil profesional ampliado</h1>
        <p className="text-muted mb-0">Presenta tu trayectoria, reel, contacto profesional y disponibilidad para casting.</p>
      </div>
      <Link to="/dashboard" className="btn btn-outline-secondary">← Volver al dashboard</Link>
    </div>

    {!esProActivo && <div className="alert alert-primary border mb-4">
      <h2 className="h5">CineRD Pro todavía no está activo en tu cuenta</h2>
      <p className="mb-2">Tu identidad verificada permanece intacta. La suscripción Pro será una capa comercial separada con herramientas profesionales adicionales.</p>
      <small>Estado actual: <strong>{perfil?.PlanCodigo || "FREE"} / {perfil?.EstadoSuscripcion || "INACTIVA"}</strong>.</small>
    </div>}

    {esProActivo && <form className="card" onSubmit={guardar}>
      <div className="card-body p-4">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
          <div>
            <span className="badge bg-success">PRO ACTIVO</span>
            <h2 className="h5 mt-2 mb-0">{perfil?.NombreArtistico || perfil?.NombreCompleto || "Perfil profesional"}</h2>
          </div>
        </div>

        <div className="row g-3">
          <div className="col-12">
            <label className="form-label">Titular profesional</label>
            <input className="form-control" name="TitularProfesional" maxLength="180" value={form.TitularProfesional} onChange={cambiar} placeholder="Ej: Actor dominicano · Cine y televisión" />
          </div>
          <div className="col-12">
            <label className="form-label">Biografía profesional</label>
            <textarea className="form-control" rows="5" name="BiografiaProfesional" maxLength="3000" value={form.BiografiaProfesional} onChange={cambiar} placeholder="Resume experiencia, especialidades y trayectoria." />
          </div>
          <div className="col-md-6">
            <label className="form-label">Ciudad</label>
            <input className="form-control" name="Ciudad" maxLength="120" value={form.Ciudad} onChange={cambiar} />
          </div>
          <div className="col-md-6">
            <label className="form-label">País</label>
            <input className="form-control" name="Pais" maxLength="120" value={form.Pais} onChange={cambiar} />
          </div>
          <div className="col-12">
            <div className="form-check">
              <input className="form-check-input" type="checkbox" id="DisponibleCasting" name="DisponibleCasting" checked={form.DisponibleCasting} onChange={cambiar} />
              <label className="form-check-label" htmlFor="DisponibleCasting">Disponible para oportunidades de casting</label>
            </div>
          </div>

          <div className="col-md-6">
            <label className="form-label">Correo profesional</label>
            <input type="email" className="form-control" name="EmailContacto" maxLength="255" value={form.EmailContacto} onChange={cambiar} />
          </div>
          <div className="col-md-6">
            <label className="form-label">Teléfono profesional</label>
            <input className="form-control" name="TelefonoContacto" maxLength="50" value={form.TelefonoContacto} onChange={cambiar} />
          </div>

          <div className="col-12"><hr/><h3 className="h6">Representación</h3></div>
          <div className="col-md-4">
            <label className="form-label">Representante / agencia</label>
            <input className="form-control" name="NombreRepresentante" maxLength="180" value={form.NombreRepresentante} onChange={cambiar} />
          </div>
          <div className="col-md-4">
            <label className="form-label">Correo del representante</label>
            <input type="email" className="form-control" name="EmailRepresentante" maxLength="255" value={form.EmailRepresentante} onChange={cambiar} />
          </div>
          <div className="col-md-4">
            <label className="form-label">Teléfono del representante</label>
            <input className="form-control" name="TelefonoRepresentante" maxLength="50" value={form.TelefonoRepresentante} onChange={cambiar} />
          </div>

          <div className="col-md-6">
            <label className="form-label">Reel profesional</label>
            <input type="url" className="form-control" name="ReelUrl" maxLength="500" value={form.ReelUrl} onChange={cambiar} placeholder="https://..." />
          </div>
          <div className="col-md-6">
            <label className="form-label">Portfolio / sitio profesional</label>
            <input type="url" className="form-control" name="PortfolioUrl" maxLength="500" value={form.PortfolioUrl} onChange={cambiar} placeholder="https://..." />
          </div>
        </div>

        {mensaje && <div className="alert alert-info mt-4 mb-0">{mensaje}</div>}
        <div className="d-flex justify-content-end mt-4">
          <button className="btn btn-primary" disabled={guardando}>{guardando ? "Guardando..." : "Guardar perfil Pro"}</button>
        </div>
      </div>
    </form>}

    {!esProActivo && mensaje && <div className="alert alert-info">{mensaje}</div>}
  </div>;
}

export default CineRDPro;
