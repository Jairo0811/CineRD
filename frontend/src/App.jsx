import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Actores from "./pages/Actores";
import Peliculas from "./pages/Peliculas";
import FormularioActor from "./pages/FormularioActor";
import FormularioPelicula from "./pages/FormularioPelicula";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/actores" element={<Actores />} />

        <Route path="/peliculas" element={<Peliculas />} />

        <Route path="/actores/nuevo" element={<FormularioActor />} />

        <Route path="/actores/editar/:id" element={<FormularioActor />} />

        <Route path="/peliculas/nueva" element={<FormularioPelicula />} />

        <Route path="/peliculas/editar/:id" element={<FormularioPelicula />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
