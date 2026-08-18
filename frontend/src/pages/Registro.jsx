import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function Registro() {
  const navigate = useNavigate();
  const [formulario, setFormulario] = useState({ nombre: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const enviar = async (e) => {
    e.preventDefault();
    try {
      setCargando(true);
      setError("");
      await api.post("/auth/registro", formulario);
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.mensaje || "No fue posible crear la cuenta");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="form-page-container" style={{ maxWidth: "520px" }}>
      <div className="card shadow">
        <div className="card-body p-4">
          <h1 className="h3 mb-2">Crear cuenta</h1>
          <p className="text-muted">Todas las cuentas nuevas comienzan como usuario público.</p>
          {error && <div className="alert alert-danger">{error}</div>}
          <form onSubmit={enviar}>
            <div className="mb-3">
              <label className="form-label">Nombre</label>
              <input className="form-control" required value={formulario.nombre}
                onChange={(e) => setFormulario({ ...formulario, nombre: e.target.value })} />
            </div>
            <div className="mb-3">
              <label className="form-label">Correo electrónico</label>
              <input className="form-control" type="email" required value={formulario.email}
                onChange={(e) => setFormulario({ ...formulario, email: e.target.value })} />
            </div>
            <div className="mb-3">
              <label className="form-label">Contraseña</label>
              <input className="form-control" type="password" minLength="8" required value={formulario.password}
                onChange={(e) => setFormulario({ ...formulario, password: e.target.value })} />
              <small className="text-muted">Mínimo 8 caracteres.</small>
            </div>
            <button className="btn btn-primary w-100" disabled={cargando}>
              {cargando ? "Creando..." : "Crear cuenta"}
            </button>
          </form>
          <p className="text-center mt-3 mb-0">¿Ya tienes cuenta? <Link to="/login">Iniciar sesión</Link></p>
        </div>
      </div>
    </div>
  );
}

export default Registro;
