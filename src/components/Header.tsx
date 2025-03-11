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
    <header
      className="bg-menu p-4 shadow-lg"
      style={{ position: "sticky", top: 0, zIndex: 1000, width: "100%" }}
    >
      <div className="container mx-auto flex flex-wrap gap-5 items-center">
        {/* Logo - 15% */}
        <div className="basis-3/24">
          <Link to="/" className="flex-shrink-0">
            <img src="/logo.png" alt="Logo" className="h-10 md:h-12" />
          </Link>
        </div>

        {/* Barra de búsqueda - 60% */}
        <div className="basis-14/24">
          <input
            type="text"
            placeholder="Buscar productos..."
            value={searchTerm}
            onChange={handleSearchChange}
            onKeyDown={handleSearchSubmit}
            className="w-full p-3 rounded-full bg-gray-800 dark:bg-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#f90] text-base md:text-lg"
            style={{ color: "white" }}
          />
          {searchResults.length > 0 && (
            <ul
              className="absolute w-full bg-gray-900 dark:bg-gray-100 border border-gray-700 dark:border-gray-300 mt-2 rounded-lg shadow-lg z-10"
              style={{ color: "white" }}
            >
              {searchResults.map((product) => (
                <li
                  key={product.id}
                  className="p-3 hover:bg-gray-700 dark:hover:bg-gray-200 cursor-pointer"
                  style={{ color: "white" }}
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

        {/* Botón de modo oscuro/claro - 10% */}
        <div className="basis-1/24">
          <button
            onClick={toggleTheme}
            className="w-full bg-[--button-bg] text-[--button-text] px-2 py-1 rounded-full hover:bg-[--button-bg-hover] text-sm flex items-center justify-center"
          >
            {theme === "light" ? "🌙" : "☀️"}
          </button>
        </div>

        {/* Iniciar sesión - 10% */}
        <div className="basis-1/24"> 
          {currentUser ? (
            <button
              onClick={handleSignOut}
              className="w-full bg-[--button-bg] text-white px-2 py-1 rounded-full hover:bg-[--button-bg-hover] text-sm flex items-center justify-center"
            >
              Cerrar Sesión
            </button>
          ) : (
            <Link to="/auth">
              <span className="w-full bg-[--button-bg] text-white px-2 py-1 rounded-full hover:bg-[--button-bg-hover] text-sm flex items-center justify-center">
                Iniciar Sesión
              </span>
            </Link>
          )}
        </div>
                {/* Iniciar sesión - 10% */}
        <div className="basis-1/24"> 
        <Link to="/auth/register">Registrarse</Link>
        </div>

        {/* Carrito - 5% */}
        <div className="basis-1/24">
          <Link to="/cart" className="flex items-center justify-center">
            <span className="bg-orange relative flex items-center justify-center bg-[--button-bg] text-[--button-text] px-2 py-1 rounded-full hover:bg-[--button-bg-hover]">
              🛒
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </span>
          </Link>
        </div>

        {/* Menú desplegable (solo en mobile cuando se abre) */}
        {isMenuOpen && (
          <div className="md:hidden mt-2 w-full bg-menu p-2 rounded-lg shadow-lg">
            {currentUser && (
              <div className="mb-2">
                <span style={{ color: "white" }}>{`Bienvenido, ${currentUser.email}`}</span>
              </div>
            )}
            {currentUser && currentUser.email === "admin@example.com" && (
              <Link to="/admin" className="block w-full text-center mb-2">
                <span className="bg-[--button-bg] text-[--button-text] px-2 py-1 rounded-full hover:bg-[--button-bg-hover]">
                  Panel Admin
                </span>
              </Link>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;