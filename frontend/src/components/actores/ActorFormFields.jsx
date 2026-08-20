import { PROFESIONES } from "../../constants/profesiones";

function ActorFormFields({ formulario, onChange, onChangeEstadoVida, onFotoChange, vistaPrevia, mostrarFotografia = true }) {
  const anioActual = new Date().getFullYear();

  return <>
    <div className="row g-3">
      <div className="col-12 col-md-6"><label className="form-label">Nombres</label><input type="text" name="Nombres" className="form-control" value={formulario.Nombres || ""} onChange={onChange} required /></div>
      <div className="col-12 col-md-6"><label className="form-label">Apellidos</label><input type="text" name="Apellidos" className="form-control" value={formulario.Apellidos || ""} onChange={onChange} /></div>
      <div className="col-12 col-md-6"><label className="form-label">Nombre artístico</label><input type="text" name="NombreArtistico" className="form-control" value={formulario.NombreArtistico || ""} onChange={onChange} /></div>
      <div className="col-12 col-md-6"><label className="form-label">Profesión</label><select name="Profesion" className="form-select" value={formulario.Profesion || ""} onChange={onChange}><option value="">Seleccione una profesión</option>{formulario.Profesion && !PROFESIONES.includes(formulario.Profesion) && <option value={formulario.Profesion}>{formulario.Profesion}</option>}{PROFESIONES.map((profesion)=><option key={profesion} value={profesion}>{profesion}</option>)}</select></div>
      <div className="col-12 col-md-6"><label className="form-label">Fecha de nacimiento</label><input type="date" name="FechaNacimiento" className="form-control" value={formulario.FechaNacimiento || ""} onChange={onChange}/><small className="text-muted">Utiliza este campo cuando conozcas la fecha completa.</small></div>
      <div className="col-12 col-md-6"><label className="form-label">Año de nacimiento</label><input type="number" name="AnioNacimiento" className="form-control" placeholder="Ej: 1979" min="1800" max={anioActual} value={formulario.AnioNacimiento || ""} onChange={onChange} disabled={Boolean(formulario.FechaNacimiento)}/><small className="text-muted">Úsalo solamente cuando no conozcas el día y el mes.</small></div>
      <div className="col-12 col-md-6"><label className="form-label">Sexo</label><select name="Sexo" className="form-select" value={formulario.Sexo || "Masculino"} onChange={onChange}><option value="Masculino">Masculino</option><option value="Femenino">Femenino</option></select></div>
      <div className="col-12 col-md-6"><label className="form-label">Estado</label><select name="EstaVivo" className="form-select" value={formulario.EstaVivo ? "true" : "false"} onChange={onChangeEstadoVida}><option value="true">Vivo</option><option value="false">{formulario.Sexo === "Femenino" ? "Fallecida" : "Fallecido"}</option></select></div>
      {!formulario.EstaVivo && <div className="col-12 col-md-6"><label className="form-label">Fecha de fallecimiento</label><input type="date" name="FechaFallecimiento" className="form-control" value={formulario.FechaFallecimiento || ""} onChange={onChange} required /></div>}

      <div className="col-12 mt-4"><h3 className="h6 fw-bold mb-1">Redes sociales y presencia digital</h3><p className="text-muted small mb-2">Opcional. Agrega únicamente perfiles oficiales o profesionales.</p></div>
      <div className="col-12 col-md-6"><label className="form-label">Instagram</label><input type="url" name="InstagramUrl" className="form-control" placeholder="https://instagram.com/..." value={formulario.InstagramUrl || ""} onChange={onChange}/></div>
      <div className="col-12 col-md-6"><label className="form-label">Facebook</label><input type="url" name="FacebookUrl" className="form-control" placeholder="https://facebook.com/..." value={formulario.FacebookUrl || ""} onChange={onChange}/></div>
      <div className="col-12 col-md-6"><label className="form-label">TikTok</label><input type="url" name="TikTokUrl" className="form-control" placeholder="https://tiktok.com/@..." value={formulario.TikTokUrl || ""} onChange={onChange}/></div>
      <div className="col-12 col-md-6"><label className="form-label">YouTube</label><input type="url" name="YouTubeUrl" className="form-control" placeholder="https://youtube.com/@..." value={formulario.YouTubeUrl || ""} onChange={onChange}/></div>
      <div className="col-12 col-md-6"><label className="form-label">Spotify</label><input type="url" name="SpotifyUrl" className="form-control" placeholder="https://open.spotify.com/artist/..." value={formulario.SpotifyUrl || ""} onChange={onChange}/></div>
      <div className="col-12 col-md-6"><label className="form-label">X / Twitter</label><input type="url" name="XUrl" className="form-control" placeholder="https://x.com/..." value={formulario.XUrl || ""} onChange={onChange}/></div>
      <div className="col-12 col-md-6"><label className="form-label">Sitio web oficial</label><input type="url" name="SitioWebUrl" className="form-control" placeholder="https://..." value={formulario.SitioWebUrl || ""} onChange={onChange}/></div>

      {mostrarFotografia && <div className="col-12"><label className="form-label">Fotografía del talento</label><input type="file" name="Foto" className="form-control" accept="image/jpeg,image/png,image/webp" onChange={onFotoChange}/></div>}
    </div>
    {vistaPrevia && <div className="mt-3 text-center"><p className="text-muted mb-2">Vista previa</p><img src={vistaPrevia} alt="Vista previa del talento" className="img-thumbnail" style={{width:"180px",height:"180px",objectFit:"cover",borderRadius:"50%"}}/></div>}
  </>;
}
export default ActorFormFields;