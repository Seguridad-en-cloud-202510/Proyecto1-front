import { useState } from 'react'
import { Link } from 'react-router-dom'

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function NavBar() {

    const [logueado, setLogueado] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (!localStorage.getItem("access_token")) {
            setLogueado(false);
        } else {
            setLogueado(true);
        }
    });

    function cerrarSesion() {
        localStorage.removeItem('access_token');
        setLogueado(false);
        navigate('/');
    }

    return (
        <nav className="navbar navbar-expand-lg bg-dark border-bottom border-body" data-bs-theme="dark">
            <div className="container-fluid">
                <Link className="navbar-brand" to={"/"}>Tag me, Blogger</Link>
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav ms-auto">
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

export default NavBar
