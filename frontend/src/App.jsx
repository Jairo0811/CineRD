import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Actores from "./pages/Actores";
import Peliculas from "./pages/Peliculas";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/actores" element={<Actores />} />
        <Route path="/peliculas" element={<Peliculas />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;