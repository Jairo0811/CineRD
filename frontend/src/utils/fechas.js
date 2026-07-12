const extraerPartesFecha = (fecha) => {
  if (!fecha) {
    return null;
  }

  const fechaLimpia = String(fecha).substring(0, 10);
  const partes = fechaLimpia.split("-");

  if (partes.length !== 3) {
    return null;
  }

  const [anio, mes, dia] = partes.map(Number);

  if (
    !Number.isInteger(anio) ||
    !Number.isInteger(mes) ||
    !Number.isInteger(dia) ||
    anio <= 0 ||
    mes < 1 ||
    mes > 12 ||
    dia < 1 ||
    dia > 31
  ) {
    return null;
  }

  return {
    anio,
    mes,
    dia,
  };
};

export const calcularEdadEnFecha = (
  fechaNacimiento,
  fechaFinal,
) => {
  const nacimiento = extraerPartesFecha(fechaNacimiento);
  const final = extraerPartesFecha(fechaFinal);

  if (!nacimiento || !final) {
    return null;
  }

  let edad = final.anio - nacimiento.anio;

  const noHabiaCumplido =
    final.mes < nacimiento.mes ||
    (final.mes === nacimiento.mes &&
      final.dia < nacimiento.dia);

  if (noHabiaCumplido) {
    edad -= 1;
  }

  return edad >= 0 ? edad : null;
};

export const calcularEdad = (fechaNacimiento) => {
  const nacimiento = extraerPartesFecha(fechaNacimiento);

  if (!nacimiento) {
    return null;
  }

  const hoy = new Date();

  const fechaActual = {
    anio: hoy.getFullYear(),
    mes: hoy.getMonth() + 1,
    dia: hoy.getDate(),
  };

  let edad = fechaActual.anio - nacimiento.anio;

  const aunNoHaCumplido =
    fechaActual.mes < nacimiento.mes ||
    (fechaActual.mes === nacimiento.mes &&
      fechaActual.dia < nacimiento.dia);

  if (aunNoHaCumplido) {
    edad -= 1;
  }

  return edad >= 0 ? edad : null;
};

export const calcularEdadAproximada = (
  anioNacimiento,
  anioFinal = new Date().getFullYear(),
) => {
  const nacimiento = Number(anioNacimiento);
  const final = Number(anioFinal);

  if (
    !Number.isInteger(nacimiento) ||
    !Number.isInteger(final) ||
    nacimiento <= 0 ||
    final < nacimiento
  ) {
    return null;
  }

  return final - nacimiento;
};

export const formatearFecha = (
  fecha,
  opciones = {},
) => {
  const partes = extraerPartesFecha(fecha);

  if (!partes) {
    return "";
  }

  const fechaLocal = new Date(
    partes.anio,
    partes.mes - 1,
    partes.dia,
  );

  return fechaLocal.toLocaleDateString("es-DO", {
    day: "numeric",
    month: "long",
    year: "numeric",
    ...opciones,
  });
};

export const formatearFechaCorta = (fecha) => {
  return formatearFecha(fecha, {
    month: "short",
  });
};

export const obtenerAnioFecha = (fecha) => {
  const partes = extraerPartesFecha(fecha);

  return partes?.anio || null;
};

export const prepararFechaParaInput = (fecha) => {
  if (!fecha) {
    return "";
  }

  return String(fecha).substring(0, 10);
};