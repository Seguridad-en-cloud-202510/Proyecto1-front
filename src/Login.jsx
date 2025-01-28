import React, { useState } from "react";
import { Container, Row, Col, Form, Button, Card, Tab, Nav } from "react-bootstrap";

const Login = () => {
  const [formData, setFormData] = useState({
    loginEmail: "",
    loginPassword: "",
    registerName: "",
    registerEmail: "",
    registerPassword: "",
    registerConfirmPassword: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    console.log("Login Data:", {
      email: formData.loginEmail,
      password: formData.loginPassword,
    });
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    if (formData.registerPassword !== formData.registerConfirmPassword) {
      alert("Las contraseñas no coinciden.");
      return;
    }
    console.log("Register Data:", {
      name: formData.registerName,
      email: formData.registerEmail,
      password: formData.registerPassword,
    });
  };

  return (
    <div style={{
        background: 'linear-gradient(135deg, #08b5bb, #065a82)',
        color: '#fff',
        minHeight: '100vh',
        padding: '4rem 2rem',
      }}
      >

    
    <Container className="mt-5" >
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
                  {/* Login Form */}
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

                  {/* Register Form */}
                  <Tab.Pane eventKey="register">
                    <Form onSubmit={handleRegisterSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label>Nombre y apellidos (con este nombre te reconoceran en la plataforma)</Form.Label>
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
