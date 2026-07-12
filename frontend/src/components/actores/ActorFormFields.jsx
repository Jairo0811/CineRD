import { PROFESIONES } from "../../constants/profesiones";

function ActorFormFields({
  formulario,
  onChange,
  onChangeEstadoVida,
  onFotoChange,
  vistaPrevia,
  mostrarFotografia = true,
}) {
  const anioActual = new Date().getFullYear();

  return (
    <>
      <div className="row g-3">
        <div className="col-12 col-md-6">
          <label className="form-label">Nombres</label>

          <input
            type="text"
            name="Nombres"
            className="form-control"
            value={formulario.Nombres || ""}
            onChange={onChange}
            required
          />
        </div>

        <div className="col-12 col-md-6">
          <label className="form-label">Apellidos</label>

          <input
            type="text"
            name="Apellidos"
            className="form-control"
            value={formulario.Apellidos || ""}
            onChange={onChange}
          />
        </div>

        <div className="col-12 col-md-6">
          <label className="form-label">Nombre artístico</label>

          <input
            type="text"
            name="NombreArtistico"
            className="form-control"
            value={formulario.NombreArtistico || ""}
            onChange={onChange}
          />
        </div>

        <div className="col-12 col-md-6">
          <label className="form-label">Profesión</label>

          <select
            name="Profesion"
            className="form-select"
            value={formulario.Profesion || ""}
            onChange={onChange}
          >
            <option value="">Seleccione una profesión</option>

            {formulario.Profesion &&
              !PROFESIONES.includes(formulario.Profesion) && (
                <option value={formulario.Profesion}>
                  {formulario.Profesion}
                </option>
              )}

            {PROFESIONES.map((profesion) => (
              <option key={profesion} value={profesion}>
                {profesion}
              </option>
            ))}
          </select>
        </div>

        <div className="col-12 col-md-6">
          <label className="form-label">Fecha de nacimiento</label>

          <input
            type="date"
            name="FechaNacimiento"
            className="form-control"
            value={formulario.FechaNacimiento || ""}
            onChange={onChange}
          />

          <small className="text-muted">
            Utiliza este campo cuando conozcas la fecha completa.
          </small>
        </div>

        <div className="col-12 col-md-6">
          <label className="form-label">Año de nacimiento</label>

          <input
            type="number"
            name="AnioNacimiento"
            className="form-control"
            placeholder="Ej: 1979"
            min="1800"
            max={anioActual}
            value={formulario.AnioNacimiento || ""}
            onChange={onChange}
            disabled={Boolean(formulario.FechaNacimiento)}
          />

          <small className="text-muted">
            Úsalo solamente cuando no conozcas el día y el mes.
          </small>
        </div>

        <div className="col-12 col-md-6">
          <label className="form-label">Sexo</label>

          <select
            name="Sexo"
            className="form-select"
            value={formulario.Sexo || "Masculino"}
            onChange={onChange}
          >
            <option value="Masculino">Masculino</option>
            <option value="Femenino">Femenino</option>
          </select>
        </div>

        <div className="col-12 col-md-6">
          <label className="form-label">Estado</label>

          <select
            name="EstaVivo"
            className="form-select"
            value={formulario.EstaVivo ? "true" : "false"}
            onChange={onChangeEstadoVida}
          >
            <option value="true">Vivo</option>
            <option value="false">
              {formulario.Sexo === "Femenino"
                ? "Fallecida"
                : "Fallecido"}
            </option>
          </select>
        </div>

        {!formulario.EstaVivo && (
          <div className="col-12 col-md-6">
            <label className="form-label">
              Fecha de fallecimiento
            </label>

            <input
              type="date"
              name="FechaFallecimiento"
              className="form-control"
              value={formulario.FechaFallecimiento || ""}
              onChange={onChange}
              required
            />
          </div>
        )}

        {mostrarFotografia && (
          <div className="col-12">
            <label className="form-label">
              Fotografía del talento
            </label>

            <input
              type="file"
              name="Foto"
              className="form-control"
              accept="image/jpeg,image/png,image/webp"
              onChange={onFotoChange}
            />
          </div>
        )}
      </div>

      {vistaPrevia && (
        <div className="mt-3 text-center">
          <p className="text-muted mb-2">Vista previa</p>

          <img
            src={vistaPrevia}
            alt="Vista previa del talento"
            className="img-thumbnail"
            style={{
              width: "180px",
              height: "180px",
              objectFit: "cover",
              borderRadius: "50%",
            }}
          />
        </div>
      )}
    </>
  );
}

export default ActorFormFields;