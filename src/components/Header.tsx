import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { collection, query, where, onSnapshot, limit } from "firebase/firestore";
import { db } from "../firebase";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { Product } from "../types";
import { useTheme } from "../context/ThemeContext";
import { toast } from "react-toastify";

const Header: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const { cartItems } = useCart();
  const { currentUser, signOut } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);

  useEffect(() => {
    if (searchTerm.length < 2) { // Evitar búsquedas con términos muy cortos
      setSearchResults([]);
      return;
    }

    const term = searchTerm.toLowerCase().trim();
    console.log("Buscando término:", term);

    // Usar array-contains para buscar en el campo searchKeywords
    const q = query(
      collection(db, "products"),
      where("searchKeywords", "array-contains", term),
      limit(5)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        console.log("Snapshot recibido:", snapshot.docs.length);
        const results = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Product));
        console.log("Resultados encontrados:", results);
        setSearchResults(results);
      },
      (error) => {
        console.error("Error en la búsqueda:", error);
        toast.error("Error al buscar productos. Intenta de nuevo.");
      }
    );

    return () => unsubscribe();
  }, [searchTerm]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
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
      await signOut();
      toast.success("Sesión cerrada exitosamente");
      navigate("/");
      setIsMenuOpen(false);
    } catch (err: any) {
      console.error("Error al cerrar sesión:", err.message);
      toast.error("Error al cerrar sesión. Intenta de nuevo.");
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
            <img
              src="https://github.com/carlosarley/ecommercev2/raw/main/src/assets/img/Recurso-1.svg"
              alt="Logo"
              className="h-10 md:h-12"
            />
          </Link>
        </div>

        {/* Barra de búsqueda - 60% */}
        <div className="basis-14/24 relative">
          <input
            type="text"
            placeholder="Buscar productos..."
            value={searchTerm}
            onChange={handleSearchChange}
            onKeyDown={handleSearchSubmit}
            className="w-full p-3 rounded-full bg-gray-800 dark:bg-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#f90] text-base md:text-lg"
            style={{ color: "black" }}
            aria-label="Buscar productos"
          />
          {searchResults.length > 0 && (
            <ul
              className="absolute w-full bg-gray-900 dark:bg-gray-100 border border-gray-700 dark:border-gray-300 mt-2 rounded-lg shadow-lg z-10"
              style={{ color: "black" }}
            >
              {searchResults.map((product) => (
                <li
                  key={product.id}
                  className="p-3 hover:bg-gray-700 dark:hover:bg-gray-200 cursor-pointer"
                  style={{ color: "black" }}
                  onClick={() => {
                    navigate(`/product/${product.id}`);
                    setSearchTerm("");
                    setSearchResults([]);
                  }}
                >
                  {product.name}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Botón de modo oscuro/claro - 10% */}
        <div className="basis-1/24">
          <button
            onClick={toggleTheme}
            className="w-full bg-[var(--button-bg)] text-[var(--button-text)] px-2 py-1 rounded-full hover:bg-[var(--button-bg-hover)] text-sm flex items-center justify-center"
            aria-label={theme === "light" ? "Cambiar a modo oscuro" : "Cambiar a modo claro"}
          >
            {theme === "light" ? "🌙" : "☀️"}
          </button>
        </div>

        {/* Iniciar sesión / Cerrar sesión - 10% */}
        <div className="basis-1/24">
          {currentUser ? (
            <button
              onClick={handleSignOut}
              className="w-full bg-[var(--button-bg)] text-white px-2 py-1 rounded-full hover:bg-[var(--button-bg-hover)] text-sm flex items-center justify-center"
              aria-label="Cerrar sesión"
            >
              Cerrar Sesión
            </button>
          ) : (
            <Link to="/auth">
              <span className="w-full bg-[var(--button-bg)] text-white px-2 py-1 rounded-full hover:bg-[var(--button-bg-hover)] text-sm flex items-center justify-center">
                Iniciar Sesión
              </span>
            </Link>
          )}
        </div>

        {/* Mi Cuenta (solo si está autenticado) - 10% */}
        {currentUser && (
          <div className="basis-1/24 text-white">
            <Link to="/account">Mi Cuenta</Link>
          </div>
        )}

        {/* Registrarse (solo si no está autenticado) - 10% */}
        {!currentUser && (
          <div className="basis-1/24 text-white">
            <Link to="/auth/register">Registrarse</Link>
          </div>
        )}

        {/* Carrito - 5% */}
        <div className="basis-1/24">
          <Link to="/cart" className="flex items-center justify-center">
            <span
              className="bg-orange relative flex items-center justify-center bg-[var(--button-bg)] text-[var(--button-text)] px-2 py-1 rounded-full hover:bg-[var(--button-bg-hover)]"
              aria-label={`Carrito con ${totalItems} productos`}
            >
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
                <span style={{ color: "black" }}>{`Bienvenido, ${currentUser.email}`}</span>
              </div>
            )}
            {currentUser && currentUser.email === "admin@example.com" && (
              <Link to="/admin" className="block w-full text-center mb-2">
                <span className="bg-[var(--button-bg)] text-[var(--button-text)] px-2 py-1 rounded-full hover:bg-[var(--button-bg-hover)]">
                  Panel Admin
                </span>
              </Link>
            )}
            {currentUser && (
              <Link to="/account" className="block w-full text-center mb-2">
                <span className="bg-[var(--button-bg)] text-[var(--button-text)] px-2 py-1 rounded-full hover:bg-[var(--button-bg-hover)]">
                  Mi Cuenta
                </span>
              </Link>
            )}
            {currentUser && (
              <Link to="/wishlist" className="block w-full text-center mb-2">
                <span className="bg-[var(--button-bg)] text-[var(--button-text)] px-2 py-1 rounded-full hover:bg-[var(--button-bg-hover)]">
                  Lista de Deseados
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