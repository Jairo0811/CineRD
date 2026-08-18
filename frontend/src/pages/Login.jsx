import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function Login() {
  const navigate = useNavigate();
  const [formulario, setFormulario] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const enviar = async (e) => {
    e.preventDefault();
    try {
      setCargando(true);
      setError("");
      const response = await api.post("/auth/login", formulario);
      localStorage.setItem("cineRdAccessToken", response.data.accessToken);
      localStorage.setItem("cineRdUsuario", JSON.stringify(response.data.usuario));
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.mensaje || "No fue posible iniciar sesión");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="form-page-container" style={{ maxWidth: "520px" }}>
      <div className="card shadow">
        <div className="card-body p-4">
          <h1 className="h3 mb-2">Iniciar sesión</h1>
          <p className="text-muted">Accede a CineRD para gestionar tu cuenta o reclamar un perfil artístico.</p>
          {error && <div className="alert alert-danger">{error}</div>}
          <form onSubmit={enviar}>
            <div className="mb-3">
              <label className="form-label">Correo electrónico</label>
              <input className="form-control" type="email" required value={formulario.email}
                onChange={(e) => setFormulario({ ...formulario, email: e.target.value })} />
            </div>
            <div className="mb-3">
              <label className="form-label">Contraseña</label>
              <input className="form-control" type="password" required value={formulario.password}
                onChange={(e) => setFormulario({ ...formulario, password: e.target.value })} />
            </div>
            <button className="btn btn-primary w-100" disabled={cargando}>
              {cargando ? "Ingresando..." : "Ingresar"}
            </button>
          </form>
          <p className="text-center mt-3 mb-0">¿No tienes cuenta? <Link to="/registro">Crear cuenta</Link></p>
        </div>
      </div>
    </div>
  );
}

export default Login;
