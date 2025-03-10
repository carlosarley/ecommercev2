import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { collection, query, orderBy, startAt, endAt, limit, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { Product } from "../types";
import { useTheme } from "../context/ThemeContext";

const Header: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const { cartItems } = useCart();
  const { currentUser, signOutUser } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

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
      setIsMenuOpen(false);
    } catch (err: any) {
      console.error("Error al cerrar sesión:", err.message);
    }
  };

  return (
    <header className="bg-menu p-4 flex flex-col md:flex-row items-center justify-between shadow-lg" style={{ position: 'sticky', top: 0, zIndex: 1000, width: '100%' }}>
      <div className="flex w-full md:w-auto justify-between items-center mb-4 md:mb-0">
        <Link to="/" className="mr-4">
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
      <div className="flex-1 mx-4 md:mx-0">
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar productos..."
            value={searchTerm}
            onChange={handleSearchChange}
            onKeyDown={handleSearchSubmit}
            className="w-full p-2 rounded-full bg-gray-800 dark:bg-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#f90] md:max-w-none"
            style={{ color: 'white' }} // Texto blanco fijo
          />
          {searchResults.length > 0 && (
            <ul className="absolute w-full bg-gray-900 dark:bg-gray-100 border border-gray-700 dark:border-gray-300 mt-2 rounded-lg shadow-lg z-10" style={{ color: 'white' }}>
              {searchResults.map((product) => (
                <li
                  key={product.id}
                  className="p-3 hover:bg-gray-700 dark:hover:bg-gray-200 cursor-pointer"
                  style={{ color: 'white' }} // Texto blanco fijo
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
          <span className="relative flex items-center justify-center bg-[--button-bg] text-[--button-text] px-4 py-2 rounded-full hover:bg-[--button-bg-hover] cursor-pointer w-full text-white">
            🛒 Carrito
            {totalItems > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </span>
        </Link>
        <button
          onClick={toggleTheme}
          className="w-full md:w-auto mb-4 md:mb-0 bg-[--button-bg] text-[--button-text] px-4 py-2 rounded-full hover:bg-[--button-bg-hover] flex items-center justify-center"
        >
          {theme === 'light' ? '🌙 Modo Oscuro' : '☀️ Modo Claro'}
        </button>
        {currentUser ? (
          <>
            <span className="block md:inline text-center md:text-left mb-2 md:mb-0" style={{ color: 'white' }}>{`Bienvenido, ${currentUser.email}`}</span>
            <button
              onClick={handleSignOut}
              className="w-full md:w-auto bg-[--button-bg] text-[--button-text] px-4 py-2 rounded-full hover:bg-[--button-bg-hover] mb-2 md:mb-0"
            >
              Cerrar Sesión
            </button>
            {currentUser.email === "admin@example.com" && (
              <Link to="/admin" className="w-full md:w-auto block">
                <span className="bg-[--button-bg] text-[--button-text] px-4 py-2 rounded-full hover:bg-[--button-bg-hover] w-full text-center">
                  Panel Admin
                </span>
              </Link>
            )}
          </>
        ) : (
          <Link to="/auth" className="w-full md:w-auto">
            <span className="bg-[--button-bg] text-[--button-text] px-4 py-2 rounded-full hover:bg-[--button-bg-hover] w-full text-center text-white">
              Iniciar Sesión
            </span>
          </Link>
        )}
      </div>
    </header>
  );
};

export default Header;