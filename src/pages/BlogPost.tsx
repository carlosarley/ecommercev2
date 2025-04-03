import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import type { BlogPost } from "../types"; // Importación de tipo explícita

const BlogPost: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      if (!slug) {
        setError("Artículo no encontrado");
        return;
      }

      try {
        const postRef = doc(db, "blogPosts", slug);
        const postSnap = await getDoc(postRef);
        if (postSnap.exists()) {
          setPost({ id: postSnap.id, ...postSnap.data() } as BlogPost);
        } else {
          setError("Artículo no encontrado");
        }
      } catch (err) {
        console.error("Error al cargar el artículo:", err);
        setError("Error al cargar el artículo. Intenta de nuevo más tarde.");
      }
    };

    fetchPost();
  }, [slug]);

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-4">Error</h1>
        <p className="text-red-500">{error}</p>
        <Link to="/blog" className="text-blue-500 hover:underline">
          Volver al Blog
        </Link>
      </div>
    );
  }

  if (!post) {
    return <div className="container mx-auto p-4">Cargando...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
      <img src={post.image} alt={post.title} className="w-full h-64 object-cover rounded-lg mb-6" />
      <p className="text-gray-500 mb-4">
        Publicado el {post.date} por {post.author}
      </p>
      <div
        className="prose max-w-none"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />
      <div className="mt-6">
        <Link to="/categories" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          Ver Componentes en PCHub.net
        </Link>
      </div>
    </div>
  );
};

export default BlogPost;