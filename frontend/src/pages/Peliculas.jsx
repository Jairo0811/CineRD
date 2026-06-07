import { useEffect, useState } from "react";
import api from "../services/api";
import { Link } from "react-router-dom";

function Peliculas() {
    const [peliculas, setPeliculas] = useState([]);

    useEffect(() => {
        obtenerPeliculas();
    }, []);

    const obtenerPeliculas = async () => {
        try {
            const response = await api.get("/peliculas");
            setPeliculas(response.data);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="container mt-4">

           

            <h2>🎬 Películas</h2>

            <table className="table table-striped mt-3">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Título</th>
                        <th>Género</th>
                        <th>Director</th>
                        <th>Productora</th>
                    </tr>
                </thead>

                <tbody>
                    {peliculas.map(pelicula => (
                        <tr key={pelicula.Id}>
                            <td>{pelicula.Id}</td>

                            <td>{pelicula.Titulo}</td>

                            <td>{pelicula.Genero}</td>

                            <td>{pelicula.Director || "-"}</td>

                            <td>{pelicula.Productora || "-"}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
 <Link to="/" className="btn btn-secondary mb-3">
                ← Volver al inicio
            </Link>
        </div>
    );
}

export default Peliculas;