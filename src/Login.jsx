import React, { useEffect, useState, useCallback } from "react"; // Importa React y hooks necesarios para gestionar el estado y los efectos del componente
import axios from "axios"; // Importa axios para realizar peticiones HTTP al backend
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Card,
  Tab,
  Nav,
} from "react-bootstrap"; // Importa componentes de react-bootstrap para crear la interfaz de usuario
import { useNavigate } from "react-router-dom"; // Importa el hook useNavigate para redireccionar al usuario
import { HOST } from "./HostConstant";

// Función para decodificar un token JWT y extraer su payload
const decodeToken = (token) => {
  try {
    const base64Url = token.split(".")[1]; // Se obtiene la segunda parte del token (payload) separada por puntos
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/"); // Se reemplazan caracteres para obtener una cadena base64 válida
    const jsonPayload = decodeURIComponent(
      atob(base64) // Se decodifica de base64 a una cadena
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)) // Se convierte cada carácter a su representación URI
        .join("")
    );
    return JSON.parse(jsonPayload); // Se parsea el JSON y se retorna el objeto resultante
  } catch (error) {
    console.error("Error al decodificar el token:", error); // Se muestra un error si falla la decodificación
    return null; // Se retorna null en caso de error
  }
};

const Login = () => {
  const navigate = useNavigate(); // Se inicializa el hook useNavigate para redirigir al usuario

  // Estado para almacenar los datos del formulario tanto de login como de registro
  const [formData, setFormData] = useState({
    loginEmail: "",
    loginPassword: "",
    registerName: "",
    registerEmail: "",
    registerPassword: "",
    registerConfirmPassword: "",
  });

  // useEffect para verificar si ya existe un token válido en el localStorage y redirigir si es así
  useEffect(() => {
    const token = localStorage.getItem("access_token"); // Se obtiene el token almacenado
    if (!token) {
      localStorage.removeItem("access_token"); // Elimina cualquier token inexistente
      return;
    }
    const payload = decodeToken(token); // Se decodifica el token para obtener su payload
    if (payload && payload.exp * 1000 > Date.now()) {
      navigate("/bloglist"); // Si el token es válido y no ha expirado, redirige a la lista de blogs
    } else {
      console.warn("Token expirado o inválido"); // Muestra advertencia si el token está expirado o es inválido
      localStorage.removeItem("access_token"); // Elimina el token inválido
    }
  }, [navigate]);

  // Función para actualizar los datos del formulario cuando el usuario escribe en los campos
  const handleInputChange = (e) => {
    const { name, value } = e.target; // Se extrae el nombre del campo y el valor ingresado
    setFormData((prevData) => ({ ...prevData, [name]: value })); // Se actualiza el estado del formulario
  };

  // Función para manejar el envío del formulario de inicio de sesión
  const handleLoginSubmit = async (e) => {
    e.preventDefault(); // Previene el comportamiento por defecto del formulario
    try {
      const response = await axios.post(
        "http://"+HOST+":8000/usuarios/login/", // URL del endpoint de login
        {
          email: formData.loginEmail, // Se envía el correo electrónico del formulario de login
          contrasenia: formData.loginPassword, // Se envía la contraseña del formulario de login
        }, {withCredentials: true} // Configuración para permitir credenciales en la petición
      );
      if (response.data.access_token) { // Verifica si se recibió un token en la respuesta
        console.log("Token recibido:"); // Registra en consola la recepción del token
        localStorage.setItem("access_token", response.data.access_token); // Guarda el token en localStorage
        navigate("/bloglist"); // Redirige al usuario a la lista de blogs
      } else {
        console.warn("No se recibió token:", response.data); // Muestra advertencia si no se recibe token
      }
    } catch (error) {
      console.error("Error en el login:", error); // Muestra el error en consola en caso de fallo en el login
    }
  };

  // Función para manejar el envío del formulario de registro
  const handleRegisterSubmit = async (e) => {
    e.preventDefault(); // Previene el comportamiento por defecto del formulario
    if (formData.registerPassword !== formData.registerConfirmPassword) {
      alert("Las contraseñas no coinciden."); // Alerta si las contraseñas no coinciden
      return;
    }
    try {
      const response = await axios.post("http://"+HOST+":8000/usuarios/", {
        nombre: formData.registerName, // Se envía el nombre ingresado para el registro
        email: formData.registerEmail, // Se envía el correo electrónico para el registro
        contrasenia: formData.registerPassword, // Se envía la contraseña para el registro
      });
    } catch (error) {
      console.error("Error en el registro:", error); // Se muestra el error si falla el registro
    }

    navigate(0); // Recarga la página para actualizar el estado luego del registro
  };

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #08b5bb, #065a82)", // Fondo con degradado
        color: "#fff", // Color del texto blanco
        minHeight: "100vh", // Altura mínima que cubre toda la ventana
        padding: "4rem 2rem", // Espaciado interno
      }}
    >
      <Container className="mt-5"> {/* Contenedor principal con margen superior */}
        <Row className="justify-content-center"> {/* Fila que centra su contenido */}
          <Col md={6}> {/* Columna que ocupa la mitad del ancho en dispositivos medianos */}
            <Card className="shadow-lg border-0 rounded-3"> {/* Tarjeta con sombra, sin borde y bordes redondeados */}
              <Card.Body className="p-4"> {/* Cuerpo de la tarjeta con padding */}
                <h3 className="text-center mb-4">¡Bienvenido!</h3> {/* Título centrado de bienvenida */}
                <Tab.Container defaultActiveKey="login"> {/* Contenedor de pestañas que inicia en la pestaña de login */}
                  <Nav variant="tabs" className="mb-4 justify-content-center"> {/* Barra de navegación con pestañas */}
                    <Nav.Item>
                      <Nav.Link eventKey="login" className="px-5"> {/* Pestaña para iniciar sesión */}
                        Iniciar Sesión
                      </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                      <Nav.Link eventKey="register" className="px-5"> {/* Pestaña para registrarse */}
                        Registrarse
                      </Nav.Link>
                    </Nav.Item>
                  </Nav>
                  <Tab.Content> {/* Contenido de las pestañas */}

                    <Tab.Pane eventKey="login"> {/* Contenido de la pestaña de login */}
                      <Form onSubmit={handleLoginSubmit}> {/* Formulario de inicio de sesión */}
                        <Form.Group className="mb-3"> {/* Grupo de formulario para el correo */}
                          <Form.Label>Correo Electrónico</Form.Label> {/* Etiqueta para el campo de correo */}
                          <Form.Control
                            type="email" // Tipo de input email
                            placeholder="Ingresa tu correo" // Texto de placeholder
                            name="loginEmail" // Nombre del campo para identificar en el estado
                            value={formData.loginEmail} // Valor del input desde el estado
                            onChange={handleInputChange} // Evento para manejar cambios en el input
                            required // Campo requerido
                          />
                        </Form.Group>
                        <Form.Group className="mb-3"> {/* Grupo de formulario para la contraseña */}
                          <Form.Label>Contraseña</Form.Label> {/* Etiqueta para el campo de contraseña */}
                          <Form.Control
                            type="password" // Tipo de input password
                            placeholder="Ingresa tu contraseña" // Placeholder para la contraseña
                            name="loginPassword" // Nombre del campo para identificar en el estado
                            value={formData.loginPassword} // Valor del input desde el estado
                            onChange={handleInputChange} // Evento para manejar el cambio del input
                            required // Campo requerido
                          />
                        </Form.Group>
                        <Button variant="primary" type="submit" className="w-100">
                          Iniciar Sesión
                        </Button> {/* Botón para enviar el formulario de login */}
                      </Form>
                    </Tab.Pane>

                    <Tab.Pane eventKey="register"> {/* Contenido de la pestaña de registro */}
                      <Form onSubmit={handleRegisterSubmit}> {/* Formulario de registro */}
                        <Form.Group className="mb-3"> {/* Grupo de formulario para el nombre */}
                          <Form.Label>
                            Nombre y apellidos (con este nombre te reconocerán en la
                            plataforma)
                          </Form.Label> {/* Etiqueta descriptiva para el nombre */}
                          <Form.Control
                            type="text" // Tipo de input texto
                            placeholder="Ingresa tu nombre y apellidos" // Placeholder descriptivo
                            name="registerName" // Nombre del campo para el registro
                            value={formData.registerName} // Valor del input desde el estado
                            onChange={handleInputChange} // Evento para manejar el cambio en el input
                            required // Campo obligatorio
                          />
                        </Form.Group>
                        <Form.Group className="mb-3"> {/* Grupo de formulario para el correo del registro */}
                          <Form.Label>Correo Electrónico</Form.Label> {/* Etiqueta para el campo de correo */}
                          <Form.Control
                            type="email" // Tipo de input email
                            placeholder="Ingresa tu correo" // Placeholder para el correo
                            name="registerEmail" // Nombre del campo para el registro
                            value={formData.registerEmail} // Valor desde el estado
                            onChange={handleInputChange} // Evento para actualizar el estado
                            required // Campo obligatorio
                          />
                        </Form.Group>
                        <Form.Group className="mb-3"> {/* Grupo de formulario para la contraseña del registro */}
                          <Form.Label>Contraseña</Form.Label> {/* Etiqueta para la contraseña */}
                          <Form.Control
                            type="password" // Tipo de input password
                            placeholder="Ingresa tu contraseña" // Placeholder para la contraseña
                            name="registerPassword" // Nombre del campo para identificar en el estado
                            value={formData.registerPassword} // Valor del input desde el estado
                            onChange={handleInputChange} // Evento para manejar cambios en el input
                            required // Campo obligatorio
                          />
                        </Form.Group>
                        <Form.Group className="mb-3"> {/* Grupo de formulario para confirmar la contraseña */}
                          <Form.Label>Confirmar Contraseña</Form.Label> {/* Etiqueta para confirmar la contraseña */}
                          <Form.Control
                            type="password" // Tipo de input password
                            placeholder="Confirma tu contraseña" // Placeholder para el campo de confirmar contraseña
                            name="registerConfirmPassword" // Nombre del campo para la confirmación
                            value={formData.registerConfirmPassword} // Valor del input desde el estado
                            onChange={handleInputChange} // Evento para actualizar el estado del input
                            required // Campo obligatorio
                          />
                        </Form.Group>
                        <Button variant="success" type="submit" className="w-100">
                          Registrarse
                        </Button> {/* Botón para enviar el formulario de registro */}
                      </Form>
                    </Tab.Pane>
                  </Tab.Content>
                </Tab.Container>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Login; // Exporta el componente Login para ser utilizado en otras partes de la aplicación