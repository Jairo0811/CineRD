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

  return <section className="cine-auth-shell">
    <aside className="cine-auth-brand">
      <img src="/logo.png" alt="CineRD" className="cine-auth-logo" />
      <small>Forma parte de CineRD</small>
      <h1>Descubre, conecta y preserva nuestro cine.</h1>
      <p>Crea tu cuenta para explorar el catálogo y, si perteneces al sector audiovisual, solicitar la verificación de tu perfil profesional.</p>
    </aside>
    <div className="cine-auth-panel"><div className="cine-auth-panel-inner">
      <h2>Crear cuenta</h2>
      <p className="lead-copy">Todas las cuentas nuevas comienzan con acceso de usuario y pueden evolucionar a talento verificado.</p>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={enviar}>
        <div className="cine-field"><label>Nombre</label><input autoComplete="name" required value={formulario.nombre} onChange={(e)=>setFormulario({...formulario,nombre:e.target.value})}/></div>
        <div className="cine-field"><label>Correo electrónico</label><input type="email" autoComplete="email" required value={formulario.email} onChange={(e)=>setFormulario({...formulario,email:e.target.value})}/></div>
        <div className="cine-field"><label>Contraseña</label><input type="password" autoComplete="new-password" minLength="8" required value={formulario.password} onChange={(e)=>setFormulario({...formulario,password:e.target.value})}/><small className="text-muted">Mínimo 8 caracteres.</small></div>
        <button className="cine-submit" disabled={cargando}>{cargando ? "Creando cuenta..." : "Crear mi cuenta"}</button>
      </form>
      <p className="cine-auth-switch">¿Ya tienes cuenta? <Link to="/login">Iniciar sesión</Link></p>
    </div></div>
  </section>;
}
export default Registro;