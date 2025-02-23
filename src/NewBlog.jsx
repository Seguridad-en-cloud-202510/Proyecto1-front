import React, { useState, useEffect, useCallback } from 'react';
import { Offcanvas, Form, Button, Badge } from 'react-bootstrap';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import DOMPurify from 'dompurify';

const decodeToken = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error al decodificar el token:', error);
    return null;
  }
};

const NewBlog = ({
  idEditar = null,
  titleEditar = '',
  tagsEditar = [],
  contentEditar = '',
  imagePreviewEditar = null,
  publicadoEditar = false,
  editarBlog = false,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const stateFromNavigate = location.state || {};

  const combinedIdEditar = stateFromNavigate.idEditar ?? idEditar;
  const combinedTitleEditar = stateFromNavigate.titleEditar ?? titleEditar;
  const combinedTagsEditar = stateFromNavigate.tagsEditar ?? tagsEditar;
  const combinedContentEditar = stateFromNavigate.contentEditar ?? contentEditar;
  const combinedImagePreviewEditar = stateFromNavigate.imagePreviewEditar ?? imagePreviewEditar;
  const combinedPublicadoEditar = stateFromNavigate.publicadoEditar ?? publicadoEditar;
  const combinedEditarBlog = stateFromNavigate.editarBlog ?? editarBlog;

  const [title, setTitle] = useState('');
  const [tags, setTags] = useState([]);
  const [content, setContent] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [publicado, setPublicado] = useState(false);
  const [showTagsCanvas, setShowTagsCanvas] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [allTags, setAllTags] = useState([]);

  const [tituloPagina, setTituloPagina] = useState('Crear Nueva Entrada de Blog');
  const [btn1, setBtn1] = useState('Crear');
  const [btn2, setBtn2] = useState('Crear y Publicar');

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      localStorage.removeItem('access_token');
      navigate(0);
      return;
    }
    const payload = decodeToken(token);
    if (payload) {
      if (payload.exp * 1000 < Date.now()) {
        console.log('Token expirado');
        localStorage.removeItem('access_token');
        navigate('/login');
      }
    } else {
      localStorage.removeItem('access_token');
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    axios.get('http://localhost:8000/etiquetas')
      .then((response) => {
        setAllTags(response.data);
      })
      .catch((error) => {
        console.error('Error fetching tags:', error);
      });
  }, []);

  useEffect(() => {
    if (combinedEditarBlog) {
      setTitle(combinedTitleEditar);
      setTags(combinedTagsEditar);
      setContent(combinedContentEditar);
      setImagePreview(combinedImagePreviewEditar);
      setPublicado(combinedPublicadoEditar);
      setTituloPagina('Editar Entrada de Blog');
      setBtn1('Actualizar');
      setBtn2(combinedPublicadoEditar ? 'Actualizar y Despublicar' : 'Actualizar y Publicar');
    } else {
      setTituloPagina('Crear Nueva Entrada de Blog');
      setBtn1('Crear');
      setBtn2('Crear y Publicar');
    }
  }, [
    combinedEditarBlog,
    combinedTitleEditar,
    combinedTagsEditar,
    combinedContentEditar,
    combinedImagePreviewEditar,
    combinedPublicadoEditar
  ]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const getImageBase64 = async () => {
    if (imagePreview instanceof File) {
      return await convertFileToBase64(imagePreview);
    }
    return imagePreview;
  };

  const toggleTag = (tag) => {
    setTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleAddNewTag = () => {
    if (
      searchTerm &&
      !allTags.some(t => t.tag.toLowerCase() === searchTerm.toLowerCase())
    ) {
      const newTag = { tag: searchTerm };
      setAllTags((prev) => [...prev, newTag]);
      setTags((prev) => [...prev, searchTerm]);
      setSearchTerm('');
    }
  };

  const getUserId = useCallback(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      const payload = decodeToken(token);
      if (payload && payload.sub) {
        const user_id = parseInt(payload.sub, 10);
        return user_id;
      }
    }
    console.log('Token no encontrado');
    navigate('/login');
    return undefined;
  }, [navigate]);

  const handleAccion1 = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const user_id = getUserId();
      const base64Image = imagePreview ? await getImageBase64() : null;
      const sanitizedContent = DOMPurify.sanitize(content);
      
      if (!combinedEditarBlog) {
        const response = await axios.post('http://localhost:8000/publicaciones/', {
          id_usuario: user_id,
          titulo: title,
          contenido: sanitizedContent,
          fecha_publicacion: new Date().toISOString().split('T')[0],
          portada: base64Image,
          publicado: false,
          etiquetas: tags,
        }, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
      } else {
        const response = await axios.put(`http://localhost:8000/publicaciones/${combinedIdEditar}/`, {
          titulo: title,
          contenido: sanitizedContent,
          portada: base64Image,
          publicado: combinedPublicadoEditar,
          etiquetas: tags,
        }, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
      }
      navigate('/bloglist');
    } catch (error) {
      console.error('Error al procesar la acción 1:', error);
      alert('Error al procesar la acción');
    }
  };

  const handleAccion2 = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const user_id = getUserId();
      const base64Image = imagePreview ? await getImageBase64() : null;
      const sanitizedContent = DOMPurify.sanitize(content);
      
      if (!combinedEditarBlog) {
        const response = await axios.post('http://localhost:8000/publicaciones/', {
          id_usuario: user_id,
          titulo: title,
          contenido: sanitizedContent,
          fecha_publicacion: new Date().toISOString().split('T')[0],
          portada: base64Image,
          publicado: true,
          etiquetas: tags,
        }, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
      } else {
        const nuevoEstado = !combinedPublicadoEditar;
        const response = await axios.put(`http://localhost:8000/publicaciones/${combinedIdEditar}/`, {
          titulo: title,
          contenido: sanitizedContent,
          portada: base64Image,
          publicado: nuevoEstado,
          etiquetas: tags,
        }, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
      }
      navigate('/bloglist');
    } catch (error) {
      console.error('Error al procesar la acción 2:', error);
      alert('Error al actualizar la publicación');
    }
  };

  const filteredTags = allTags.filter(t =>
    t.tag && t.tag.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container my-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card shadow">
            <div className="card-body">
              <h2 className="card-title text-center mb-4">{tituloPagina}</h2>
              <form>
                <div className="form-group mb-3">
                  <label htmlFor="title" className="form-label">Título</label>
                  <input
                    type="text"
                    className="form-control"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group mb-3">
                  <label htmlFor="content" className="form-label">Contenido</label>
                  <ReactQuill
                    theme="snow"
                    value={content}
                    onChange={setContent}
                    modules={{
                      toolbar: [
                        [{ header: [1, 2, false] }],
                        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                        [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
                        ['link', 'image'],
                        ['clean']
                      ],
                    }}
                    formats={[
                      'header',
                      'bold', 'italic', 'underline', 'strike', 'blockquote',
                      'list', 'bullet', 'indent',
                      'link', 'image'
                    ]}
                  />
                </div>

                <div className="form-group mb-4">
                  <label htmlFor="image" className="form-label">Portada</label>
                  <input
                    type="file"
                    className="form-control"
                    id="image"
                    onChange={handleImageChange}
                  />
                  {imagePreview && (
                    <div className="mt-3">
                      <img
                        src={typeof imagePreview === 'string' ? imagePreview : undefined}
                        alt="Vista previa"
                        className="img-fluid rounded"
                      />
                    </div>
                  )}
                </div>

                <div className="form-group mb-4">
                  <Button variant="outline-primary" onClick={() => setShowTagsCanvas(true)}>
                    + Modificar Tags
                  </Button>
                  <div className="mt-2">
                    {tags.map((tag, index) => (
                      <Badge key={index} bg="primary" className="me-1">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="d-grid">
                  <div className="row">
                    <div className="col-auto">
                      <button
                        type="button"
                        className="btn btn-primary btn-lg"
                        onClick={handleAccion1}
                      >
                        {btn1}
                      </button>
                    </div>
                    <div className="col-auto">
                      <button
                        type="button"
                        className="btn btn-primary btn-lg"
                        onClick={handleAccion2}
                      >
                        {btn2}
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <Offcanvas show={showTagsCanvas} onHide={() => setShowTagsCanvas(false)} placement="end">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Seleccionar Tags</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Form.Group className="mb-3">
            <Form.Label>Buscar tags</Form.Label>
            <Form.Control
              type="text"
              placeholder="Buscar tags..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </Form.Group>
          {filteredTags.map((t, index) => (
            <Form.Check
              key={index}
              type="checkbox"
              label={t.tag}
              checked={tags.includes(t.tag)}
              onChange={() => toggleTag(t.tag)}
            />
          ))}
          {filteredTags.length === 0 && searchTerm && (
            <Button variant="primary" onClick={handleAddNewTag}>
              Crear nuevo tag: "{searchTerm}"
            </Button>
          )}
          <div className="mt-3">
            <Button variant="primary" onClick={() => setShowTagsCanvas(false)}>
              Aceptar
            </Button>
          </div>
        </Offcanvas.Body>
      </Offcanvas>
    </div>
  );
};

export default NewBlog;