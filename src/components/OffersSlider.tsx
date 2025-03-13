import Slider from "react-slick";
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

const OffersSlider: React.FC = () => {
  const [offers, setOffers] = useState<Product[]>([]);
  const navigate = useNavigate();
  const { addToCart } = useCart();

  useEffect(() => {
    const q = query(collection(db, "products"), where("discount", ">", 0));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const offersData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }) as Product);
        setOffers(offersData);
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

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: Math.min(4, offers.length),
    slidesToScroll: 1,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 3 } },
      { breakpoint: 768, settings: { slidesToShow: 2 } },
      { breakpoint: 640, settings: { slidesToShow: 1 } },
    ],
  };

  return (
    <div className="p-6">
      <div className="container mx-auto">
        <h2 className="text-3xl font-semibold mb-4" style={{ color: 'var(--text-color)' }}>Ofertas Especiales</h2>
        {offers.length > 0 ? (
          <Slider {...settings}>
            {offers.map((product) => (
              <div key={product.id} className="p-4">
                <div className=" p-4 rounded-lg text-center border border-gray-700 hover:shadow-lg transition-shadow">
                  <img
                    src={product.image || "/placeholder.jpg"}
                    alt={product.name}
                    className="w-full h-40 object-cover rounded-md mb-2 cursor-pointer"
                    onClick={() => handleProductClick(product.id)}
                  />
                  <p className="text-lg font-medium" style={{ color: 'var(--text-color)' }}>{product.name}</p>
                  <p className="text-md text-button">
                    {formatPrice(product.price)} COP <span className="text-red-500">(-{product.discount}%)</span>
                  </p>
                  <button
                    onClick={() => addToCart(product)}
                    className="mt-2 bg-[#f90] text-white px-4 py-2 rounded-md hover:bg-[#e68a00]"
                  >
                    Añadir al carrito
                  </button>
                </div>
              </div>
            ))}
          </Slider>
        ) : (
          <p className="text-center" style={{ color: 'var(--text-color)' }}>No hay ofertas disponibles.</p>
        )}
      </div>
    </div>
  );
};

export default OffersSlider;