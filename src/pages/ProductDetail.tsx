import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, collection, onSnapshot, Timestamp, addDoc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { formatPrice } from "../utils/formatPrice";
import { Product } from "../types";
import { toast } from "react-toastify";

interface Review {
  id: string;
  userId: string;
  userEmail: string;
  comment: string;
  createdAt: Timestamp;
}

interface WishlistItem {
  id: string;
  productId: string;
  addedAt: Timestamp;
}

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [isInWishlist, setIsInWishlist] = useState(false);
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
      const unsubscribe = onSnapshot(
        reviewsRef,
        (snapshot) => {
          const reviewsData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Review[];
          setReviews(reviewsData);
        },
        (error) => {
          console.error("Error al obtener reviews:", error);
        }
      );
      return unsubscribe;
    };

    const fetchWishlist = () => {
      if (!id || !currentUser) return;
      const wishlistRef = collection(db, "wishlists", currentUser.uid, "products");
      const unsubscribe = onSnapshot(
        wishlistRef,
        (snapshot) => {
          const wishlistItems = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as WishlistItem[];
          const isProductInWishlist = wishlistItems.some((item) => item.productId === id);
          setIsInWishlist(isProductInWishlist);
        },
        (error) => {
          console.error("Error al obtener la lista de deseados:", error);
        }
      );
      return unsubscribe;
    };

    fetchProduct();
    const unsubscribeReviews = fetchReviews();
    const unsubscribeWishlist = fetchWishlist();

    return () => {
      if (unsubscribeReviews) unsubscribeReviews();
      if (unsubscribeWishlist) unsubscribeWishlist();
    };
  }, [id, currentUser]);

  const handleToggleWishlist = async () => {
    if (!currentUser) {
      navigate("/auth");
      return;
    }
    if (!id) return;

    const wishlistRef = collection(db, "wishlists", currentUser.uid, "products");
    const productDoc = doc(wishlistRef, id);

    try {
      if (isInWishlist) {
        // Eliminar de la lista de deseados
        await deleteDoc(productDoc);
        toast.success("Producto eliminado de la lista de deseados");
      } else {
        // Agregar a la lista de deseados
        await addDoc(wishlistRef, {
          productId: id,
          addedAt: Timestamp.fromDate(new Date()),
        });
        toast.success("Producto añadido a la lista de deseados");
      }
    } catch (error) {
      console.error("Error al actualizar la lista de deseados:", error);
      toast.error("Error al actualizar la lista de deseados");
    }
  };

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

  if (loading)
    return (
      <div className="container mx-auto p-6" style={{ color: "var(--text-color)" }}>
        Cargando...
      </div>
    );
  if (!product)
    return (
      <div className="container mx-auto p-6" style={{ color: "var(--text-color)" }}>
        Producto no encontrado
      </div>
    );

  return (
    <div className="container mx-auto p-6">
      <button
        onClick={() => navigate(-1)}
        className="bg-[#f90] text-white px-6 py-3 rounded-md hover:bg-[#e68a00] mb-4"
      >
        ← Volver
      </button>
      <h1 className="text-3xl font-semibold mb-4" style={{ color: "var(--text-color)" }}>
        {product.name}
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <img
            src={product.image || "/placeholder.jpg"}
            alt={product.name}
            className="w-full h-96 object-cover rounded-lg"
          />
        </div>
        <div className="flex flex-col justify-between">
          <div>
            <p className="text-2xl text-[#f90] mb-4">{formatPrice(product.price)} COP</p>
            {product.discount && product.discount > 0 && (
              <p className="text-md text-red-500 mb-4">Descuento: {product.discount}%</p>
            )}
            <p className="mb-4" style={{ color: "var(--text-color)" }}>
              {product.description}
            </p>
            <p className="mb-4" style={{ color: "var(--text-color)" }}>
              <strong>Categoría:</strong> {product.category}
            </p>
            <p className="mb-4" style={{ color: "var(--text-color)" }}>
              <strong>Stock:</strong> {product.stock}
            </p>
            {product.coupon && (
              <p className="mb-4" style={{ color: "var(--text-color)" }}>
                <strong>Cupón:</strong> {product.coupon}
              </p>
            )}
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => addToCart(product)}
              className="bg-[#f90] text-white px-6 py-3 rounded-md hover:bg-[#e68a00] flex-1"
            >
              Añadir al carrito
            </button>
            <button
              onClick={handleToggleWishlist}
              className={`p-3 rounded-md ${
                isInWishlist ? "bg-red-500 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-500"
              } hover:bg-red-600 hover:text-white`}
              aria-label={
                isInWishlist ? "Eliminar de la lista de deseados" : "Añadir a la lista de deseados"
              }
            >
              {isInWishlist ? "❤️" : "♡"}
            </button>
          </div>
        </div>
      </div>
      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4" style={{ color: "var(--text-color)" }}>
          Reseñas
        </h2>
        {reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="bg-menu p-4 rounded-lg border border-gray-700">
                <p style={{ color: "var(--text-color)" }}>
                  <strong>{review.userEmail}</strong>
                </p>
                <p style={{ color: "var(--text-color)" }}>{review.comment}</p>
                <p className="text-gray-400 text-sm">
                  {review.createdAt.toDate().toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: "var(--text-color)" }}>No hay reseñas todavía.</p>
        )}
        {currentUser && (
          <form onSubmit={handleSubmitReview} className="mt-6 space-y-4">
            <h3 className="text-xl font-semibold" style={{ color: "var(--text-color)" }}>
              Deja tu reseña
            </h3>
            <div>
              <label className="block mb-1" style={{ color: "var(--text-color)" }}>
                Comentario
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full p-2 rounded-md bg-gray-800 focus:outline-none focus:ring-2 focus:ring-[#f90]"
                style={{ color: "var(--text-color)" }}
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