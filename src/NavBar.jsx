import { useState } from 'react' // Importa el hook useState para gestionar el estado local del componente
import { Link } from 'react-router-dom' // Importa el componente Link para la navegación entre rutas

import { useEffect } from 'react'; // Importa el hook useEffect para manejar efectos secundarios en el componente
import { useNavigate } from 'react-router-dom'; // Importa el hook useNavigate para programar redirecciones en la navegación

function NavBar() {

    // Estado que determina si el usuario está logueado o no
    const [logueado, setLogueado] = useState(false);
    // Hook para manejar la navegación programática
    const navigate = useNavigate();

    // useEffect para verificar en cada render si existe el token de acceso en el localStorage
    useEffect(() => {
        if (!localStorage.getItem("access_token")) {
            // Si no hay token, se establece el estado como no logueado
            setLogueado(false);
        } else {
            // Si existe el token, se considera que el usuario está logueado
            setLogueado(true);
        }
    });

    // Función que maneja el cierre de sesión del usuario
    function cerrarSesion() {
        localStorage.removeItem('access_token'); // Elimina el token de acceso del localStorage
        setLogueado(false); // Actualiza el estado a no logueado
        navigate('/'); // Redirige al usuario a la página de inicio
    }

    return (
        <nav className="navbar navbar-expand-lg bg-dark border-bottom border-body" data-bs-theme="dark">
            {/* Contenedor principal de la barra de navegación */}
            <div className="container-fluid">
                {/* Enlace de la marca que redirige a la página principal */}
                <Link className="navbar-brand" to={"/"}>Tag me, Blogger</Link>
                {/* Botón para el modo responsive que muestra/oculta el menú */}
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>

                {/* Contenedor colapsable de los enlaces de navegación */}
                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav ms-auto">
                        {/* Muestra enlaces de registro e inicio de sesión si el usuario no está logueado */}
                        {!logueado &&
                            (
                                <>
                                    <li className="nav-item">
                                        <Link to={"Login"} className="btn btn-light btn-md me-3">
                                            Regístrate
                                        </Link>
                                    </li>

                                    <li className="nav-item">
                                        <Link to={"Login"} className="btn btn-outline-light btn-md">
                                            Inicia Sesión
                                        </Link>
                                    </li>
                                </>
                            )
                        }

                        {/* Si el usuario está logueado, muestra el botón para cerrar sesión */}
                        {logueado && <li className="nav-item">
                            <button className='btn btn-outline-light btn-md' onClick={cerrarSesion}>
                                Cerrar Sesión
                            </button>
                        </li>}

                    </ul>
                </div>
            </div>
        </nav>
    )
}

export default NavBar // Exporta el componente NavBar para poder usarlo en otras partes de la aplicación