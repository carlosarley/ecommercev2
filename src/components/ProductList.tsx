import { useState, useEffect } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../utils/formatPrice";

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

const ProductList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState("all");
  const navigate = useNavigate();
  const { addToCart } = useCart();

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "products"), (snapshot) => {
      const productsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }) as Product);
      productsData.forEach((product) => {
        console.log(`Producto: ${product.name}, Categoría: ${product.category}`);
      });
      setProducts(productsData);
    });
    return () => unsubscribe();
  }, []);

  const categories = ["all", "Almacenamiento Externo", "Chasís", "Coolers", "Diadema", "Fuente de poder", "Memoria Ram", "Mouse", "Mouse Pads", "Motherboards", "Procesadores",  "SSD",  "Tarjeta Gráfica" ];

  const handleProductClick = (id: string) => {
    navigate(`/product/${id}`);
  };

  const calculateDiscountedPrice = (price: number, discount: number): number => {
    return price - (price * discount) / 100;
  };

  return (
    <div className="p-6">
      <div className="container mx-auto">
        <h2 className="text-3xl font-semibold mb-4" style={{ color: 'var(--text-color)' }}>Productos</h2>
        <div className="mb-6 flex items-center">
          <label className="mr-3 text-lg" style={{ color: 'var(--text-color)' }}>Filtrar por categoría:</label>
          <select
            value={category}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCategory(e.target.value)}
            className="p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-button text-black bg-white">
            {categories.map((cat) => (
              <option key={cat} value={cat} className="">
                {cat}
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {products
            .filter((product) => {
              if (category === "all") return true;
              const productCategory = product.category ? product.category.toLowerCase() : "";
              const selectedCategory = category.toLowerCase();
              return productCategory === selectedCategory;
            })
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
                  {product.discount && product.discount > 0 ? (
                    <div>
                      <p className="text-xl text-gray-500 line-through text-black mb-1">${formatPrice(product.price)}</p>
                      <p className="text-2xl text-button text-black mb-2">
                        ${formatPrice(calculateDiscountedPrice(product.price, product.discount))} {" "}
                        <span className="text-red-500">(-{product.discount}%)</span>
                      </p>
                    </div>
                  ) : (
                    <p className="text-2xl text-button text-black mb-2">${formatPrice(product.price)} </p>
                  )}
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
      </div>
    </div>
  );
};

export default ProductList;