import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { collection, onSnapshot, addDoc, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { Product } from "../types";

const AdminPanel: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: 0,
    image: "",
    category: "",
    description: "",
    discount: 0,
    sales: 0,
    stock: 0,
    coupon: "",
  });

  useEffect(() => {
    if (!currentUser || currentUser.email !== "admin@example.com") {
      navigate("/");
      return;
    }

    const unsubscribe = onSnapshot(collection(db, "products"), (snapshot) => {
      const productsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Product[];
      setProducts(productsData);
    });

    return () => unsubscribe();
  }, [currentUser, navigate]);

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "products"), {
        ...newProduct,
        nameLowercase: newProduct.name.toLowerCase(),
      });
      setNewProduct({
        name: "",
        price: 0,
        image: "",
        category: "",
        description: "",
        discount: 0,
        sales: 0,
        stock: 0,
        coupon: "",
      });
    } catch (error) {
      console.error("Error al añadir producto:", error);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      await deleteDoc(doc(db, "products", productId));
    } catch (error) {
      console.error("Error al eliminar producto:", error);
    }
  };

  const handleUpdateStock = async (productId: string, newStock: number) => {
    try {
      await updateDoc(doc(db, "products", productId), { stock: newStock });
    } catch (error) {
      console.error("Error al actualizar stock:", error);
    }
  };

  if (!currentUser || currentUser.email !== "admin@example.com") {
    return null;
  }

  return (
    <div className="p-6  min-h-screen">
      <div className="container mx-auto">
        <h1 className="text-3xl font-semibold mb-6" style={{ color: "var(--text-color)" }}>
          Panel Administrativo
        </h1>

        {/* Sección: Añadir Producto */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-2xl font-semibold mb-4" style={{ color: "var(--text-color)" }}>
            Añadir Nuevo Producto
          </h2>
          <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1" style={{ color: "var(--text-color)" }}>
                Nombre
              </label>
              <input
                type="text"
                value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                className="w-full p-2 rounded-md bg-gray-200 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-[#f90]"
                style={{ color: "var(--text-color)" }}
                required
              />
            </div>
            <div>
              <label className="block mb-1" style={{ color: "var(--text-color)" }}>
                Precio
              </label>
              <input
                type="number"
                value={newProduct.price}
                onChange={(e) => setNewProduct({ ...newProduct, price: Number(e.target.value) })}
                className="w-full p-2 rounded-md bg-gray-200 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-[#f90]"
                style={{ color: "var(--text-color)" }}
                required
              />
            </div>
            <div>
              <label className="block mb-1" style={{ color: "var(--text-color)" }}>
                Imagen (URL)
              </label>
              <input
                type="text"
                value={newProduct.image}
                onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
                className="w-full p-2 rounded-md bg-gray-200 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-[#f90]"
                style={{ color: "var(--text-color)" }}
              />
            </div>
            <div>
              <label className="block mb-1" style={{ color: "var(--text-color)" }}>
                Categoría
              </label>
              <input
                type="text"
                value={newProduct.category}
                onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                className="w-full p-2 rounded-md bg-gray-200 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-[#f90]"
                style={{ color: "var(--text-color)" }}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block mb-1" style={{ color: "var(--text-color)" }}>
                Descripción
              </label>
              <textarea
                value={newProduct.description}
                onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                className="w-full p-2 rounded-md bg-gray-200 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-[#f90]"
                style={{ color: "var(--text-color)" }}
                rows={4}
              />
            </div>
            <div>
              <label className="block mb-1" style={{ color: "var(--text-color)" }}>
                Descuento (%)
              </label>
              <input
                type="number"
                value={newProduct.discount}
                onChange={(e) => setNewProduct({ ...newProduct, discount: Number(e.target.value) })}
                className="w-full p-2 rounded-md bg-gray-200 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-[#f90]"
                style={{ color: "var(--text-color)" }}
              />
            </div>
            <div>
              <label className="block mb-1" style={{ color: "var(--text-color)" }}>
                Ventas
              </label>
              <input
                type="number"
                value={newProduct.sales}
                onChange={(e) => setNewProduct({ ...newProduct, sales: Number(e.target.value) })}
                className="w-full p-2 rounded-md bg-gray-200 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-[#f90]"
                style={{ color: "var(--text-color)" }}
              />
            </div>
            <div>
              <label className="block mb-1" style={{ color: "var(--text-color)" }}>
                Stock
              </label>
              <input
                type="number"
                value={newProduct.stock}
                onChange={(e) => setNewProduct({ ...newProduct, stock: Number(e.target.value) })}
                className="w-full p-2 rounded-md bg-gray-200 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-[#f90]"
                style={{ color: "var(--text-color)" }}
              />
            </div>
            <div>
              <label className="block mb-1" style={{ color: "var(--text-color)" }}>
                Cupón
              </label>
              <input
                type="text"
                value={newProduct.coupon}
                onChange={(e) => setNewProduct({ ...newProduct, coupon: e.target.value })}
                className="w-full p-2 rounded-md bg-gray-200 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-[#f90]"
                style={{ color: "var(--text-color)" }}
              />
            </div>
            <div className="md:col-span-2">
              <button
                type="submit"
                className="bg-[#f90] text-white px-4 py-2 rounded-md hover:bg-[#e68a00] w-full"
              >
                Añadir Producto
              </button>
            </div>
          </form>
        </div>

        {/* Sección: Gestionar Productos */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4" style={{ color: "var(--text-color)" }}>
            Gestionar Productos
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600"
              >
                <img
                  src={product.image || "/placeholder.jpg"}
                  alt={product.name}
                  className="w-full h-40 object-cover rounded-md mb-4"
                />
                <h3 className="text-lg font-medium" style={{ color: "var(--text-color)" }}>
                  {product.name}
                </h3>
                <p className="text-md text-[#f90] mb-2">${product.price}</p>
                <p style={{ color: "var(--text-color)" }}>Stock: {product.stock}</p>
                <div className="flex items-center mt-2 gap-2">
                  <input
                    type="number"
                    defaultValue={product.stock}
                    onBlur={(e) => handleUpdateStock(product.id, Number(e.target.value))}
                    className="w-20 p-2 rounded-md bg-gray-200 dark:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-[#f90]"
                    style={{ color: "var(--text-color)" }}
                  />
                  <button
                    onClick={() => handleDeleteProduct(product.id)}
                    className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;