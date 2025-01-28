// Importamos React y Bootstrap
import 'bootstrap/dist/css/bootstrap.min.css';

import { Link } from 'react-router-dom';

function Hero() {
  return (
    <div
      className="hero text-white text-center d-flex flex-column justify-content-center align-items-center py-5"
      style={{
        background: 'linear-gradient(135deg, #08b5bb, #065a82)',
        color: '#fff',
        minHeight: '100vh',
        padding: '4rem 2rem',
      }}
    >
      <div className="container">
        <h1 className="display-4 fw-bold mb-4">
          ¡Crea, Publica y Comparte Historias como Nunca Antes!
        </h1>
        <p className="lead mb-4 " style={{ maxWidth: '600px', margin: '0 auto' }}>
          Una plataforma sencilla y poderosa para que tus ideas cobren vida. Sin distracciones, solo tú y tus palabras.
        </p>
        <div className="mt-4 ">
          <Link
            to={"Login"}
            className="btn btn-light btn-lg me-3"
            style={{
              borderRadius: '30px',
              padding: '10px 20px',
              boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
              transition: 'all 0.3s ease-in-out',
            }}
            onMouseEnter={(e) => (e.target.style.backgroundColor = '#ddd')}
            onMouseLeave={(e) => (e.target.style.backgroundColor = '#fff')}
          >
            Crea tu primer blog
          </Link>

          <Link
            to={"bloglist"}
            className="btn btn-light btn-lg me-3"
            style={{
              borderRadius: '30px',
              padding: '10px 20px',
              boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
              transition: 'all 0.3s ease-in-out',
            }}
            onMouseEnter={(e) => (e.target.style.backgroundColor = '#ddd')}
            onMouseLeave={(e) => (e.target.style.backgroundColor = '#fff')}
          >
            Ver blogs publicados
          </Link>

        </div>
      </div>
    </div>
  );
}

export default Hero;
