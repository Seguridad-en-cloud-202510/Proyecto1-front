import React, { useEffect, useState, useCallback } from "react"; // Se importan React y algunos hooks necesarios para el manejo de estados y efectos en el componente
import { useParams, useNavigate } from "react-router-dom"; // Se importan hooks de react-router-dom para obtener parámetros desde la URL y para la navegación
import {
  Card,
  CardImg,
  CardBody,
  CardTitle,
  CardText,
  Badge,
} from "react-bootstrap"; // Se importan componentes de react-bootstrap para la estructura y estilo visual de la tarjeta
import axios from "axios"; // Se importa axios para realizar peticiones HTTP
import { HOST } from "./HostConstant";

// Función para decodificar el token JWT
const decodeToken = (token) => {
  try {
    // Se obtiene la parte del payload del token (segunda parte separada por puntos)
    const base64Url = token.split(".")[1];
    // Se reemplazan caracteres especiales para formar una cadena base64 válida
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    // Se decodifica la cadena, se convierte a string URI y se parsea el JSON resultante
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload); // Se retorna el objeto decodificado del token
  } catch (error) {
    console.error("Error al decodificar el token:", error); // Se muestra en consola si ocurre algún error al decodificar
    return null; // Retorna null en caso de error
  }
};

const BlogDetail = () => {
  const { id } = useParams(); // Se obtiene el parámetro "id" de la URL
  const navigate = useNavigate(); // Se inicializa el hook para navegación

  // Estados para la información del blog y autor
  const [date, setDate] = useState(""); // Estado para la fecha de publicación
  const [title, setTitle] = useState(""); // Estado para el título del blog
  const [text, setText] = useState(""); // Estado para el contenido del blog
  const [image, setImage] = useState(""); // Estado para la imagen de portada del blog
  const [autor, setAutor] = useState(""); // Estado para el nombre del autor
  const [autorId, setAutorId] = useState(null); // Estado para almacenar el ID del autor
  const [calificacion, setCalificacion] = useState(null); // Estado para la calificación promedio del blog
  const [tags, setTags] = useState([]); // Estado para las etiquetas asociadas al blog

  // Estados para el usuario y calificación
  const [logueado, setLogueado] = useState(false); // Estado para determinar si el usuario está logueado
  const [selectedRating, setSelectedRating] = useState(null); // Estado para la calificación seleccionada por el usuario
  const [isRated, setIsRated] = useState(false); // Estado para saber si el usuario ya calificó

  // Función para obtener el ID del usuario a partir del token
  const getUserId = useCallback(() => {
    const token = localStorage.getItem("access_token"); // Se obtiene el token almacenado en localStorage
    if (!token) {
      console.warn("Token no encontrado");
      navigate("/login"); // Se redirige al login si no se encuentra el token
      return null;
    }
    const payload = decodeToken(token); // Se decodifica el token para obtener el payload
    if (payload && payload.sub) {
      const userId = parseInt(payload.sub, 10); // Se parsea el ID del usuario que viene en el payload
      return userId; // Se retorna el ID del usuario
    }
    return null;
  }, [navigate]);

  // Verificación del token y estado de logueado
  useEffect(() => {
    const token = localStorage.getItem("access_token"); // Se obtiene el token del localStorage
    if (!token) {
      localStorage.removeItem("access_token"); // Se limpia el token del localStorage si no existe
      setLogueado(false); // Se actualiza el estado para reflejar que el usuario no está logueado
      return;
    }

    const payload = decodeToken(token); // Se decodifica el token
    if (payload) {
      // Se verifica si el token ha expirado comparando la fecha de expiración con la fecha actual
      if (payload.exp * 1000 < Date.now()) {
        console.warn("Token expirado");
        localStorage.removeItem("access_token"); // Se elimina el token expirado
        setLogueado(false); // Se actualiza el estado a no logueado
      } else {
        setLogueado(true); // Se actualiza el estado a logueado si el token es válido
      }
    } else {
      localStorage.removeItem("access_token"); // En caso de error en la decodificación se elimina el token
      navigate("/login"); // Se redirige al login
    }
  }, [navigate]);

  // Obtener datos del blog según ID
  useEffect(() => {
    axios
      .get(`http://`+HOST+`:8000/publicaciones/${id}/`) // Se hace una petición GET para obtener la información del blog
      .then((response) => {
        const data = response.data; // Se extraen los datos de la respuesta
        setDate(data.fecha_publicacion); // Se actualiza el estado de la fecha de publicación
        setTitle(data.titulo); // Se actualiza el estado del título
        setText(data.contenido); // Se actualiza el estado del contenido
        setImage(data.portada); // Se actualiza el estado de la imagen de portada
        setTags(data.etiquetas); // Se actualiza el estado de las etiquetas
        setAutorId(data.id_usuario); // Se actualiza el estado con el ID del autor para futuras peticiones
      })
      .catch((error) => {
        console.error("Error al obtener el blog:", error); // Se muestra el error en la consola
        alert("Error al obtener el blog"); // Se le notifica al usuario que ocurrió un error
      });
  }, [id]);

  // Obtener la calificación promedio
  useEffect(() => {
    axios
      .get(`http://`+HOST+`:8000/calificaciones/${id}`) // Se realiza una petición GET para obtener la calificación promedio
      .then((response) => {
        const promedio = response.data.promedio; // Se extrae el promedio del response
        // Se redondea el promedio a un decimal
        setCalificacion(Math.round(promedio * 10) / 10);
      })
      .catch((error) => {
        console.error("Error al obtener la calificación promedio:", error); // Se muestra el error en la consola
        setCalificacion(0); // Se establece la calificación a cero en caso de error
      });
  }, [id]);

  // Obtener información del autor cuando se tenga el ID
  useEffect(() => {
    if (autorId) {
      axios
        .get(`http://`+HOST+`:8000/usuarios/${autorId}/`) // Se hace una petición GET para obtener la información del autor usando el ID
        .then((response) => {
          setAutor(response.data.nombre); // Se actualiza el estado del nombre del autor con la respuesta
        })
        .catch((error) => {
          console.error("Error al obtener el autor:", error); // Se notifica en la consola si ocurre algún error al obtener el autor
        });
    }
  }, [autorId]);

  // Función para enviar la calificación
  const handleRating = async (value) => {
    setSelectedRating(value); // Se actualiza el estado con la calificación seleccionada por el usuario
    const userId = getUserId(); // Se obtiene el ID del usuario a partir del token
    if (!userId) return; // Se detiene la función si no se obtiene el ID del usuario

    const payload = {
      id_usuario: userId, // Se asigna el ID del usuario que califica
      id_publicacion: parseInt(id, 10), // Se asigna el ID del blog en formato entero
      calificacion: value, // Se asigna el valor de la calificación
    };

    try {
      const response = await axios.post(
        "http://"+HOST+":8000/calificaciones/", // Se envía la calificación haciendo una petición POST
        payload,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`, // Se pasa el token de autenticación en los headers
            "Content-Type": "application/json", // Se especifica el tipo de contenido
          },
        }, {withCredentials: true} // Configuración para permitir credenciales en la petición
      );
      console.log("Calificación enviada correctamente:", response.data); // Se muestra en consola la respuesta exitosa
      setIsRated(true); // Se actualiza el estado para indicar que ya se envió la calificación
      // Actualizar la calificación promedio tras enviar la nueva calificación
      const { data } = await axios.get(
        `http://`+HOST+`:8000/calificaciones/${id}` // Se vuelve a obtener la calificación promedio actualizada
      );
      setCalificacion(data.promedio); // Se actualiza el estado con el nuevo promedio
    } catch (error) {
      console.error("Error al enviar la calificación:", error); // Se muestra el error en caso de fallo al enviar la calificación
      alert("Ocurrió un error al enviar la calificación"); // Se notifica al usuario que ocurrió un error
    }
  };

  return (
    <div className="container mt-5 mb-5"> {/* Contenedor principal con márgenes */}
      <Card className="shadow-sm" style={{ borderRadius: "10px" }}> {/* Tarjeta con sombra y bordes redondeados */}
        <CardImg
          top
          src={image} // Se asigna la imagen de portada del blog
          alt={title} // Se asigna el título como texto alternativo
          style={{ borderTopLeftRadius: "10px", borderTopRightRadius: "10px" }} // Se redondean las esquinas superiores de la imagen
        />
        <CardBody> {/* Cuerpo de la tarjeta donde se muestra la información */}
          <div className="mb-3">
            {tags.map((tag, index) => ( // Se itera sobre las etiquetas del blog
              <Badge key={index} bg="primary" className="me-1"> {/* Etiqueta de bootstrap para mostrar cada tag */}
                {tag}
              </Badge>
            ))}
          </div>

          <div className="container mb-3">
            <div className="row">
              <div className="col-6">
                <CardText>{date}</CardText> {/* Se muestra la fecha de publicación */}
              </div>
              <div className="col-6 text-end">
                <CardText>{autor}</CardText> {/* Se muestra el nombre del autor, alineado a la derecha */}
              </div>
            </div>
            <hr /> {/* Línea horizontal para separar secciones */}
          </div>

          <CardTitle tag="h5" className="fw-bold mb-2">
            {title} {/* Título del blog */}
          </CardTitle>
          <div
            className="text-muted"
            dangerouslySetInnerHTML={{ __html: text }} // Se renderiza el contenido HTML del blog de forma segura
          />
          <hr /> {/* Separador visual */}
          <CardText className="small text-muted">
            Calificación actual:{" "}
            {calificacion !== null ? calificacion : "Cargando..."} {/* Se muestra la calificación promedio, o un mensaje de carga */}
          </CardText>

          {logueado && ( // Si el usuario está logueado, se muestra la sección de calificación
            <div>
              <CardText className="mt-3">Califica este post:</CardText> {/* Indicador para que el usuario califique */}
              <div className="rating">
                {[0, 1, 2, 3, 4, 5].map((value) => ( // Se crean botones para cada valor de calificación
                  <button
                    key={value}
                    className={`btn ${
                      selectedRating === value
                        ? "btn-primary" // Botón activo con fondo primario si es el seleccionado
                        : "btn-outline-primary" // Botón con borde primario si no es el seleccionado
                    } me-1`}
                    onClick={() => handleRating(value)} // Al hacer clic se envía la calificación correspondiente
                    disabled={isRated} // Se deshabilitan los botones si el usuario ya calificó
                  >
                    {value} {/* Se muestra el valor de la calificación */}
                  </button>
                ))}
              </div>
              {isRated && ( // Si ya se envió la calificación, se muestra un mensaje de agradecimiento
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

export default BlogDetail; // Se exporta el componente BlogDetail para su uso en otras partes de la aplicación