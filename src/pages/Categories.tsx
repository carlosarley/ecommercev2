import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { useCart } from "../context/CartContext";

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

  const categories = ["all", "Placas Base", "tarjetas gráficas", "procesadores", "memoria ram"];

  const handleProductClick = (id: string) => {
    navigate(`/product/${id}`);
  };

  return (
    <div className="bg-body text-white p-6">
      <div className="container mx-auto">
        <h1 className="text-3xl font-semibold mb-4">Categorías</h1>
        <div className="mb-6 flex items-center">
          <label className="mr-3 text-lg">Filtrar por categoría:</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="p-2 rounded-md bg-menu text-white focus:outline-none focus:ring-2 focus:ring-button"
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
                  className="bg-menu p-4 rounded-lg text-center border border-gray-700 hover:shadow-xl transition-shadow"
                >
                  <img
                    src={product.image || "/placeholder.jpg"}
                    alt={product.name}
                    className="w-full h-48 object-cover rounded-md mb-3 cursor-pointer"
                    onClick={() => handleProductClick(product.id)}
                  />
                  <h3 className="text-lg font-medium">{product.name}</h3>
                  <p className="text-md text-button">${product.price}</p>
                  <button
                    onClick={() => addToCart(product)}
                    className="mt-2 bg-[#f90] text-white px-4 py-2 rounded-md hover:bg-[#e68a00]"
                  >
                    Añadir al carrito
                  </button>
                </div>
              ))}
          </div>
        ) : (
          <p>No hay productos disponibles.</p>
        )}
      </div>
    </div>
  );
};

export default Categories;