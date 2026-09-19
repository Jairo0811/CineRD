const TIPOS_PARTICIPACION_BASE = [
  "Principal",
  "Secundario",
  "Reparto",
  "Cameo",
  "Especial",
  "Actor invitado",
  "Debut cinematográfico",
  "Flashback",
  "Flashforward",
  "Versión joven",
  "Versión adulta",
  "Versión anciana",
  "Niño(a)",
  "Voz",
  "Narrador",
  "Interpretándose a sí mismo",
  "Archivo",
  "Fotografía",
  "Escena postcréditos",
  "Sin acreditar",
  "Doble de riesgo",
];

export const TIPOS_PARTICIPACION = [...TIPOS_PARTICIPACION_BASE].sort((a, b) =>
  a.localeCompare(b, "es", { sensitivity: "base" }),
);

export const obtenerTextoParticipacion = (tipo) => {
  const textos = {
    Principal: "⭐ Principal",
    Secundario: "🎭 Secundario",
    Reparto: "👥 Reparto",
    Cameo: "🎬 Cameo",
    Especial: "🌟 Especial",
    "Actor invitado": "🎟️ Actor invitado",
    "Debut cinematográfico": "🎞️ Debut cinematográfico",
    Flashback: "🔙 Flashback",
    Flashforward: "⏩ Flashforward",
    "Versión joven": "👦 Versión joven",
    "Versión adulta": "🧑 Versión adulta",
    "Versión anciana": "👴 Versión anciana",
    "Niño(a)": "🧒 Niño(a)",
    Voz: "🎙️ Voz",
    Narrador: "📖 Narrador",
    "Interpretándose a sí mismo": "🙋 Sí mismo",
    Archivo: "📼 Archivo",
    Fotografía: "🖼️ Fotografía",
    "Escena postcréditos": "🎞️ Postcréditos",
    "Sin acreditar": "🙈 Sin acreditar",
    "Doble de riesgo": "🤸 Doble de riesgo",
  };

  return textos[tipo] || "🎭 Participación";
};

export const obtenerClaseParticipacion = (tipo) => {
  if (tipo === "Principal") {
    return "bg-primary";
  }

  if (
    ["Secundario", "Reparto", "Voz", "Narrador"].includes(tipo)
  ) {
    return "bg-secondary";
  }

  if (["Cameo", "Actor invitado", "Debut cinematográfico"].includes(tipo)) {
    return "bg-light text-primary border border-primary";
  }

  if (
    [
      "Flashback",
      "Flashforward",
      "Archivo",
      "Fotografía",
      "Escena postcréditos",
    ].includes(tipo)
  ) {
    return "bg-dark";
  }

  if (tipo === "Sin acreditar") {
    return "bg-light text-dark border";
  }

  return "bg-primary";
};
