// import 'bootstrap/dist/css/bootstrap.min.css';

import { useState } from 'react'
import { Link } from 'react-router-dom'

function NavBar() {
    const isLoggued = false

    return (
        <nav className="navbar navbar-expand-lg bg-dark border-bottom border-body" data-bs-theme="dark">
            <div className="container-fluid">
                <Link className="navbar-brand" to={"/"}>Tag me, Blogger</Link>
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav ms-auto">
                        {!isLoggued &&
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
                    </ul>
                </div>
            </div>
        </nav>
    )
}

export default NavBar
