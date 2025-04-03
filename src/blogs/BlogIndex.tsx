import React from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet";

const BlogIndex: React.FC = () => {
  const blogs = [
    {
      slug: "armar-pc-gamer-colombia-2025",
      title: "Guía Completa para Armar tu Primer PC Gamer en Colombia (2025)",
      excerpt: "Aprende a armar tu PC gamer en Colombia con esta guía paso a paso.",
      date: "2025-04-01",
      author: "Equipo PCHub",
      image: "https://example.com/pc-gamer-image.jpg",
    },
    {
      slug: "mejores-tarjetas-graficas-2025-colombia",
      title: "Las 5 Mejores Tarjetas Gráficas para Gaming en 2025: ¿Cuál Comprar en Colombia?",
      excerpt: "Descubre las 5 mejores tarjetas gráficas para gaming en 2025 y dónde comprarlas en Colombia.",
      date: "2025-04-02",
      author: "Equipo PCHub",
      image: "https://example.com/gpu-image.jpg",
    },
    {
      slug: "mejorar-rendimiento-pc-gamer-2025",
      title: "Cómo Mejorar el Rendimiento de tu PC Gamer sin Gastar Mucho (Consejos 2025)",
      excerpt: "Descubre 5 consejos para mejorar el rendimiento de tu PC gamer en 2025 sin gastar mucho.",
      date: "2025-04-03",
      author: "Equipo PCHub",
      image: "https://example.com/optimize-pc-image.jpg",
    },
  ];

  return (
    <div className="bg-[#0e0e0e] text-white min-h-screen">
      <Helmet>
        <title>Blog de PCHub.net - Guías y Consejos para Gamers</title>
        <meta
          name="description"
          content="Explora nuestras guías y consejos para gamers en el blog de PCHub.net. Aprende a armar tu PC, elegir componentes y optimizar tu setup."
        />
        <meta name="keywords" content="blog PCHub, guías para gamers, consejos PC gamer Colombia" />
      </Helmet>

      <div className="container mx-auto p-4">
        <h1 className="text-4xl font-bold mb-8 text-center">Blog de PCHub.net</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogs.map((post) => (
            <div key={post.slug} className="bg-[#1a1a1a] rounded-lg shadow-lg overflow-hidden">
              <img src={post.image} alt={post.title} className="w-full h-48 object-cover" />
              <div className="p-4">
                <h2 className="text-xl font-semibold mb-2">
                  <Link to={`/blog/${post.slug}`} className="hover:text-[#f90]">
                    {post.title}
                  </Link>
                </h2>
                <p className="text-gray-400 mb-4">{post.excerpt}</p>
                <p className="text-sm text-gray-500">Publicado el {post.date} por {post.author}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BlogIndex;