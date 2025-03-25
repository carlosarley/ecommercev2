import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { collection, onSnapshot, deleteDoc, doc, getDoc, Timestamp } from "firebase/firestore";
import { db } from "../firebase";
import { Product } from "../types";
import { toast } from "react-toastify";

interface WishlistItem {
  id: string;
  productId: string;
  addedAt: Timestamp;
}

const Wishlist: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [wishlistItems, setWishlistItems] = useState<(WishlistItem & { product?: Product })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      navigate("/auth");
      return;
    }

    const wishlistRef = collection(db, "wishlists", currentUser.uid, "products");
    const unsubscribe = onSnapshot(
      wishlistRef,
      async (snapshot) => {
        const items = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as WishlistItem[];

        // Obtener los detalles de los productos
        const itemsWithProducts = await Promise.all(
          items.map(async (item) => {
            const productDoc = await getDoc(doc(db, "products", item.productId));
            const product = productDoc.exists()
              ? ({ id: productDoc.id, ...productDoc.data() } as Product)
              : undefined;
            return { ...item, product };
          })
        );

        setWishlistItems(itemsWithProducts);
        setLoading(false);
      },
      (error) => {
        console.error("Error al obtener la lista de deseados:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser, navigate]);

  const handleRemoveFromWishlist = async (wishlistItemId: string) => {
    try {
      await deleteDoc(doc(db, "wishlists", currentUser!.uid, "products", wishlistItemId));
      toast.success("Producto eliminado de la lista de deseados");
    } catch (error) {
      console.error("Error al eliminar de la lista de deseados:", error);
      toast.error("Error al eliminar de la lista de deseados");
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6" style={{ color: "var(--text-color)" }}>
        Cargando...
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-semibold mb-6" style={{ color: "var(--text-color)" }}>
        Mi Lista de Deseados
      </h1>
      {wishlistItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlistItems.map((item) => (
            <div
              key={item.id}
              className="bg-white  p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-600"
            >
              {item.product ? (
                <>
                  <img
                    src={item.product.image || "/placeholder.jpg"}
                    alt={item.product.name}
                    className="w-full h-40 object-cover rounded-md mb-4"
                  />
                  <h3 className="text-lg font-medium text-black" >
                    {item.product.name}
                  </h3>
                  <p className="text-md text-[#f90] mb-2">${item.product.price}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/product/${item.productId}`)}
                      className="bg-[#f90] text-white px-4 py-2 rounded-md hover:bg-[#e68a00] flex-1"
                    >
                      Ver Producto
                    </button>
                    <button
                      onClick={() => handleRemoveFromWishlist(item.id)}
                      className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
                    >
                      Eliminar
                    </button>
                  </div>
                </>
              ) : (
                <p style={{ color: "var(--text-color)" }}>Producto no disponible</p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p style={{ color: "var(--text-color)" }}>Tu lista de deseados está vacía.</p>
      )}
    </div>
  );
};

export default Wishlist;