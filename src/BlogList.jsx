import React, { useEffect, useState, useCallback } from "react";
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
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const decodeToken = (token) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Error al decodificar el token:", error);
    return null;
  }
};


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
  const navigate = useNavigate();
  const [isLogged, setIsLogged] = useState(false);
  const [autor, setAutor] = useState("");
  const [calificacionPromedio, setCalificacionPromedio] = useState(null);
  const [isPublished, setIsPublished] = useState(publicado);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    setIsLogged(Boolean(token));
  }, []);

  useEffect(() => {
    const fetchAutor = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/usuarios/${autor_id}/`);
        setAutor(response.data.nombre);
      } catch (error) {
        console.error("Error al obtener el autor:", error);
      }
    };
    if(autor_id) fetchAutor();
  }, [autor_id]);

  useEffect(() => {
    const fetchCalificacion = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/calificaciones/${id}`);
        const promedio = response.data.promedio;
        setCalificacionPromedio(Math.round(promedio * 10) / 10);
      } catch (error) {
        console.error("Error al obtener la calificación promedio:", error);
        setCalificacionPromedio(0);
      }
    };
    fetchCalificacion();
  }, [id]);

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

  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:8000/publicaciones/${id}/`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
      });
      console.log("Publicación eliminada correctamente");
      window.location.reload();
    } catch (error) {
      console.error("Error al eliminar la publicación:", error);
      alert("Error al eliminar la publicación");
    }
  };

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

  const handleTogglePublish = async () => {
    try {
      await axios.put(
        `http://localhost:8000/publicaciones/${id}`,
        { publicado: !isPublished },
        { headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` } }
      );
      console.log("Estado de publicación actualizado correctamente");
      setIsPublished((prev) => !prev);
    } catch (error) {
      console.error("Error al actualizar el estado de publicación:", error);
      alert("Error al actualizar el estado de publicación");
    }
  };

  const shortText = text.slice(0, 250) + "  ...";
  
  return (
    <Card className="shadow-sm mb-4" style={{ borderRadius: "10px" }}>
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
        <div onClick={handleClick} style={{ cursor: "pointer" }}>
          <div className="mb-3">
            {tags.map((tag, index) => (
              <Badge key={index} bg="primary" className="me-1">
                {tag}
              </Badge>
            ))}
          </div>
          <div className="container mb-3">
            <div className="row">
              <div className="col-6">
                <CardText>{date}</CardText>
              </div>
              <div className="col-6 text-end">
                <CardText>{autor}</CardText>
              </div>
            </div>
          </div>
          <CardTitle tag="h5" className="fw-bold mb-2">
            {title}
          </CardTitle>
          <CardText
            className="text-muted"
            dangerouslySetInnerHTML={{ __html: shortText }}
          />
          <CardText className="card-footer small text-muted">
            Calificación:{" "}
            {calificacionPromedio !== null ? calificacionPromedio : "Cargando..."}
          </CardText>
        </div>

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


const BlogList = () => {
  const navigate = useNavigate();
  const [publicaciones, setPublicaciones] = useState([]);
  const [totalPublicaciones, setTotalPublicaciones] = useState(0);
  const [pagina, setPagina] = useState(0);
  const [isLogged, setIsLogged] = useState(false);
  const [adminMode, setAdminMode] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [userName, setUserName] = useState("");

  const limit = 10;


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


  const currentUserId = getUserId();


  useEffect(() => {
    if (currentUserId) {
      axios
        .get(`http://localhost:8000/usuarios/${currentUserId}/`)
        .then((response) => {
          setUserName(response.data.nombre);
        })
        .catch((error) => {
          console.error("Error al obtener el nombre del usuario:", error);
        });
    }
  }, [currentUserId]);


  useEffect(() => {
    const offset = pagina * limit;
    axios
      .get(`http://localhost:8000/publicaciones/?pagina=${offset}&limite=${limit}`)
      .then((response) => {
        setPublicaciones(response.data.publicaciones);
        setTotalPublicaciones(response.data.total);
      })
      .catch((error) => {
        console.error("Error al obtener las publicaciones:", error);
      });
  }, [pagina]);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    setIsLogged(Boolean(token));
  }, []);


  const toggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  let publicacionesFiltradas = publicaciones.filter((publicacion) => {
    const matchesSearchTerm = publicacion.titulo
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesTags =
      selectedTags.length === 0 ||
      selectedTags.every((tag) => publicacion.etiquetas.includes(tag));
    return matchesSearchTerm && matchesTags;
  });

  if (!adminMode) {
    publicacionesFiltradas = publicacionesFiltradas.filter(
      (publicacion) => publicacion.publicado === true
    );
  }

  if (adminMode) {
    publicacionesFiltradas = publicacionesFiltradas.filter(
      (publicacion) => publicacion.id_usuario === currentUserId
    );
  }

  const allTags = [...new Set(publicaciones.flatMap((publicacion) => publicacion.etiquetas))];

  const totalPages = Math.ceil(totalPublicaciones / limit);

  const handlePageChange = (pageNumber) => {
    setPagina(pageNumber);
  };

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

  const handleNavigateNewBlog = () => {
    navigate("/new_blog");
  };

  return (
    <>
      <div className="container mt-5">
        <div className="mb-4">
          <h3>¡Bienvenido {userName}!</h3>
        </div>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="mb-0">Lista de blogs</h1>
        </div>

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
                    window.location.reload();
                  }}
                >
                  Mostrar Todos
                </Button>
              )}
            </div>
          )}
        </div>

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

export default BlogList;