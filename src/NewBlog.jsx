import React, { useState, useEffect, useCallback } from 'react'; // Importa hooks de React para manejar estado, efectos y callbacks
import { Offcanvas, Form, Button, Badge } from 'react-bootstrap'; // Importa componentes de react-bootstrap para la UI
import ReactQuill from 'react-quill'; // Importa ReactQuill para el editor de texto enriquecido
import 'react-quill/dist/quill.snow.css'; // Importa los estilos del tema 'snow' para ReactQuill
import { useNavigate, useLocation } from 'react-router-dom'; // Importa hooks de react-router-dom para la navegación y el manejo de la ubicación
import axios from 'axios'; // Importa axios para hacer peticiones HTTP
import DOMPurify from 'dompurify'; // Importa DOMPurify para limpiar contenido HTML y prevenir ataques XSS
import { HOST } from "./HostConstant";

// Función para decodificar un token JWT y extraer su payload
const decodeToken = (token) => {
  try {
    // Se obtiene la parte del payload del token
    const base64Url = token.split('.')[1];
    // Se reemplazan caracteres para que la cadena sea base64 válida
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    // Se decodifica el base64 y se obtiene la cadena JSON
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload); // Se parsea y retorna el objeto resultante
  } catch (error) {
    console.error('Error al decodificar el token:', error); // Se muestra el error en consola si ocurre un fallo
    return null; // Retorna null en caso de error
  }
};

// Componente NewBlog para crear o editar una entrada de blog
const NewBlog = ({
  idEditar = null, // ID del blog a editar (por defecto null)
  titleEditar = '', // Título del blog a editar (por defecto cadena vacía)
  tagsEditar = [], // Array de etiquetas predefinidas para editar
  contentEditar = '', // Contenido a editar (por defecto cadena vacía)
  imagePreviewEditar = null, // Vista previa de imagen a editar (por defecto null)
  publicadoEditar = false, // Estado de publicación del blog a editar (por defecto false)
  editarBlog = false, // Flag que indica si se está en modo edición (por defecto false)
}) => {
  const navigate = useNavigate(); // Hook para la navegación programática
  const location = useLocation(); // Hook para acceder a la ubicación actual
  const stateFromNavigate = location.state || {}; // Se extrae el state enviado a través de navigate, o se establece un objeto vacío

  // Combina valores pasados por props con los enviados desde location.state
  const combinedIdEditar = stateFromNavigate.idEditar ?? idEditar;
  const combinedTitleEditar = stateFromNavigate.titleEditar ?? titleEditar;
  const combinedTagsEditar = stateFromNavigate.tagsEditar ?? tagsEditar;
  const combinedContentEditar = stateFromNavigate.contentEditar ?? contentEditar;
  const combinedImagePreviewEditar = stateFromNavigate.imagePreviewEditar ?? imagePreviewEditar;
  const combinedPublicadoEditar = stateFromNavigate.publicadoEditar ?? publicadoEditar;
  const combinedEditarBlog = stateFromNavigate.editarBlog ?? editarBlog;

  // Estados locales para el formulario y características de la entrada del blog
  const [title, setTitle] = useState(''); // Estado para el título del blog
  const [tags, setTags] = useState([]); // Estado para las etiquetas seleccionadas
  const [content, setContent] = useState(''); // Estado para el contenido del blog
  const [imagePreview, setImagePreview] = useState(null); // Estado para la vista previa de la imagen
  const [publicado, setPublicado] = useState(false); // Estado para la bandera de publicación
  const [showTagsCanvas, setShowTagsCanvas] = useState(false); // Estado para mostrar u ocultar el Offcanvas de etiquetas
  const [searchTerm, setSearchTerm] = useState(''); // Estado para el término de búsqueda de etiquetas
  const [allTags, setAllTags] = useState([]); // Estado para almacenar todas las etiquetas disponibles

  // Estados para personalizar la interfaz según si se edita o se crea una nueva entrada
  const [tituloPagina, setTituloPagina] = useState('Crear Nueva Entrada de Blog'); // Título de la página
  const [btn1, setBtn1] = useState('Crear'); // Texto del botón de acción 1
  const [btn2, setBtn2] = useState('Crear y Publicar'); // Texto del botón de acción 2

  // Efecto para verificar la validez del token de acceso al cargar el componente
  useEffect(() => {
    const token = localStorage.getItem('access_token'); // Obtiene el token del localStorage
    if (!token) {
      localStorage.removeItem('access_token'); // Elimina el token si no está presente
      navigate(0); // Recarga la página
      return;
    }
    const payload = decodeToken(token); // Decodifica el token para obtener su payload
    if (payload) {
      // Si el token ha expirado, elimina el token y redirige al login
      if (payload.exp * 1000 < Date.now()) {
        console.log('Token expirado');
        localStorage.removeItem('access_token');
        navigate('/login');
      }
    } else {
      // Si la decodificación falla, elimina el token y redirige al login
      localStorage.removeItem('access_token');
      navigate('/login');
    }
  }, [navigate]);

  // Efecto para obtener todas las etiquetas disponibles desde el backend
  useEffect(() => {
    axios.get('http://'+HOST+':8000/etiquetas')
      .then((response) => {
        setAllTags(response.data); // Guarda la respuesta en el estado allTags
      })
      .catch((error) => {
        console.error('Error fetching tags:', error); // Muestra error en consola si falla la petición
      });
  }, []);

  // Efecto para actualizar los estados del formulario si se está editando un blog
  useEffect(() => {
    if (combinedEditarBlog) {
      // Si se está en modo edición, se setean los valores recibidos
      setTitle(combinedTitleEditar);
      setTags(combinedTagsEditar);
      setContent(combinedContentEditar);
      setImagePreview(combinedImagePreviewEditar);
      setPublicado(combinedPublicadoEditar);
      setTituloPagina('Editar Entrada de Blog'); // Se cambia el título de la página
      setBtn1('Actualizar'); // Se cambia el texto del botón de acción 1
      setBtn2(combinedPublicadoEditar ? 'Actualizar y Despublicar' : 'Actualizar y Publicar'); // Se ajusta el texto del botón de acción 2 según el estado de publicación
    } else {
      // Si se está creando una nueva entrada, se usan los valores por defecto
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

  // Función para manejar el cambio de imagen, actualizando la vista previa
  const handleImageChange = (e) => {
    const file = e.target.files[0]; // Toma el primer archivo seleccionado
    if (file) {
      const reader = new FileReader(); // Crea una nueva instancia de FileReader
      reader.onloadend = () => {
        setImagePreview(reader.result); // Actualiza el estado de la imagen con el resultado en base64
      };
      reader.readAsDataURL(file); // Lee el archivo como una URL en base64
    }
  };

  // Función que convierte un archivo en base64 usando FileReader y devuelve una promesa
  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result); // Resuelve la promesa con el resultado leído
      reader.onerror = (error) => reject(error); // Rechaza la promesa en caso de error
    });
  };

  // Función para obtener la imagen en formato base64, convierte si imagePreview es un File
  const getImageBase64 = async () => {
    if (imagePreview instanceof File) {
      return await convertFileToBase64(imagePreview);
    }
    return imagePreview; // Si no es un File, retorna el valor actual de imagePreview
  };

  // Función para alternar una etiqueta en el estado tags (agregar o eliminar)
  const toggleTag = (tag) => {
    setTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  // Función para manejar el cambio en el campo de búsqueda de etiquetas
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Función para agregar un nuevo tag si no existe en allTags, usando el searchTerm
  const handleAddNewTag = () => {
    if (
      searchTerm &&
      !allTags.some(t => t.tag.toLowerCase() === searchTerm.toLowerCase())
    ) {
      const newTag = { tag: searchTerm };
      setAllTags((prev) => [...prev, newTag]); // Agrega el nuevo tag al estado allTags
      setTags((prev) => [...prev, searchTerm]); // También lo añade a las etiquetas seleccionadas
      setSearchTerm(''); // Reinicia el campo de búsqueda
    }
  };

  // Función para obtener el ID del usuario a partir del token almacenado; usa useCallback para guardar la función
  const getUserId = useCallback(() => {
    const token = localStorage.getItem('access_token'); // Obtiene el token
    if (token) {
      const payload = decodeToken(token); // Decodifica el token
      if (payload && payload.sub) {
        const user_id = parseInt(payload.sub, 10); // Parsea el ID de usuario
        return user_id; // Retorna el ID
      }
    }
    console.log('Token no encontrado'); // Informa en consola si no encuentra token
    navigate('/login'); // Redirige al login
    return undefined;
  }, [navigate]);

  // Función para manejar la acción 1 (crear/actualizar sin publicar o con publicación según estado)
  const handleAccion1 = async () => {
    try {
      const token = localStorage.getItem('access_token'); // Obtiene el token de acceso
      const user_id = getUserId(); // Obtiene el ID del usuario
      const base64Image = imagePreview ? await getImageBase64() : null; // Obtiene la imagen en base64 si existe
      const sanitizedContent = DOMPurify.sanitize(content); // Limpia el contenido HTML para prevenir XSS
  
      if (!combinedEditarBlog) { // Si no se está editando, se crea una nueva entrada
        const response = await axios.post('http://'+HOST+':8000/publicaciones/', {
          id_usuario: user_id,
          titulo: title,
          contenido: sanitizedContent,
          fecha_publicacion: new Date().toISOString().split('T')[0], // Se establece la fecha actual
          portada: base64Image,
          publicado: false,
          etiquetas: tags,
        }, {
          withCredentials: true, // Aquí se envía la cookie
          headers: { 'Authorization': `Bearer ${token}` } // Puedes eliminar esta línea si el backend no lo requiere
        });
      } else { // Si se está editando, se actualiza la entrada existente
        const response = await axios.put(`http://`+HOST+`:8000/publicaciones/${combinedIdEditar}/`, {
          titulo: title,
          contenido: sanitizedContent,
          portada: base64Image,
          publicado: combinedPublicadoEditar,
          etiquetas: tags,
        }, {
          withCredentials: true, // Se incluye también en la petición PUT
          headers: { 'Authorization': `Bearer ${token}` }
        });
      }
      navigate('/bloglist'); // Después de la acción, redirige a la lista de blogs
    } catch (error) {
      console.error('Error al procesar la acción 1:', error); // Muestra error en consola si ocurre un fallo
      alert('Error al procesar la acción'); // Notifica al usuario mediante alerta
    }
  };

  // Función para manejar la acción 2 (crear/actualizar con estado de publicación invertido o publicado)
  const handleAccion2 = async () => {
    try {
      const token = localStorage.getItem('access_token'); // Obtiene el token
      const user_id = getUserId(); // Obtiene el ID del usuario
      const base64Image = imagePreview ? await getImageBase64() : null; // Obtiene la imagen en base64 si existe
      const sanitizedContent = DOMPurify.sanitize(content); // Limpia el contenido HTML
  
      if (!combinedEditarBlog) { // Si se está creando una nueva entrada
        const response = await axios.post('http://'+HOST+':8000/publicaciones/', {
          id_usuario: user_id,
          titulo: title,
          contenido: sanitizedContent,
          fecha_publicacion: new Date().toISOString().split('T')[0],
          portada: base64Image,
          publicado: true, // En este caso, la entrada se crea como publicada
          etiquetas: tags,
        }, {
          withCredentials: true,
          headers: { 'Authorization': `Bearer ${token}` }
        });
      } else { // Si se está editando, se invierte el estado de publicación
        const nuevoEstado = !combinedPublicadoEditar;
        const response = await axios.put(`http://`+HOST+`:8000/publicaciones/${combinedIdEditar}/`, {
          titulo: title,
          contenido: sanitizedContent,
          portada: base64Image,
          publicado: nuevoEstado,
          etiquetas: tags,
        }, {
          withCredentials: true,
          headers: { 'Authorization': `Bearer ${token}` }
        });
      }
      navigate('/bloglist'); // Redirige a la lista de blogs luego de la acción
    } catch (error) {
      console.error('Error al procesar la acción 2:', error); // Muestra error en consola si falla la acción
      alert('Error al actualizar la publicación'); // Notifica al usuario mediante alerta
    }
  };

  // Filtra las etiquetas disponibles en allTags según el término de búsqueda ingresado
  const filteredTags = allTags.filter(t =>
    t.tag && t.tag.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container my-5">
      {/* Contenedor principal con margen vertical */}
      <div className="row justify-content-center">
        {/* Fila que centra el contenido */}
        <div className="col-md-8">
          {/* Columna centrada de ancho mediano */}
          <div className="card shadow">
            {/* Tarjeta con sombra */}
            <div className="card-body">
              {/* Cuerpo de la tarjeta */}
              <h2 className="card-title text-center mb-4">{tituloPagina}</h2> {/* Título dinámico de la página */}
              <form>
                {/* Campo para el título del blog */}
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

                {/* Campo para el contenido del blog utilizando ReactQuill */}
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

                {/* Campo para seleccionar la imagen de portada */}
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
                      {/* Muestra una vista previa de la imagen, si está disponible */}
                      <img
                        src={typeof imagePreview === 'string' ? imagePreview : undefined}
                        alt="Vista previa"
                        className="img-fluid rounded"
                      />
                    </div>
                  )}
                </div>

                {/* Sección para manejar etiquetas */}
                <div className="form-group mb-4">
                  <Button variant="outline-primary" onClick={() => setShowTagsCanvas(true)}>
                    + Modificar Tags
                  </Button>
                  <div className="mt-2">
                    {/* Mapea y muestra cada etiqueta seleccionada como un Badge */}
                    {tags.map((tag, index) => (
                      <Badge key={index} bg="primary" className="me-1">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Botones de acción para enviar el formulario */}
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

      {/* Offcanvas para seleccionar y modificar etiquetas */}
      <Offcanvas show={showTagsCanvas} onHide={() => setShowTagsCanvas(false)} placement="end">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Seleccionar Tags</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          {/* Campo para buscar etiquetas */}
          <Form.Group className="mb-3">
            <Form.Label>Buscar tags</Form.Label>
            <Form.Control
              type="text"
              placeholder="Buscar tags..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </Form.Group>
          {/* Mapea y muestra las etiquetas filtradas */}
          {filteredTags.map((t, index) => (
            <Form.Check
              key={index}
              type="checkbox"
              label={t.tag}
              checked={tags.includes(t.tag)}
              onChange={() => toggleTag(t.tag)}
            />
          ))}
          {/* Si no hay resultados y se ha ingresado un término, muestra un botón para crear un nuevo tag */}
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

export default NewBlog; // Exporta el componente NewBlog para su uso en otras partes de la aplicación