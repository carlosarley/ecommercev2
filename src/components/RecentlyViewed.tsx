import Slider from "react-slick";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../utils/formatPrice"; // Ajusta la ruta
import { Product } from "../types";

const RecentlyViewed: React.FC = () => {
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);
  const navigate = useNavigate();
  const { addToCart } = useCart();

  useEffect(() => {
    const q = query(
      collection(db, "products"),
      orderBy("sales", "desc"),
      limit(4)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const productsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }) as Product);
        setRecentlyViewed(productsData);
      },
      (error) => {
        console.error("Error fetching recently viewed products:", error);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleProductClick = (id: string) => {
    navigate(`/product/${id}`);
  };

  const handleAddToCart = (product: Product) => {
    addToCart(product);
  };

  return (
    <div className="p-6">
      <div className="container mx-auto">
        <h2 className="text-3xl font-semibold mb-4" style={{ color: 'var(--text-color)' }}>Recientemente visto</h2>
        {recentlyViewed.length > 0 ? (
          <Slider
            dots={true}
            infinite={true}
            speed={500}
            slidesToShow={Math.min(4, recentlyViewed.length)}
            slidesToScroll={1}
            responsive={[
              { breakpoint: 1024, settings: { slidesToShow: 3 } },
              { breakpoint: 768, settings: { slidesToShow: 2 } },
              { breakpoint: 640, settings: { slidesToShow: 1 } },
            ]}
          >
            {recentlyViewed.map((product) => (
              <div key={product.id} className="p-4">
                <div className="flex flex-col min-h-[400px] p-8 rounded-lg text-center border border-gray-700 hover:shadow-xl transition-shadow bg-white justify-between">
                  <div className="flex-1">
                    <img
                      src={product.image || "/placeholder.jpg"}
                      alt={product.name}
                      className="w-full h-40 object-cover rounded-md mb-4 cursor-pointer"
                      onClick={() => handleProductClick(product.id)}
                    />
                    <p className="text-lg font-medium text-black truncate">{product.name}</p>
                  </div>
                  <div className="mt-auto">
                    <p className="text-2xl text-button text-black mb-2">${formatPrice(product.price)}</p>
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="w-full bg-[#f90] text-white px-4 py-2 rounded-md hover:bg-[#e68a00]"
                    >
                      Añadir al carrito
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </Slider>
        ) : (
          <p className="text-center" style={{ color: 'var(--text-color)' }}>No hay productos recientes.</p>
        )}
      </div>
    </div>
  );
};

export default RecentlyViewed;