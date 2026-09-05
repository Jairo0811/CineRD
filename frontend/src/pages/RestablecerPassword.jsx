import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../services/api";

function RestablecerPassword() {
  const [params] = useSearchParams();
  const token = params.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirmacion, setConfirmacion] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const enviar = async (e) => {
    e.preventDefault();
    if (password !== confirmacion) return setError("Las contraseñas no coinciden");
    try {
      setCargando(true); setError("");
      const r = await api.post("/auth/password/restablecer", { token, password });
      setMensaje(r.data.mensaje);
    } catch (err) {
      setError(err.response?.data?.mensaje || "No fue posible restablecer la contraseña");
    } finally { setCargando(false); }
  };

  return <section className="cine-auth-shell">
    <aside className="cine-auth-brand"><img src="/logo.png" alt="CineRD" className="cine-auth-logo"/><small>Seguridad de cuenta</small><h1>Define una nueva contraseña.</h1><p>El cambio revocará todas las sesiones activas de tu cuenta.</p></aside>
    <div className="cine-auth-panel"><div className="cine-auth-panel-inner"><h2>Restablecer contraseña</h2>
      {!token && <div className="alert alert-danger">El enlace no contiene un token válido.</div>}{mensaje && <div className="alert alert-success">{mensaje} <Link to="/login">Iniciar sesión</Link></div>}{error && <div className="alert alert-danger">{error}</div>}
      {!mensaje && <form onSubmit={enviar}><div className="cine-field"><label>Nueva contraseña</label><input type="password" minLength="8" autoComplete="new-password" required value={password} onChange={(e)=>setPassword(e.target.value)}/></div><div className="cine-field"><label>Confirmar contraseña</label><input type="password" minLength="8" autoComplete="new-password" required value={confirmacion} onChange={(e)=>setConfirmacion(e.target.value)}/></div><button className="cine-submit" disabled={cargando || !token}>{cargando ? "Actualizando..." : "Cambiar contraseña"}</button></form>}
    </div></div>
  </section>;
}
export default RestablecerPassword;
