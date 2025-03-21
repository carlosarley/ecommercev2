import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../utils/formatPrice"; // Ajusta la ruta

interface Product {
  id: string;
  name: string;
  price: number;
  image?: string;
  category?: string;
  description?: string;
  discount?: number;
  sales?: number;
  stock?: number;
  coupon?: string;
}

const Offers: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const navigate = useNavigate();
  const { addToCart } = useCart();

  useEffect(() => {
    const q = query(collection(db, "products"), where("discount", ">", 0));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const productsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }) as Product);
        setProducts(productsData);
      },
      (error) => {
        console.error("Error fetching offers:", error);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleProductClick = (id: string) => {
    navigate(`/product/${id}`);
  };

  return (
    <div className="p-6">
      <div className="container mx-auto">
        <h1 className="text-3xl font-semibold mb-4" style={{ color: 'var(--text-color)' }}>Ofertas</h1>
        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="flex flex-col min-h-[400px] p-8 rounded-lg text-center border border-gray-700 hover:shadow-xl transition-shadow bg-white justify-between"
              >
                <div className="flex-1">
                  <img
                    src={product.image || "/placeholder.jpg"}
                    alt={product.name}
                    className="w-full h-48 object-cover rounded-md mb-4 cursor-pointer"
                    onClick={() => handleProductClick(product.id)}
                  />
                  <h3 className="text-lg font-medium text-black truncate">{product.name}</h3>
                </div>
                <div className="mt-auto">
                  <p className="text-2xl text-button text-black mb-2">
                  <span className="text-red-500">(-{product.discount}%)</span><br />
                    ${formatPrice(product.price)} 
                  </p>
                  <button
                    onClick={() => addToCart(product)}
                    className="w-full bg-[#f90] text-white px-4 py-2 rounded-md hover:bg-[#e68a00]"
                  >
                    Añadir al carrito
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: 'var(--text-color)' }}>No hay ofertas disponibles.</p>
        )}
      </div>
    </div>
  );
};

export default Offers;