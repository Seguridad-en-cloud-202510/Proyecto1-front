import React, { useState } from 'react';
import { Offcanvas, Form, Button, Badge } from 'react-bootstrap';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Importa los estilos de Quill

const NewBlog = () => {
    const [title, setTitle] = useState('');
    const [tags, setTags] = useState([]);
    const [content, setContent] = useState('');
    const [imagePreview, setImagePreview] = useState(null);
    const [showTagsCanvas, setShowTagsCanvas] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [allTags, setAllTags] = useState(["montañas", "aventura", "naturaleza", "playa", "arena", "sol", "ciudad", "noche", "luces"]);

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

    const toggleTag = (tag) => {
        setTags((prev) =>
            prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
        );
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleAddNewTag = () => {
        if (searchTerm && !allTags.includes(searchTerm)) {
            setAllTags([...allTags, searchTerm]);
            setTags([...tags, searchTerm]);
            setSearchTerm('');
        }
    };

    const handlePublicar = () => {

        // Aquí se deberían guardar los datos en la base de datos

        console.log('Título:', title);
        console.log('Contenido:', content);
        console.log('Tags:', tags);
        console.log('Imagen:', imagePreview);
    }
 
    const filteredTags = allTags.filter(tag =>
        tag.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="container my-5">
            <div className="row justify-content-center">
                <div className="col-md-8">
                    <div className="card shadow">
                        <div className="card-body">
                            <h2 className="card-title text-center mb-4">Crear Nueva Entrada de Blog</h2>
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
                                                [{ 'header': [1, 2, false] }],
                                                ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                                                [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
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
                                                src={imagePreview}
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
                                    <button type="button" className="btn btn-primary btn-lg" onClick={handlePublicar}>
                                        Publicar
                                    </button>
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
                    {filteredTags.map((tag, index) => (
                        <Form.Check
                            key={index}
                            type="checkbox"
                            label={tag}
                            checked={tags.includes(tag)}
                            onChange={() => toggleTag(tag)}
                        />
                    ))}
                    {!filteredTags.length && searchTerm && (
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