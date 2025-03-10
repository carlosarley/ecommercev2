import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { Product } from "../types";

const SearchPage: React.FC = () => {
  const { search } = useLocation();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const queryParams = new URLSearchParams(search);
  const q = queryParams.get("q");

  useEffect(() => {
    if (!q) {
      navigate("/");
      return;
    }

    setLoading(true);
    const qLower = q.toLowerCase().trim();
    const searchQuery = query(
      collection(db, "products"),
      where("searchKeywords", "array-contains", qLower)
    );
    const unsubscribe = onSnapshot(searchQuery, (snapshot) => {
      const results = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Product));
      setProducts(results);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching search results:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [q, navigate]);

  if (loading) return <div className="container mx-auto p-6" style={{ color: 'var(--text-color)' }}>Cargando...</div>;
  if (!q) return <div className="container mx-auto p-6" style={{ color: 'var(--text-color)' }}>No se proporcionó término de búsqueda</div>;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-semibold mb-4" style={{ color: 'var(--text-color)' }}>Resultados de búsqueda para: {q}</h1>
      {products.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {products.map((product) => (
            <div key={product.id} className="bg-menu p-4 rounded-lg border border-gray-700">
              <img src={product.image || "/placeholder.jpg"} alt={product.name} className="w-full h-40 object-cover rounded-md mb-2" />
              <h3 className="text-lg font-medium" style={{ color: 'var(--text-color)' }}>{product.name}</h3>
              <p className="text-md text-button">${product.price}</p>
              <button
                onClick={() => navigate(`/product/${product.id}`)}
                className="mt-2 bg-[#f90] text-white px-4 py-2 rounded-md hover:bg-[#e68a00]"
              >
                Ver detalles
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p style={{ color: 'var(--text-color)' }}>No se encontraron productos para "{q}".</p>
      )}
    </div>
  );
};

export default SearchPage;