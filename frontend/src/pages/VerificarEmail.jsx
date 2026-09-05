import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../services/api";

function VerificarEmail() {
  const [params] = useSearchParams();
  const token = params.get("token") || "";
  const [estado, setEstado] = useState({ cargando: true, mensaje: "", error: "" });

  useEffect(() => {
    let activo = true;
    const verificar = async () => {
      if (!token) return setEstado({ cargando: false, mensaje: "", error: "El enlace no contiene un token válido." });
      try {
        const r = await api.post("/auth/email/verificar", { token });
        if (activo) setEstado({ cargando: false, mensaje: r.data.mensaje, error: "" });
      } catch (err) {
        if (activo) setEstado({ cargando: false, mensaje: "", error: err.response?.data?.mensaje || "No fue posible verificar el correo" });
      }
    };
    verificar();
    return () => { activo = false; };
  }, [token]);

  return <section className="cine-auth-shell">
    <aside className="cine-auth-brand"><img src="/logo.png" alt="CineRD" className="cine-auth-logo"/><small>Identidad de cuenta</small><h1>Verificación de correo.</h1><p>Confirmar tu correo ayuda a proteger tu identidad dentro de CineRD.</p></aside>
    <div className="cine-auth-panel"><div className="cine-auth-panel-inner"><h2>Verificar correo</h2>
      {estado.cargando && <div className="alert alert-info">Verificando...</div>}
      {estado.mensaje && <div className="alert alert-success">{estado.mensaje}</div>}
      {estado.error && <div className="alert alert-danger">{estado.error}</div>}
      {!estado.cargando && <p className="cine-auth-switch"><Link to="/login">Ir al inicio de sesión</Link></p>}
    </div></div>
  </section>;
}
export default VerificarEmail;
