import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { collection, query, orderBy, startAt, endAt, limit, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { Product } from "../types";

const Header: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const { cartItems } = useCart();
  const { currentUser, signOutUser } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false); // Estado para el menú hamburguesa

  const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase().trim();
    setSearchTerm(term);

    if (term.length > 0) {
      console.log("Buscando término:", term);
      const q = query(
        collection(db, "products"),
        orderBy("nameLowercase"),
        startAt(term),
        endAt(term + "\uf8ff"),
        limit(5)
      );
      const unsubscribe = onSnapshot(q, (snapshot) => {
        console.log("Snapshot recibido:", snapshot.docs.length);
        const results = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Product));
        console.log("Resultados encontrados:", results);
        setSearchResults(results);
      }, (error) => {
        console.error("Error en la búsqueda:", error);
      });
      return () => unsubscribe();
    } else {
      setSearchResults([]);
    }
  };

  const handleSearchSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const term = searchTerm.toLowerCase().trim();
      if (term.length > 0) {
        console.log("Redirigiendo a /search con término:", term);
        navigate(`/search?q=${term}`);
        setSearchTerm("");
        setSearchResults([]);
      }
    }
  };

  const handleSignOut = async () => {
    try {
      await signOutUser();
      navigate("/");
      setIsMenuOpen(false); // Cerrar el menú al cerrar sesión
    } catch (err: any) {
      console.error("Error al cerrar sesión:", err.message);
    }
  };

  return (
    <header className="bg-menu text-white p-4 flex flex-col md:flex-row items-center justify-between shadow-lg">
      <div className="flex w-full md:w-auto justify-between items-center">
        <Link to="/" className="mb-4 md:mb-0">
          <img src="/logo.png" alt="Logo" className="h-10 md:h-12" />
        </Link>
        <button
          className="md:hidden text-white focus:outline-none"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
            />
          </svg>
        </button>
      </div>
      <div className="w-full md:w-auto md:mx-auto">
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar productos..."
            value={searchTerm}
            onChange={handleSearchChange}
            onKeyDown={handleSearchSubmit}
            className="w-full p-2 rounded-full bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#f90] md:max-w-lg"
          />
          {searchResults.length > 0 && (
            <ul className="absolute w-full bg-gray-900 border border-gray-700 mt-2 rounded-lg shadow-lg z-10">
              {searchResults.map((product) => (
                <li
                  key={product.id}
                  className="p-3 hover:bg-gray-700 cursor-pointer"
                  onClick={() => {
                    navigate(`/product/${product.id}`);
                    setSearchTerm("");
                    setSearchResults([]);
                  }}
                >
                  {product.name} - ${product.price}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <div className={`w-full md:w-auto ${isMenuOpen ? "block" : "hidden"} md:flex md:items-center md:space-x-4 mt-4 md:mt-0`}>
        <Link to="/cart" className="w-full md:w-auto mb-4 md:mb-0">
          <span className="relative flex items-center justify-center bg-[#f90] text-white px-4 py-2 rounded-full hover:bg-[#e68a00] cursor-pointer w-full">
            🛒 Carrito
            {totalItems > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </span>
        </Link>
        {currentUser ? (
          <>
            <span className="block md:inline text-center md:text-left mb-2 md:mb-0">{`Bienvenido, ${currentUser.email}`}</span>
            <button
              onClick={handleSignOut}
              className="w-full md:w-auto bg-[#f90] text-white px-4 py-2 rounded-full hover:bg-[#e68a00] mb-2 md:mb-0"
            >
              Cerrar Sesión
            </button>
            {currentUser.email === "admin@example.com" && (
              <Link to="/admin" className="w-full md:w-auto block">
                <span className="bg-[#f90] text-white px-4 py-2 rounded-full hover:bg-[#e68a00] w-full text-center">
                  Panel Admin
                </span>
              </Link>
            )}
          </>
        ) : (
          <Link to="/auth" className="w-full md:w-auto">
            <span className="bg-[#f90] text-white px-4 py-2 rounded-full hover:bg-[#e68a00] w-full text-center">
              Iniciar Sesión
            </span>
          </Link>
        )}
      </div>
    </header>
  );
};

export default Header;