import React, { useState } from "react";
import { Card, CardImg, CardBody, CardTitle, CardText, Badge, Offcanvas, Form, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const blogs = [
    {
        id: 1,
        date: "2024-09-01",
        title: "Exploring the Mountains",
        text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin vel nisi id quam...",
        image: "https://placehold.co/300x200",
        autor: "Juan Perez",
        calificacion: 5,
        tags: ["montañas", "aventura", "naturaleza"],
    },
    {
        id: 2,
        date: "2024-09-05",
        title: "A Day at the Beach",
        text: "Suspendisse potenti. Cras sit amet sapien et quam volutpat ullamcorper...",
        image: "https://placehold.co/300x200",
        autor: "Maria Rodriguez",
        calificacion: 4.2,
        tags: ["playa", "arena", "sol"],
    },
    {
        id: 3,
        date: "2025-01-10",
        title: "City Lights and Nightlife",
        text: "Vestibulum in nibh nec risus pulvinar consequat. Praesent non nisi vitae libero...",
        image: "https://placehold.co/300x200",
        autor: "Carlos Gutierrez",
        calificacion: 4.8,
        tags: ["ciudad", "noche", "luces"],
    },
];

const BlogCard = ({ id, date, title, text, image, autor, calificacion, tags }) => {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate(`/bloglist/${id}`);
    };
    

    return (
        <Card className="shadow-sm mb-4" style={{ borderRadius: "10px", cursor: "pointer" }} onClick={handleClick}>
            <CardImg top src={image} alt={title} style={{ borderTopLeftRadius: "10px", borderTopRightRadius: "10px" }} />
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
                </div>
                <CardTitle tag="h5" className="fw-bold mb-2">
                    {title}
                </CardTitle>
                <CardText className="text-muted">{text}</CardText>
                <CardText className="card-footer small text-muted">Calificación: {calificacion}</CardText>
            </CardBody>
        </Card>
    );
};

const BlogList = () => {
    const [showFilter, setShowFilter] = useState(false);
    const [selectedTags, setSelectedTags] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");

    const handleCloseFilter = () => setShowFilter(false);
    const handleShowFilter = () => setShowFilter(true);

    const navigate = useNavigate();

    const handleNavigateNewBlog = () => {
        navigate(`/new_blog`);
    }

    const toggleTag = (tag) => {
        setSelectedTags((prev) =>
            prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
        );
    };

    const filteredBlogs = blogs.filter((blog) => {
        const matchesSearchTerm = blog.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesTags = selectedTags.length === 0 || selectedTags.every((tag) => blog.tags.includes(tag));
        return matchesSearchTerm && matchesTags;
    });

    const allTags = [...new Set(blogs.flatMap((blog) => blog.tags))];

    return (
        <>
            <div className="container mt-5">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h1 className="mb-0">Lista de blogs</h1>
                </div>

                <div className="row mb-4">

                    <div className="col-auto">

                    <Button variant="primary" onClick={handleShowFilter}>
                        Filtrar
                    </Button>

                    </div>
                    
                    <div className="col-auto">

                    <Button variant="primary" onClick={handleNavigateNewBlog}>
                        Nuevo Blog
                    </Button>

                    </div>

                    <div className="col-auto">

                    <Button variant="primary" onClick={handleShowFilter}>
                        Administrar Blogs
                    </Button>

                    </div>

                </div>
                <div className="row">
                    {filteredBlogs.map((blog) => (
                        <div className="col-md-4" key={blog.id}>
                            <BlogCard
                                id={blog.id}
                                date={blog.date}
                                title={blog.title}
                                text={blog.text}
                                image={blog.image}
                                autor={blog.autor}
                                calificacion={blog.calificacion}
                                tags={blog.tags}
                            />
                        </div>
                    ))}
                </div>
            </div>

            <Offcanvas show={showFilter} onHide={handleCloseFilter} placement="end">
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
                        <Form.Label>Filtrar por tags</Form.Label>
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