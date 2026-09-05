import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

function RecuperarPassword() {
  const [email, setEmail] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const enviar = async (e) => {
    e.preventDefault();
    try {
      setCargando(true); setError(""); setMensaje("");
      const r = await api.post("/auth/password/solicitar", { email });
      setMensaje(r.data.mensaje);
    } catch (err) {
      setError(err.response?.data?.mensaje || "No fue posible procesar la solicitud");
    } finally { setCargando(false); }
  };

  return <section className="cine-auth-shell">
    <aside className="cine-auth-brand"><img src="/logo.png" alt="CineRD" className="cine-auth-logo"/><small>Seguridad de cuenta</small><h1>Recupera tu acceso a CineRD.</h1><p>Te enviaremos un enlace de un solo uso si existe una cuenta activa con ese correo.</p></aside>
    <div className="cine-auth-panel"><div className="cine-auth-panel-inner"><h2>Recuperar contraseña</h2>
      {mensaje && <div className="alert alert-success">{mensaje}</div>}{error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={enviar}><div className="cine-field"><label>Correo electrónico</label><input type="email" autoComplete="email" required value={email} onChange={(e)=>setEmail(e.target.value)}/></div><button className="cine-submit" disabled={cargando}>{cargando ? "Enviando..." : "Enviar instrucciones"}</button></form>
      <p className="cine-auth-switch"><Link to="/login">Volver al inicio de sesión</Link></p>
    </div></div>
  </section>;
}
export default RecuperarPassword;
