import { useState, useEffect } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
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

const Categories: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const navigate = useNavigate();
  const { addToCart } = useCart();

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "products"), (snapshot) => {
      const productsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }) as Product);
      setProducts(productsData);
    });
    return () => unsubscribe();
  }, []);

  const categories = ["all", "Almacenamiento Externo", "Chasís", "Coolers", "Diadema", "Fuente de poder", "Memoria Ram", "Mouse", "Mouse Pads", "Motherboards", "Procesadores",  "SSD",  "Tarjeta Gráfica"  ];

  const handleProductClick = (id: string) => {
    navigate(`/product/${id}`);
  };

  return (
    <div className="p-6">
      <div className="container mx-auto">
        <h1 className="text-3xl font-semibold mb-4" style={{ color: 'var(--text-color)' }}>Categorías</h1>
        <div className="mb-6 flex items-center">
          <label className="mr-3 text-lg" style={{ color: 'var(--text-color)' }}>Filtrar por categoría:</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-button"
            style={{ color: 'var(--text-color)' }}
          >
            {categories.map((cat) => (
              <option key={cat} value={cat} className="text-black">
                {cat}
              </option>
            ))}
          </select>
        </div>
        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {products
              .filter((product) => selectedCategory === "all" || product.category === selectedCategory)
              .map((product) => (
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
                    <p className="text-2xl text-button text-black mb-2">${formatPrice(product.price)}</p>
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
          <p style={{ color: 'var(--text-color)' }}>No hay productos disponibles.</p>
        )}
      </div>
    </div>
  );
};

export default Categories;