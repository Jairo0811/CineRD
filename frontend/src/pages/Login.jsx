import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import api from "../services/api";

function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sesionExpirada = searchParams.get("session") === "expired";
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
      navigate("/dashboard");
      window.location.reload();
    } catch (err) {
      setError(err.response?.data?.mensaje || "No fue posible iniciar sesión");
    } finally {
      setCargando(false);
    }
  };

  return <section className="cine-auth-shell">
    <aside className="cine-auth-brand">
      <img src="/logo.png" alt="CineRD" className="cine-auth-logo" />
      <small>Archivo cinematográfico dominicano</small>
      <h1>Tu acceso a la memoria del cine dominicano.</h1>
      <p>Explora producciones, consulta talentos y administra tu identidad profesional dentro de CineRD.</p>
    </aside>
    <div className="cine-auth-panel"><div className="cine-auth-panel-inner">
      <h2>Bienvenido de nuevo</h2>
      <p className="lead-copy">Inicia sesión para acceder a tu espacio personalizado.</p>
      {sesionExpirada && !error && <div className="alert alert-warning">Tu sesión expiró por seguridad. Inicia sesión nuevamente para continuar.</div>}
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={enviar}>
        <div className="cine-field"><label>Correo electrónico</label><input type="email" autoComplete="email" required value={formulario.email} onChange={(e)=>setFormulario({...formulario,email:e.target.value})}/></div>
        <div className="cine-field"><label>Contraseña</label><input type="password" autoComplete="current-password" required value={formulario.password} onChange={(e)=>setFormulario({...formulario,password:e.target.value})}/></div>
        <button className="cine-submit" disabled={cargando}>{cargando ? "Ingresando..." : "Ingresar a CineRD"}</button>
      </form>
      <p className="cine-auth-switch">¿No tienes cuenta? <Link to="/registro">Crear cuenta</Link></p>
    </div></div>
  </section>;
}
export default Login;
