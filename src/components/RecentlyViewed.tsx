import Slider from "react-slick";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../utils/formatPrice";
import { Product } from "../types";

const RecentlyViewed: React.FC = () => {
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);
  const navigate = useNavigate();
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchRecentlyViewed = async () => {
      const viewedIds = JSON.parse(localStorage.getItem("recentlyViewed") || "[]") as string[];
      console.log("IDs recientemente vistos desde localStorage:", viewedIds);

      if (viewedIds.length === 0) {
        setRecentlyViewed([]);
        return;
      }

      try {
        const productsPromises = viewedIds.map(async (id) => {
          const productDoc = await getDoc(doc(db, "products", id));
          if (productDoc.exists()) {
            return { id: productDoc.id, ...productDoc.data() } as Product;
          } else {
            console.warn(`Producto con ID ${id} no encontrado en Firestore`);
            return null;
          }
        });
        const productsData = (await Promise.all(productsPromises)).filter(
          (product) => product !== null
        ) as Product[];
        console.log("Productos obtenidos desde Firebase:", productsData);
        setRecentlyViewed(productsData);
      } catch (error) {
        console.error("Error fetching recently viewed products:", error);
      }
    };

    fetchRecentlyViewed();

    const handleStorageChange = () => {
      fetchRecentlyViewed();
    };
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const handleProductClick = (id: string) => {
    navigate(`/product/${id}`);
  };

  const handleAddToCart = (product: Product) => {
    addToCart(product);
  };

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: Math.min(4, recentlyViewed.length),
    slidesToScroll: 1,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 3 } },
      { breakpoint: 768, settings: { slidesToShow: 2 } },
      { breakpoint: 640, settings: { slidesToShow: 1 } },
    ],
  };

  return (
    <div className="p-6 ">
      <div className="container mx-auto">
        <h2 className="text-3xl font-semibold mb-4">Recientemente visto</h2>
        {recentlyViewed.length > 0 ? (
          <Slider {...settings}>
            {recentlyViewed.map((product) => (
              <div key={product.id} className="p-4">
                <div className="flex flex-col h-[400px] p-8 rounded-lg text-center border border-gray-700 hover:shadow-xl transition-shadow bg-white justify-between">
                  <div className="flex-1">
                    <img
                      src={product.image || "/placeholder.jpg"}
                      alt={product.name}
                      className="w-full h-40 object-cover rounded-md mb-4 cursor-pointer"
                      onClick={() => handleProductClick(product.id)}
                    />
                    <p className="text-lg text-black font-medium mb-2 line-clamp-2">{product.name}</p>
                  </div>
                  <div className="mt-auto">
                    <p className="text-xl text-[#f90] mb-2">{formatPrice(product.price)} COP</p>
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
          <p className="text-center">No hay productos recientes.</p>
        )}
      </div>
    </div>
  );
};

export default RecentlyViewed;