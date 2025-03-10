import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, collection, addDoc, onSnapshot, Timestamp } from "firebase/firestore";
import { db } from "../firebase";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { Product } from "../types";

interface Review {
  id: string;
  userId: string;
  userEmail: string;
  comment: string;
  createdAt: Timestamp;
}

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      try {
        const productDoc = await getDoc(doc(db, "products", id));
        if (productDoc.exists()) {
          setProduct({ id: productDoc.id, ...productDoc.data() } as Product);
        } else {
          console.log("Producto no encontrado:", id);
        }
      } catch (error) {
        console.error("Error al obtener el producto:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchReviews = () => {
      if (!id) return;
      const reviewsRef = collection(db, "products", id, "reviews");
      const unsubscribe = onSnapshot(reviewsRef, (snapshot) => {
        const reviewsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Review[];
        setReviews(reviewsData);
      }, (error) => {
        console.error("Error al obtener reviews:", error);
      });
      return unsubscribe;
    };

    fetchProduct();
    return fetchReviews();
  }, [id]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      navigate("/auth");
      return;
    }
    if (!id || !comment.trim()) return;

    try {
      await addDoc(collection(db, "products", id, "reviews"), {
        userId: currentUser.uid,
        userEmail: currentUser.email,
        comment: comment.trim(),
        createdAt: Timestamp.fromDate(new Date()),
      });
      setComment("");
    } catch (error) {
      console.error("Error al enviar la reseña:", error);
    }
  };

  if (loading) return <div className="container mx-auto p-6 text-white">Cargando...</div>;
  if (!product) return <div className="container mx-auto p-6 text-white">Producto no encontrado</div>;

  return (
    <div className="container mx-auto p-6 bg-body text-white">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 text-[#f90] hover:underline"
      >
        ← Volver
      </button>
      <h1 className="text-3xl font-semibold mb-4">{product.name}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <img src={product.image || "/placeholder.jpg"} alt={product.name} className="w-full h-96 object-cover rounded-lg" />
        </div>
        <div className="flex flex-col justify-between">
          <div>
            <p className="text-2xl text-[#f90] mb-4">${product.price}</p>
            {product.discount && product.discount > 0 && (
              <p className="text-md text-red-500 mb-4">Descuento: {product.discount}%</p>
            )}
            <p className="mb-4">{product.description}</p>
            <p className="mb-4"><strong>Categoría:</strong> {product.category}</p>
            <p className="mb-4"><strong>Stock:</strong> {product.stock}</p>
            {product.coupon && (
              <p className="mb-4"><strong>Cupón:</strong> {product.coupon}</p>
            )}
          </div>
          <button
            onClick={() => addToCart(product)}
            className="bg-[#f90] text-white px-6 py-3 rounded-md hover:bg-[#e68a00]"
          >
            Añadir al carrito
          </button>
        </div>
      </div>
      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">Reseñas</h2>
        {reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="bg-menu p-4 rounded-lg border border-gray-700">
                <p><strong>{review.userEmail}</strong></p>
                <p>{review.comment}</p>
                <p className="text-gray-400 text-sm">
                  {review.createdAt.toDate().toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p>No hay reseñas todavía.</p>
        )}
        {currentUser && (
          <form onSubmit={handleSubmitReview} className="mt-6 space-y-4">
            <h3 className="text-xl font-semibold">Deja tu reseña</h3>
            <div>
              <label className="block mb-1">Comentario</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full p-2 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-[#f90]"
                rows={4}
                required
              />
            </div>
            <button
              type="submit"
              className="bg-[#f90] text-white px-4 py-2 rounded-md hover:bg-[#e68a00]"
            >
              Enviar Reseña
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;