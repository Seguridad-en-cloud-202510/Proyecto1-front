import React, { useEffect, useState, useCallback } from "react"; // Importa React junto con hooks para manejar estados, efectos y callbacks  
import {  
  Card,  
  CardImg,  
  CardBody,  
  CardTitle,  
  CardText,  
  Badge,  
  Offcanvas,  
  Form,  
  Button,  
  Pagination,  
} from "react-bootstrap"; // Importa diversos componentes de react-bootstrap para estructurar y estilizar la UI  
import { useNavigate } from "react-router-dom"; // Importa el hook useNavigate para redireccionar programáticamente al usuario  
import axios from "axios"; // Importa axios para realizar peticiones HTTP al backend

// Función para decodificar el token JWT y extraer su payload  
const decodeToken = (token) => {  
  try {  
    // Se obtiene la segunda parte del token (payload) que contiene los datos codificados  
    const base64Url = token.split(".")[1];  
    // Reemplaza los caracteres para que la cadena sea una base64 válida  
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");  
    // Decodifica la cadena base64 y la convierte en una cadena URI  
    const jsonPayload = decodeURIComponent(  
      atob(base64)  
        .split("")  
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))  
        .join("")  
    );  
    return JSON.parse(jsonPayload); // Convierte la cadena JSON en un objeto y lo retorna  
  } catch (error) {  
    console.error("Error al decodificar el token:", error); // En caso de error, muestra el problema en la consola  
    return null; // Retorna null si ocurre algún error  
  }  
};

// Componente BlogCard que representa cada tarjeta de blog individual  
const BlogCard = ({  
  id,  
  date,  
  title,  
  text,  
  image,  
  autor_id,  
  tags,  
  publicado,   
  adminCards,  
}) => {  
  const navigate = useNavigate(); // Hook para cambiar de ruta  
  const [isLogged, setIsLogged] = useState(false); // Estado para determinar si el usuario está logueado  
  const [autor, setAutor] = useState(""); // Estado para guardar el nombre del autor del blog  
  const [calificacionPromedio, setCalificacionPromedio] = useState(null); // Estado para almacenar la calificación promedio  
  const [isPublished, setIsPublished] = useState(publicado); // Estado que indica si el blog está publicado, inicializado con la prop 'publicado'

  // Efecto para determinar si hay un token en localStorage y establecer el estado de logueo  
  useEffect(() => {  
    const token = localStorage.getItem("access_token");  
    setIsLogged(Boolean(token)); // Si existe token, isLogged es true; de lo contrario false  
  }, []);

  // Efecto para obtener el nombre del autor mediante una petición HTTP  
  useEffect(() => {  
    const fetchAutor = async () => {  
      try {  
        const response = await axios.get(`http://localhost:8000/usuarios/${autor_id}/`);  
        setAutor(response.data.nombre); // Actualiza el estado con el nombre del autor obtenido  
      } catch (error) {  
        console.error("Error al obtener el autor:", error);  
      }  
    };  
    if (autor_id) fetchAutor(); // Llama a la función solamente si existe autor_id  
  }, [autor_id]);

  // Efecto para obtener la calificación promedio del blog  
  useEffect(() => {  
    const fetchCalificacion = async () => {  
      try {  
        const response = await axios.get(`http://localhost:8000/calificaciones/${id}`);  
        const promedio = response.data.promedio;  
        setCalificacionPromedio(Math.round(promedio * 10) / 10); // Redondea la calificación a un decimal  
      } catch (error) {  
        console.error("Error al obtener la calificación promedio:", error);  
        setCalificacionPromedio(0); // En caso de error, establece la calificación a 0  
      }  
    };  
    fetchCalificacion();  
  }, [id]);

  // Función para manejar el click en la tarjeta y redirigir a la vista detallada del blog  
  const handleClick = () => {  
    navigate(`/bloglist/${id}`, {  
      state: {  
        id_blog: id,  
        date,  
        text,  
        image,  
        autor,  
        calificacion: calificacionPromedio,  
        tags,  
      },  
    });  
  };

  // Función para eliminar la publicación mediante una petición DELETE  
  const handleDelete = async () => {  
    try {  
      await axios.delete(`http://localhost:8000/publicaciones/${id}/`, {  
        headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },  
      });  
      console.log("Publicación eliminada correctamente");  
      window.location.reload(); // Recarga la página para mostrar los cambios  
    } catch (error) {  
      console.error("Error al eliminar la publicación:", error);  
      alert("Error al eliminar la publicación"); // Muestra una alerta en caso de error  
    }  
  };

  // Función para iniciar el proceso de edición del blog  
  const handleEdit = async () => {  
    try {  
      const response = await axios.get(`http://localhost:8000/publicaciones/${id}/`, {  
        headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },  
      });  
      const blog = response.data;  
      navigate(`/new_blog`, {  
        state: {  
          idEditar: id,  
          titleEditar: title,  
          tagsEditar: tags,  
          contentEditar: text,  
          imagePreviewEditar: image,  
          publicadoEditar: blog.publicado,  
          editarBlog: true,  
        },  
      });  
    } catch (error) {  
      console.error("Error al obtener la publicación:", error);  
      alert("Error al obtener la publicación");  
    }  
  };

  // Función para alternar el estado de publicación del blog mediante una petición PUT  
  const handleTogglePublish = async () => {  
    try {  
      await axios.put(  
        `http://localhost:8000/publicaciones/${id}`,  
        { publicado: !isPublished },  
        { headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` } }  
      );  
      console.log("Estado de publicación actualizado correctamente");  
      setIsPublished((prev) => !prev); // Cambia el estado de publicación en el componente  
    } catch (error) {  
      console.error("Error al actualizar el estado de publicación:", error);  
      alert("Error al actualizar el estado de publicación");  
    }  
  };

  // Crea un resumen del texto limitándolo a 250 caracteres y añadiendo puntos suspensivos  
  const shortText = text.slice(0, 250) + "  ...";

  return (  
    <Card className="shadow-sm mb-4" style={{ borderRadius: "10px" }}>  
      {/* Área clicable que redirige a la vista detallada del blog */}
      <div onClick={handleClick} style={{ cursor: "pointer" }}>  
        <CardImg  
          top  
          src={image}  
          alt={title}  
          style={{  
            width: "100%",  
            height: "200px",  
            objectFit: "cover",  
            borderTopLeftRadius: "10px",  
            borderTopRightRadius: "10px",  
          }}  
        />  
      </div>  
      <CardBody>  
        {/* Contenedor clicable que redirige a la vista del detalle del blog */}
        <div onClick={handleClick} style={{ cursor: "pointer" }}>  
          <div className="mb-3">  
            {/* Mapea y muestra los tags como Badges */}
            {tags.map((tag, index) => (  
              <Badge key={index} bg="primary" className="me-1">  
                {tag}  
              </Badge>  
            ))}  
          </div>  
          <div className="container mb-3">  
            <div className="row">  
              <div className="col-6">  
                {/* Muestra la fecha de publicación */}
                <CardText>{date}</CardText>  
              </div>  
              <div className="col-6 text-end">  
                {/* Muestra el nombre del autor */}
                <CardText>{autor}</CardText>  
              </div>  
            </div>  
          </div>  
          {/* Muestra el título del blog */}
          <CardTitle tag="h5" className="fw-bold mb-2">  
            {title}  
          </CardTitle>  
          {/* Muestra un extracto del contenido utilizando dangerouslySetInnerHTML para interpretar HTML */}
          <CardText  
            className="text-muted"  
            dangerouslySetInnerHTML={{ __html: shortText }}  
          />  
          {/* Muestra la calificación promedio en la parte inferior de la tarjeta */}
          <CardText className="card-footer small text-muted">  
            Calificación:{" "}  
            {calificacionPromedio !== null ? calificacionPromedio : "Cargando..."}  
          </CardText>  
        </div>

        {/* Si adminCards es true, se muestran botones administrativos para eliminar, editar o publicar/despublicar */}
        {adminCards && (  
          <div className="container mt-4">  
            <div className="row">  
              <div className="col-auto">  
                <Button variant="danger" onClick={handleDelete}>  
                  Eliminar  
                </Button>  
              </div>  
              <div className="col-auto">  
                <Button variant="warning" onClick={handleEdit}>  
                  Editar  
                </Button>  
              </div>  
              <div className="col-auto">  
                <Button  
                  variant={isPublished ? "secondary" : "success"}  
                  onClick={handleTogglePublish}  
                >  
                  {isPublished ? "Despublicar" : "Publicar"}  
                </Button>  
              </div>  
            </div>  
          </div>  
        )}  
      </CardBody>  
    </Card>  
  );  
};

// Componente BlogList que muestra una lista paginada de blogs y permite filtrar y administrar publicaciones  
const BlogList = () => {  
  const navigate = useNavigate(); // Hook para la navegación  
  const [publicaciones, setPublicaciones] = useState([]); // Estado para almacenar la lista de publicaciones  
  const [totalPublicaciones, setTotalPublicaciones] = useState(0); // Estado para el número total de publicaciones  
  const [pagina, setPagina] = useState(0); // Estado para la página actual (paginación)  
  const [isLogged, setIsLogged] = useState(false); // Estado para determinar si el usuario está logueado  
  const [adminMode, setAdminMode] = useState(false); // Estado para activar el modo administrativo  
  const [showFilter, setShowFilter] = useState(false); // Estado para mostrar u ocultar el offcanvas de filtrado  
  const [selectedTags, setSelectedTags] = useState([]); // Estado para las etiquetas seleccionadas en el filtro  
  const [searchTerm, setSearchTerm] = useState(""); // Estado para el término de búsqueda ingresado  
  const [userName, setUserName] = useState(""); // Estado para almacenar el nombre del usuario

  const limit = 10; // Límite de publicaciones por página

  // Función para obtener el ID del usuario a partir del token almacenado  
  const getUserId = useCallback(() => {  
    const token = localStorage.getItem("access_token");  
    if (token) {  
      const payload = decodeToken(token);  
      if (payload && payload.sub) {  
        return parseInt(payload.sub, 10);  
      }  
    }  
    console.log("Token no encontrado");  
    return undefined;  
  }, []);

  const currentUserId = getUserId(); // Obtiene el ID del usuario actual

  // Efecto para obtener el nombre del usuario actual mediante una petición HTTP  
  useEffect(() => {  
    if (currentUserId) {  
      axios  
        .get(`http://localhost:8000/usuarios/${currentUserId}/`)  
        .then((response) => {  
          setUserName(response.data.nombre); // Actualiza el estado con el nombre del usuario  
        })  
        .catch((error) => {  
          console.error("Error al obtener el nombre del usuario:", error);  
        });  
    }  
  }, [currentUserId]);

  // Efecto para obtener las publicaciones de la API con paginación  
  useEffect(() => {  
    const offset = pagina * limit; // Calcula el offset basándose en la página actual  
    axios  
      .get(`http://localhost:8000/publicaciones/?pagina=${offset}&limite=${limit}`)  
      .then((response) => {  
        setPublicaciones(response.data.publicaciones); // Actualiza el estado con las publicaciones obtenidas  
        setTotalPublicaciones(response.data.total); // Actualiza el estado con el total de publicaciones  
      })  
      .catch((error) => {  
        console.error("Error al obtener las publicaciones:", error);  
      });  
  }, [pagina]);

  // Efecto para determinar si el usuario está logueado comprobando la existencia del token  
  useEffect(() => {  
    const token = localStorage.getItem("access_token");  
    setIsLogged(Boolean(token));  
  }, []);

  // Función para alternar la selección de una etiqueta en el filtro  
  const toggleTag = (tag) => {  
    setSelectedTags((prev) =>  
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]  
    );  
  };

  // Aplica filtros a la lista de publicaciones según el término de búsqueda y las etiquetas seleccionadas  
  let publicacionesFiltradas = publicaciones.filter((publicacion) => {  
    const matchesSearchTerm = publicacion.titulo  
      .toLowerCase()  
      .includes(searchTerm.toLowerCase()); // Verifica si el título contiene el término de búsqueda  
    const matchesTags =  
      selectedTags.length === 0 ||  
      selectedTags.every((tag) => publicacion.etiquetas.includes(tag)); // Verifica si la publicación contiene todas las etiquetas seleccionadas  
    return matchesSearchTerm && matchesTags;  
  });

  // Si no se está en modo administrador, filtra únicamente las publicaciones publicadas  
  if (!adminMode) {  
    publicacionesFiltradas = publicacionesFiltradas.filter(  
      (publicacion) => publicacion.publicado === true  
    );  
  }

  // Si se activa el modo administrador, filtra publicaciones solo del usuario actual  
  if (adminMode) {  
    publicacionesFiltradas = publicacionesFiltradas.filter(  
      (publicacion) => publicacion.id_usuario === currentUserId  
    );  
  }

  // Obtiene todas las etiquetas únicas de las publicaciones  
  const allTags = [...new Set(publicaciones.flatMap((publicacion) => publicacion.etiquetas))];

  const totalPages = Math.ceil(totalPublicaciones / limit); // Calcula el número total de páginas basado en el total de publicaciones y el límite

  // Función para cambiar de página en la paginación  
  const handlePageChange = (pageNumber) => {  
    setPagina(pageNumber);  
  };

  // Genera los elementos de paginación de acuerdo con el número total de páginas  
  const paginationItems = [];  
  for (let number = 0; number < totalPages; number++) {  
    paginationItems.push(  
      <Pagination.Item  
        key={number}  
        active={number === pagina}  
        onClick={() => handlePageChange(number)}  
      >  
        {number + 1}  
      </Pagination.Item>  
    );  
  }

  // Función para navegar a la página de creación de un nuevo blog  
  const handleNavigateNewBlog = () => {  
    navigate("/new_blog");  
  };

  return (  
    <>  
      <div className="container mt-5">  
        {/* Encabezado de bienvenida y título de la lista de blogs */}  
        <div className="mb-4">  
          <h3>¡Bienvenido {userName}!</h3>  
        </div>  
        <div className="d-flex justify-content-between align-items-center mb-4">  
          <h1 className="mb-0">Lista de blogs</h1>  
        </div>

        {/* Fila de botones para filtrar, crear nuevo blog y cambiar modo administrador */}  
        <div className="row mb-4">  
          <div className="col-auto">  
            <Button variant="primary" onClick={() => setShowFilter(true)}>  
              Filtrar  
            </Button>  
          </div>  
          {isLogged && (  
            <div className="col-auto">  
              <Button variant="primary" onClick={handleNavigateNewBlog}>  
                Nuevo Blog  
              </Button>  
            </div>  
          )}  
          {isLogged && (  
            <div className="col-auto">  
              {!adminMode ? (  
                <Button variant="primary" onClick={() => setAdminMode(true)}>  
                  Administrar Blogs  
                </Button>  
              ) : (  
                <Button  
                  variant="secondary"  
                  onClick={() => {  
                    setAdminMode(false);  
                    window.location.reload(); // Recarga la página para mostrar todos los blogs  
                  }}  
                >  
                  Mostrar Todos  
                </Button>  
              )}  
            </div>  
          )}  
        </div>

        {/* Muestra las tarjetas de blogs filtradas en un grid */}  
        <div className="row">  
          {publicacionesFiltradas.map((publicacion) => (  
            <div className="col-md-4" key={publicacion.id_post}>  
              <BlogCard  
                id={publicacion.id_post}  
                date={publicacion.fecha_publicacion}  
                title={publicacion.titulo}  
                text={publicacion.contenido}  
                image={publicacion.portada}  
                autor_id={publicacion.id_usuario}  
                tags={publicacion.etiquetas}  
                publicado={publicacion.publicado}  
                adminCards={adminMode}  
              />  
            </div>  
          ))}  
        </div>

        {/* Paginación para navegar entre las páginas de publicaciones */}  
        <div className="d-flex justify-content-center mt-4">  
          <Pagination>  
            <Pagination.Prev  
              onClick={() => {  
                if (pagina > 0) handlePageChange(pagina - 1);  
              }}  
              disabled={pagina === 0}  
            />  
            {paginationItems}  
            <Pagination.Next  
              onClick={() => {  
                if (pagina < totalPages - 1) handlePageChange(pagina + 1);  
              }}  
              disabled={pagina === totalPages - 1}  
            />  
          </Pagination>  
        </div>  
      </div>

      {/* Offcanvas para mostrar la interfaz de filtrado por nombre y etiquetas */}  
      <Offcanvas show={showFilter} onHide={() => setShowFilter(false)} placement="end">  
        <Offcanvas.Header closeButton>  
          <Offcanvas.Title>Filtrar blogs</Offcanvas.Title>  
        </Offcanvas.Header>  
        <Offcanvas.Body>  
          <Form.Group className="mb-3">  
            <Form.Label>Buscar por nombre</Form.Label>  
            <Form.Control  
              type="text"  
              placeholder="Nombre del blog"  
              value={searchTerm}  
              onChange={(e) => setSearchTerm(e.target.value)}  
            />  
          </Form.Group>  
          <Form.Group className="mb-3">  
            <Form.Label>Filtrar por etiquetas</Form.Label>  
            {allTags.map((tag, index) => (  
              <Form.Check  
                key={index}  
                type="checkbox"  
                label={tag}  
                checked={selectedTags.includes(tag)}  
                onChange={() => toggleTag(tag)}  
              />  
            ))}  
          </Form.Group>  
        </Offcanvas.Body>  
      </Offcanvas>  
    </>  
  );  
};

export default BlogList; // Exporta el componente BlogList para su uso en otras partes de la aplicación