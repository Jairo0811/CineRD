/**
 * CineRD — arte vectorial original para los 42 carteles editoriales nuevos.
 * Cada figura es una metáfora gráfica abstracta inspirada en el título del
 * catálogo; NO copia fotogramas, arte promocional, personajes ni logotipos.
 */
const P = (d, tone = "primary", w = 3) => ({ kind: "path", d, tone, w });
const C = (cx, cy, r, tone = "hot", w = 3) => ({ kind: "circle", cx, cy, r, tone, w });
const E = (cx, cy, rx, ry, tone = "primary", w = 3) => ({ kind: "ellipse", cx, cy, rx, ry, tone, w });
const R = (x, y, width, height, tone = "primary", w = 3, rx = 0) =>
  ({ kind: "rect", x, y, width, height, tone, w, rx });
const L = (x1, y1, x2, y2, tone = "primary", w = 3) =>
  ({ kind: "line", x1, y1, x2, y2, tone, w });

export const EDITORIAL_ARTWORKS = Object.freeze({
  // Ladrones a Domicilio · casa y acceso
  6: [P("M37 115 140 37 243 115M57 104v94h166v-94", "primary", 4),
      R(111,120,58,78,"accent",3,6), C(145,160,7), P("M145 166v12"), P("M76 139h20v22H76zM185 139h20v22h-20z","muted",3)],
  // Lotoman · suerte representada como esferas sin cifras ajenas
  9: [C(95,116,54,"primary",4),C(182,115,57,"accent",3),C(95,116,12),C(182,115,12,"star"),
      P("M49 186c55 25 127 25 183-5","muted",3),P("M142 34v19m-10-9h20","accent",4)],
  // Vamos de robo · bóveda y mecanismo
  10:[R(43,45,194,157,"primary",4,15),C(140,122,52,"accent",4),C(140,122,13),
      P("M140 80v84M98 122h84M111 94l58 56M169 94l-58 56","muted",3),
      R(50,180,38,17,"accent",2,2),R(192,180,38,17,"accent",2,2)],
  // Santicló · árbol y estrella festiva abstracta
  11:[P("M140 25l9 21 23 3-17 17 5 23-20-11-20 11 5-23-17-17 23-3z","accent",2),
      P("M141 71 82 139h30l-40 47h136l-40-47h30z","primary",4),
      L(140,185,140,211,"accent",4), C(110,150,5),C(168,163,6),C(139,125,5)],
  // I Love Bachata · guitarra geométrica
  12:[P("M112 72c-24 4-41 29-39 55-25 41 3 75 40 70 31 23 62 1 62-33 12-31-2-67-30-88","primary",4),
      P("M145 79 195 22l24 25-50 58","accent",4),C(127,137,22,"accent",4),
      L(155,80,200,33,"muted",2),L(160,87,207,40,"muted",2),L(164,94,213,47,"muted",2)],
  // Cristiano de la Secreta · doble identidad y cerradura
  13:[P("M63 61h154v136H63z","primary",4),P("M98 110q42-52 84 0-42 51-84 0z","accent",3),
      C(140,110,13),P("M111 174h59M140 148v45","muted",3),P("M219 78l24-22","accent",3)],
  // Los Rechazados · pliegues y sello abstracto
  14:[R(58,46,164,150,"primary",3,7),P("M58 76l30-13 22 12 30-14 27 13 25-11 30 13","muted",2),
      P("M90 123h100M90 141h65","accent",5),P("M123 175l34-37 24 23","primary",4)],
  // Tubérculo Gourmet · vajilla editorial
  15:[C(140,125,78,"primary",4),C(140,125,57,"muted",3),P("M109 107c15-26 52-26 64 4 7 17-1 34-16 41-30 17-65-13-48-45z","accent",4),
      L(43,57,43,194,"accent",4),L(29,57,29,91,"muted",3),L(57,57,57,91,"muted",3),
      P("M238 57c-21 25-20 48 0 58v79","accent",4)],
  // Profe por Accidente · libro que se abre y lápiz
  17:[P("M140 71c-30-22-71-19-105-12v128c41-9 77-6 105 13 34-20 67-23 105-13V59c-35-7-78-10-105 12z","primary",4),
      L(140,71,140,198,"accent",4),P("M57 99h53m-53 22h53m60-22h50m-50 22h50","muted",3),
      P("M191 22l30 30-11 11-30-30z","accent",2)],
  // Lotoman 2.0 · órbitas y esferas dobles
  18:[C(113,115,62,"primary",4),C(180,115,54,"accent",3),C(113,115,10),C(180,115,10,"star"),
      P("M49 206c51-32 121-29 181 0","muted",3),P("M53 60l16-17m-3 34h22","accent",3)],
  // Carlota la Más Barrial · ciudad y escaleras urbanas
  19:[P("M21 196h238M41 196v-71h34v71m0 0V71h46v125m0 0v-98h44v98m0 0V46h42v150m0 0v-66h33v66","primary",3),
      P("M46 150h23M82 105h30M132 134h22M176 77h22M222 161h16","accent",4),
      P("M41 211h188","muted",3)],
  // Un Macho de Mujer · dos mitades y espejo
  20:[C(104,111,68,"primary",4),C(178,111,68,"accent",3),
      P("M141 48v129M100 92c16 0 23 10 23 21-2 13-13 21-26 18M180 92c-16 0-23 10-23 21 2 13 13 21 26 18","muted",4),
      P("M98 196h84","accent",3)],
  // Medias Hermanas · vínculos y siluetas simétricas
  21:[C(100,102,34,"primary",4),C(179,102,34,"accent",4),
      P("M46 206v-28c0-27 24-44 54-44s55 17 55 44v28M123 206v-28c0-27 24-44 56-44 31 0 54 17 54 44v28","primary",3),
      P("M122 62l18 17 18-17","accent",3)],
  // Sanky Panky 2 · nueva ola de motivos tropicales
  23:[C(117,93,43),C(166,93,43,"star"),
      P("M18 152q26-24 52 0t52 0t52 0t52 0t52 0M18 181q26-24 52 0t52 0t52 0t52 0t52 0","primary",3),
      P("M35 51q17-25 48-23M209 39q24 5 35 29","accent",3)],
  // Sanky Panky 3 · tres rutas luminosas
  24:[C(140,77,43,"hot"),P("M18 144q27-19 54 0t54 0t54 0t54 0t54 0","primary",3),
      P("M18 167q27-19 54 0t54 0t54 0t54 0t54 0","accent",3),
      P("M18 190q27-19 54 0t54 0t54 0t54 0t54 0","muted",3),
      C(63,63,6,"star"),C(218,58,5,"star")],
  // Sanky Panky 4: De Safari · prismáticos y horizonte
  25:[C(99,131,45,"primary",4),C(182,131,45,"accent",4),
      P("M60 102 82 58h31l14 38M156 96l14-38h31l22 44","primary",3),
      P("M134 110h14M33 202q52-23 104 0t111 0","muted",3),
      P("M44 71l18-28m146 7 20-16","accent",3)],
  // Feo de día, Lindo de noche · día y luna
  26:[C(103,108,51,"accent",3),P("M185 59c-28 22-29 71 1 96 20 19 47 21 66 12-17 29-44 44-72 34-47-14-65-70-35-108 11-17 26-29 40-34z","primary",4),
      P("M103 26v21m0 121v21M22 108h21m118 0h13M46 51l16 16m82 82 15 15","muted",3)],
  // Lotoman 003 · vuelo geométrico
  27:[P("M27 139 251 55 177 203l-36-53-36 40-10-59z","primary",4),
      P("M95 131 250 55 141 150","accent",3),P("M43 180l41-24m-20 47 41-24","muted",3)],
  // Teacher Mechy · lección y pizarra
  28:[R(44,37,191,137,"primary",4,6),P("M65 74h76m-76 23h45M159 86l25-26 25 26-25 26z","accent",3),
      P("M110 176v20m60-20v20M84 201h112","muted",4),C(159,134,6)],
  // Baño de Mujeres · puerta misteriosa y mosaicos
  29:[R(82,31,116,176,"primary",4,5),C(173,123,6),P("M64 57h-31v31h31m153-31h30v31h-30M41 166v32h31m145-32h31v32h-31","accent",3),
      P("M105 66h70v90h-70zM105 173h70","muted",2)],
  // El Diablo no duerme en su cama · cama bajo eclipse
  30:[P("M54 161h173v36H54zM64 160v-29h152v29M64 131q35-35 70 0t81 0","primary",4),
      C(155,70,41,"accent",3),P("M107 91c-11-26-8-53 5-68m85 66c11-26 8-53-5-68","muted",3),
      L(55,196,55,211,"accent",4),L(226,196,226,211,"accent",4)],
  // Entiérrenlo Parao · piedra, raíces y halo
  31:[P("M99 194V99c0-53 82-53 82 0v95z","primary",4),P("M114 128h52M140 104v57","accent",3),
      P("M31 201h218M84 213q23-21 48 0m17 0q23-21 48 0","muted",3),C(140,65,8)],
  // Los Rechazados 2 · navegación espacial
  32:[C(141,120,71,"primary",4),E(141,120,118,37,"accent",3),
      P("M118 153 130 78l17-29 18 29 12 75-29-18z","primary",3),
      C(147,107,14),P("M136 151l-11 29m43-30 11 29","muted",4),C(223,68,7,"star")],
  // Pueto Pa' Mi · micrófono y focos
  33:[R(119,49,42,81,"primary",4,20),P("M96 109c0 57 88 57 88 0M140 155v45m-35 0h70","accent",4),
      P("M43 53l30 28m163-28-30 28M43 192l31-28m163 28-31-28","muted",3)],
  // Los Super · emblema héroe abstracto
  34:[P("M140 24 236 65 222 165 140 215 58 165 44 65z","primary",4),
      P("M140 63l20 42 47 7-35 32 9 48-41-24-41 24 9-48-35-32 47-7z","accent",3),
      C(140,122,9)],
  // Nueba Yol 3 · justicia y arquitectura migrante
  36:[P("M25 197h230M36 197v-82h36v82m0 0V73h46v124m0 0V91h34v106m0 0V47h40v150m0 0v-69h45v69","primary",3),
      P("M138 53h101m-48 0v23m-40 0h82m-61 0-16 28h71l-16-28","accent",3),
      C(193,76,6,"hot")],
  // La casa del kilómetro 5 · casa aislada y camino
  38:[P("M37 113 139 35 243 113M63 99v89h152V99","primary",4),
      R(115,117,52,70,"accent",3),P("M140 185c-19 20-33 32-51 36m51-36c19 20 33 32 51 36","muted",3),
      C(40,56,4),C(55,43,4,"star"),C(226,49,6,"star")],
  // Colao · café y montaña
  39:[P("M63 113h139v44c0 28-31 42-69 42-34 0-70-14-70-42z","primary",4),
      P("M202 124h16c22 0 25 29 1 37h-18","accent",4),
      P("M103 104c-16-19 9-30 0-48m36 48c-16-19 9-30 0-48m36 48c-16-19 9-30 0-48","muted",3),
      P("M52 216h171","accent",3)],
  // Colao 2 · dos tazas y café ondulante
  40:[P("M38 122h91v43c0 22-16 31-45 31s-46-9-46-31zM153 122h90v43c0 22-16 31-45 31s-45-9-45-31z","primary",4),
      P("M129 142h12m-36-30c-22-27 20-32 1-64m93 64c-22-27 20-32 1-64","accent",3),
      P("M38 211h206","muted",3)],
  // Malos padres · constelación familiar discordante
  41:[C(140,72,30,"accent",3),C(78,116,28,"primary",3),C(202,116,28,"primary",3),
      P("M96 203v-42c0-24 22-40 44-40s44 16 44 40v42M34 206v-34q0-21 27-31m185 65v-34q0-21-27-31","muted",3),
      P("M94 70l25 17m67-17-25 17","accent",3)],
  // Andrea · figura espectral en ventana
  42:[P("M58 208V49h164v159zM140 49v159M58 131h164","primary",4),
      P("M109 175c-17-39 1-66 31-73 30 7 48 34 31 73-9-7-17-7-31 0-14-7-22-7-31 0z","accent",3),
      C(128,142,5),C(153,142,5)],
  // Playball · diamante de béisbol
  44:[P("M140 26 238 124 140 221 42 124z","primary",4),
      P("M140 67 197 124 140 181 83 124z","muted",3),
      C(140,126,17,"accent",3),P("M125 115q15 11 0 23m30-23q-15 11 0 23","primary",3),
      C(140,54,6),C(66,124,6,"star"),C(214,124,6,"star")],
  // Yuniol · arquitectura del campus
  45:[P("M32 98 140 39 248 98M44 106h193M61 106v91m42-91v91m37-91v91m42-91v91m42-91v91","primary",4),
      P("M35 201h211M47 215h186","accent",4),C(140,67,7)],
  // Pimp Bullies · calle nocturna y advertencia abstracta
  47:[P("M78 41h124v161H78z","primary",4),P("M101 62h78v61h-78z","accent",3),
      P("M95 165h90M140 125v26m-40 59 40-27 40 27","muted",3),
      C(140,92,8)],
  // Al Fin y al Cabo · reloj y caminos
  48:[C(140,117,82,"primary",4),C(140,117,59,"muted",2),
      L(140,117,140,65,"accent",4),L(140,117,179,136,"accent",4),C(140,117,9),
      P("M66 44l-23 20m170-20 23 20M78 204l-14 18m152-18 14 18","muted",3)],
  // Los Locos también Piensan · espiral y bocadillos
  49:[P("M73 157c-46-44-17-111 44-111 49 0 85 30 85 77 0 43-30 68-65 68h-22l-32 24 5-34","primary",4),
      P("M116 124c-9-19 6-34 24-34 17 0 27 11 27 25 0 11-10 19-19 19","accent",4),
      C(147,157,7),C(219,59,8,"star")],
  // Hermanos · unión y simetría
  50:[C(88,83,28,"primary",4),C(192,83,28,"accent",4),
      P("M48 193v-36c0-35 20-54 42-54s42 19 42 54v36M149 193v-36c0-35 20-54 42-54s42 19 42 54v36","primary",3),
      P("M109 165l31-25 31 25M125 142l15 16 15-16","accent",4)],
  // Tubérculo Presidente · estrado simbólico
  51:[R(71,132,138,74,"primary",4,8),P("M63 122h153M140 121V56m0 0-22-29m22 29 22-29","accent",4),
      P("M105 88c-23-12-28-28-19-45 26 1 42 12 54 39m0 0c12-28 29-38 54-39 9 17 4 33-19 45","primary",3)],
  // Dos policías en apuros · insignias gemelas
  52:[P("M52 67h91l-9 111-37 36-37-36zM150 67h80l-9 111-37 36-33-36z","primary",4),
      P("M97 96l10 19 21 4-15 15 4 20-20-10-20 10 4-20-15-15 21-4z","accent",2),
      P("M185 108l13 16-13 16-13-16z","accent",3)],
  // La Musiquita por Dentro · pentagrama y ritmo
  53:[P("M32 94h217M32 112h217M32 130h217M32 148h217M32 166h217","muted",2),
      P("M120 54v115m0-80 57-22v109m-57-8c-23-4-31 22-11 27 11 2 18-6 11-27m57 7c-25-4-33 22-13 27 11 2 19-6 13-27","primary",4),
      P("M65 70c12-15 24-15 36 0m82-12c18-15 34-15 48 0","accent",3)],
  // Los Paracaidistas · cúpulas flotantes
  54:[P("M38 97c0-67 113-67 113 0zM170 79c0-54 83-54 83 0z","primary",4),
      L(38,97,92,184,"muted",2),L(151,97,92,184,"muted",2),L(94,44,92,184,"accent",2),
      L(170,79,210,164,"muted",2),L(253,79,210,164,"muted",2),
      P("M80 190h24M199 169h24","accent",4)],
  // El Plan Perfecto · planos, geometría y estrategia
  55:[R(44,32,193,174,"primary",3,6),
      P("M74 62h42v42H74zM165 62h42v42h-42zM74 140h42v42H74zM165 140h42v42h-42z","muted",2),
      P("M97 83h88v77m0 0-13-13m13 13 13-13M97 83l16-15","accent",4),
      C(97,83,8),C(185,160,8,"star")],
});

function Shape({ item }) {
  const common = {
    className: "cover-art-" + item.tone,
    strokeWidth: item.w,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };
  switch (item.kind) {
    case "path": return <path {...common} d={item.d} />;
    case "circle": return <circle {...common} cx={item.cx} cy={item.cy} r={item.r} />;
    case "ellipse": return <ellipse {...common} cx={item.cx} cy={item.cy} rx={item.rx} ry={item.ry} />;
    case "rect": return <rect {...common} x={item.x} y={item.y} width={item.width} height={item.height} rx={item.rx} />;
    case "line": return <line {...common} x1={item.x1} y1={item.y1} x2={item.x2} y2={item.y2} />;
    default: return null;
  }
}

export default function EditorialCoverArtwork({ peliculaId }) {
  const artwork = EDITORIAL_ARTWORKS[Number(peliculaId)] || [];
  return (
    <svg viewBox="0 0 280 240" fill="none" aria-hidden="true" focusable="false">
      <circle className="cover-art-orbit" cx="140" cy="120" r="109"
        strokeWidth="1.2" strokeDasharray="2 12" />
      <path className="cover-art-muted" d="M22 219h236M31 25h218"
        strokeWidth="1.5" strokeDasharray="4 12" />
      <circle className="cover-art-star" cx="26" cy="64" r="3" />
      <circle className="cover-art-star" cx="254" cy="176" r="3" />
      {artwork.map((item, index) => <Shape key={index} item={item} />)}
    </svg>
  );
}
