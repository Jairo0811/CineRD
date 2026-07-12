import { TIPOS_PARTICIPACION } from "../../constants/tiposParticipacion";

function ParticipacionFormFields({
  valores,
  onChange,
  columnas = true,
}) {
  const clasePersonaje = columnas
    ? "col-12 col-md-6"
    : "col-12";

  const claseParticipacion = columnas
    ? "col-12 col-md-6"
    : "col-12";

  return (
    <div className="row g-3">
      <div className={clasePersonaje}>
        <label className="form-label">Personaje</label>

        <input
          type="text"
          name="Personaje"
          className="form-control"
          placeholder="Ej: Genaro"
          value={valores.Personaje || ""}
          onChange={onChange}
        />
      </div>

      <div className={claseParticipacion}>
        <label className="form-label">
          Tipo de participación
        </label>

        <select
          name="TipoParticipacion"
          className="form-select"
          value={valores.TipoParticipacion || "Reparto"}
          onChange={onChange}
        >
          {TIPOS_PARTICIPACION.map((tipo) => (
            <option key={tipo} value={tipo}>
              {tipo}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export default ParticipacionFormFields;