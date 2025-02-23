import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Card,
  Tab,
  Nav,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";

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

const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    loginEmail: "",
    loginPassword: "",
    registerName: "",
    registerEmail: "",
    registerPassword: "",
    registerConfirmPassword: "",
  });

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      localStorage.removeItem("access_token");
      return;
    }
    const payload = decodeToken(token);
    if (payload && payload.exp * 1000 > Date.now()) {
      navigate("/bloglist");
    } else {
      console.warn("Token expirado o inválido");
      localStorage.removeItem("access_token");
    }
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:8000/usuarios/login/",
        {
          email: formData.loginEmail,
          contrasenia: formData.loginPassword,
        }
      );
      if (response.data.access_token) {
        console.log("Token recibido:");
        localStorage.setItem("access_token", response.data.access_token);
        navigate("/bloglist");
      } else {
        console.warn("No se recibió token:", response.data);
      }
    } catch (error) {
      console.error("Error en el login:", error);
    }

  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (formData.registerPassword !== formData.registerConfirmPassword) {
      alert("Las contraseñas no coinciden.");
      return;
    }
    try {
      const response = await axios.post("http://localhost:8000/usuarios/", {
        nombre: formData.registerName,
        email: formData.registerEmail,
        contrasenia: formData.registerPassword,
      });
    } catch (error) {
      console.error("Error en el registro:", error);
    }

    navigate(0);
  };

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #08b5bb, #065a82)",
        color: "#fff",
        minHeight: "100vh",
        padding: "4rem 2rem",
      }}
    >
      <Container className="mt-5">
        <Row className="justify-content-center">
          <Col md={6}>
            <Card className="shadow-lg border-0 rounded-3">
              <Card.Body className="p-4">
                <h3 className="text-center mb-4">¡Bienvenido!</h3>
                <Tab.Container defaultActiveKey="login">
                  <Nav variant="tabs" className="mb-4 justify-content-center">
                    <Nav.Item>
                      <Nav.Link eventKey="login" className="px-5">
                        Iniciar Sesión
                      </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                      <Nav.Link eventKey="register" className="px-5">
                        Registrarse
                      </Nav.Link>
                    </Nav.Item>
                  </Nav>
                  <Tab.Content>

                    <Tab.Pane eventKey="login">
                      <Form onSubmit={handleLoginSubmit}>
                        <Form.Group className="mb-3">
                          <Form.Label>Correo Electrónico</Form.Label>
                          <Form.Control
                            type="email"
                            placeholder="Ingresa tu correo"
                            name="loginEmail"
                            value={formData.loginEmail}
                            onChange={handleInputChange}
                            required
                          />
                        </Form.Group>
                        <Form.Group className="mb-3">
                          <Form.Label>Contraseña</Form.Label>
                          <Form.Control
                            type="password"
                            placeholder="Ingresa tu contraseña"
                            name="loginPassword"
                            value={formData.loginPassword}
                            onChange={handleInputChange}
                            required
                          />
                        </Form.Group>
                        <Button variant="primary" type="submit" className="w-100">
                          Iniciar Sesión
                        </Button>
                      </Form>
                    </Tab.Pane>

                    <Tab.Pane eventKey="register">
                      <Form onSubmit={handleRegisterSubmit}>
                        <Form.Group className="mb-3">
                          <Form.Label>
                            Nombre y apellidos (con este nombre te reconocerán en la
                            plataforma)
                          </Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="Ingresa tu nombre y apellidos"
                            name="registerName"
                            value={formData.registerName}
                            onChange={handleInputChange}
                            required
                          />
                        </Form.Group>
                        <Form.Group className="mb-3">
                          <Form.Label>Correo Electrónico</Form.Label>
                          <Form.Control
                            type="email"
                            placeholder="Ingresa tu correo"
                            name="registerEmail"
                            value={formData.registerEmail}
                            onChange={handleInputChange}
                            required
                          />
                        </Form.Group>
                        <Form.Group className="mb-3">
                          <Form.Label>Contraseña</Form.Label>
                          <Form.Control
                            type="password"
                            placeholder="Ingresa tu contraseña"
                            name="registerPassword"
                            value={formData.registerPassword}
                            onChange={handleInputChange}
                            required
                          />
                        </Form.Group>
                        <Form.Group className="mb-3">
                          <Form.Label>Confirmar Contraseña</Form.Label>
                          <Form.Control
                            type="password"
                            placeholder="Confirma tu contraseña"
                            name="registerConfirmPassword"
                            value={formData.registerConfirmPassword}
                            onChange={handleInputChange}
                            required
                          />
                        </Form.Group>
                        <Button variant="success" type="submit" className="w-100">
                          Registrarse
                        </Button>
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

export default Login;