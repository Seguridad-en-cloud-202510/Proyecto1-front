import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  CardImg,
  CardBody,
  CardTitle,
  CardText,
  Badge,
} from "react-bootstrap";
import axios from "axios";

// Función para decodificar el token JWT
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

const BlogDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Estados para la información del blog y autor
  const [date, setDate] = useState("");
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [image, setImage] = useState("");
  const [autor, setAutor] = useState("");
  const [autorId, setAutorId] = useState(null);
  const [calificacion, setCalificacion] = useState(null);
  const [tags, setTags] = useState([]);

  // Estados para el usuario y calificación
  const [logueado, setLogueado] = useState(false);
  const [selectedRating, setSelectedRating] = useState(null);
  const [isRated, setIsRated] = useState(false);

  // Función para obtener el ID del usuario a partir del token
  const getUserId = useCallback(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      console.warn("Token no encontrado");
      navigate("/login");
      return null;
    }
    const payload = decodeToken(token);
    if (payload && payload.sub) {
      const userId = parseInt(payload.sub, 10);
      return userId;
    }
    return null;
  }, [navigate]);

  // Verificación del token y estado de logueado
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      localStorage.removeItem("access_token");
      setLogueado(false);
      return;
    }

    const payload = decodeToken(token);
    if (payload) {
      if (payload.exp * 1000 < Date.now()) {
        console.warn("Token expirado");
        localStorage.removeItem("access_token");
        setLogueado(false);
      } else {
        setLogueado(true);
      }
    } else {
      localStorage.removeItem("access_token");
      navigate("/login");
    }
  }, [navigate]);

  // Obtener datos del blog según ID
  useEffect(() => {
    axios
      .get(`http://localhost:8000/publicaciones/${id}/`)
      .then((response) => {
        const data = response.data;
        setDate(data.fecha_publicacion);
        setTitle(data.titulo);
        setText(data.contenido);
        setImage(data.portada);
        setTags(data.etiquetas);
        setAutorId(data.id_usuario);
      })
      .catch((error) => {
        console.error("Error al obtener el blog:", error);
        alert("Error al obtener el blog");
      });
  }, [id]);

  // Obtener la calificación promedio
  useEffect(() => {
    axios
      .get(`http://localhost:8000/calificaciones/${id}`)
      .then((response) => {
        const promedio = response.data.promedio;
        // Redondear a 1 decimal si es necesario
        setCalificacion(Math.round(promedio * 10) / 10);
      })
      .catch((error) => {
        console.error("Error al obtener la calificación promedio:", error);
        setCalificacion(0);
      });
  }, [id]);

  // Obtener información del autor cuando se tenga el ID
  useEffect(() => {
    if (autorId) {
      axios
        .get(`http://localhost:8000/usuarios/${autorId}/`)
        .then((response) => {
          setAutor(response.data.nombre);
        })
        .catch((error) => {
          console.error("Error al obtener el autor:", error);
        });
    }
  }, [autorId]);

  // Función para enviar la calificación
  const handleRating = async (value) => {
    setSelectedRating(value);
    const userId = getUserId();
    if (!userId) return;

    const payload = {
      id_usuario: userId,
      id_publicacion: parseInt(id, 10),
      calificacion: value,
    };

    try {
      const response = await axios.post(
        "http://localhost:8000/calificaciones/",
        payload,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Calificación enviada correctamente:", response.data);
      setIsRated(true);
      // Actualizar la calificación promedio
      const { data } = await axios.get(
        `http://localhost:8000/calificaciones/${id}`
      );
      setCalificacion(data.promedio);
    } catch (error) {
      console.error("Error al enviar la calificación:", error);
      alert("Ocurrió un error al enviar la calificación");
    }
  };

  return (
    <div className="container mt-5 mb-5">
      <Card className="shadow-sm" style={{ borderRadius: "10px" }}>
        <CardImg
          top
          src={image}
          alt={title}
          style={{ borderTopLeftRadius: "10px", borderTopRightRadius: "10px" }}
        />
        <CardBody>
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
            <hr />
          </div>

          <CardTitle tag="h5" className="fw-bold mb-2">
            {title}
          </CardTitle>
          <div
            className="text-muted"
            dangerouslySetInnerHTML={{ __html: text }}
          />
          <hr />
          <CardText className="small text-muted">
            Calificación actual:{" "}
            {calificacion !== null ? calificacion : "Cargando..."}
          </CardText>

          {logueado && (
            <div>
              <CardText className="mt-3">Califica este post:</CardText>
              <div className="rating">
                {[0, 1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    className={`btn ${
                      selectedRating === value
                        ? "btn-primary"
                        : "btn-outline-primary"
                    } me-1`}
                    onClick={() => handleRating(value)}
                    disabled={isRated}
                  >
                    {value}
                  </button>
                ))}
              </div>
              {isRated && (
                <CardText className="mt-3 text-success">
                  ¡Gracias por tu calificación!
                </CardText>
              )}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default BlogDetail;