import React from "react";
import { useParams } from "react-router-dom";
import { Card, CardImg, CardBody, CardTitle, CardText, Badge } from "react-bootstrap";

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

const BlogDetail = () => {
    const { id } = useParams();
    const blog = blogs.find((blog) => blog.id === parseInt(id));


    if (!blog) {
        return <div>Blog no encontrado</div>;
    }

    const [selectedRating, setSelectedRating] = React.useState(null);
    const [isRated, setIsRated] = React.useState(false);

    const handleRating = (value) => {
        setSelectedRating(value);
        setIsRated(true);

        console.log(`Calificación: ${value}`);
    };

    return (
        <div className="container mt-5 mb-5">
            <Card className="shadow-sm" style={{ borderRadius: "10px" }}>
                <CardImg top src={blog.image} alt={blog.title} style={{ borderTopLeftRadius: "10px", borderTopRightRadius: "10px" }} />
                <CardBody>
                    <div className="mb-3">
                        {blog.tags.map((tag, index) => (
                            <Badge key={index} bg="primary" className="me-1">
                                {tag}
                            </Badge>
                        ))}
                    </div>
                    <div className="container mb-3">
                        <div className="row">
                            <div className="col-6">
                                <CardText>{blog.date}</CardText>
                            </div>
                            <div className="col-6 text-end">
                                <CardText>{blog.autor}</CardText>
                            </div>
                        </div>
                    </div>
                    <CardTitle tag="h5" className="fw-bold mb-2">
                        {blog.title}
                    </CardTitle>
                    <CardText className="text-muted">{blog.text}</CardText>
                    <CardText className="small text-muted">Calificación: {blog.calificacion}</CardText>

                    <CardText className="mt-3">
                        Califica este post:
                    </CardText>

                    <div className="rating">
                        {[0, 1, 2, 3, 4, 5].map((value) => (
                            <button
                                key={value}
                                className={`btn ${selectedRating === value ? 'btn-primary' : 'btn-outline-primary'} me-1`}
                                onClick={() => handleRating(value)}
                                disabled={isRated}
                            >
                                {value}
                            </button>
                        ))}
                    </div>

                    {isRated && <CardText className="mt-3 text-success">Gracias por tu calificación!</CardText>}
                </CardBody>
            </Card>
        </div>
    );
};

export default BlogDetail;