import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Account: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) {
      navigate("/auth");
    }
  }, [currentUser, navigate]);

  if (!currentUser) {
    return null;
  }

  return (
    <div className="p-6 min-h-screen">
      <div className="container mx-auto">
        <h1 className="text-3xl font-semibold mb-6" style={{ color: "var(--text-color)" }}>
          Mi Cuenta
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Sección: Tus Pedidos */}
          <div className="bg-white  p-6 rounded-lg shadow-md">
            <div className="flex items-center gap-4">
              <div className="text-3xl">📦</div>
              <div>
                <h2 className="text-xl font-semibold text-black" >
                  Tus Pedidos
                </h2>
                <p className="text-black">
                  Rastrea, devuelve o compra de nuevo
                </p>
                <Link
                  to="/orders"
                  className="text-[#f90] hover:underline mt-2 block"
                >
                  Ver Pedidos
                </Link>
              </div>
            </div>
          </div>

          {/* Sección: Lista de Deseados */}
          <div className="bg-white  p-6 rounded-lg shadow-md">
            <div className="flex items-center gap-4">
              <div className="text-3xl">❤️</div>
              <div>
                <h2 className="text-xl font-semibold text-black" >
                  Lista de Deseados
                </h2>
                <p className="text-black">
                  Revisa los productos que te interesan
                </p>
                <Link
                  to="/wishlist"
                  className="text-[#f90] hover:underline mt-2 block"
                >
                  Ver Lista de Deseados
                </Link>
              </div>
            </div>
          </div>

          {/* Sección: Tus Direcciones */}
          <div className="bg-white  p-6 rounded-lg shadow-md">
            <div className="flex items-center gap-4">
              <div className="text-3xl">🏠</div>
              <div>
                <h2 className="text-xl font-semibold text-black" >
                  Tus Direcciones
                </h2>
                <p className="text-black">
                  Edita, elimina o establece una dirección predeterminada
                </p>
                <Link
                  to="/addresses"
                  className="text-[#f90] hover:underline mt-2 block"
                >
                  Gestionar Direcciones
                </Link>
              </div>
            </div>
          </div>

          {/* Sección: Configuración de Cuenta */}
          <div className="bg-white  p-6 rounded-lg shadow-md">
            <div className="flex items-center gap-4">
              <div className="text-3xl">⚙️</div>
              <div>
                <h2 className="text-xl font-semibold text-black" >
                  Configuración de Cuenta
                </h2>
                <p className="text-black">
                  Edita tu nombre, correo y contraseña
                </p>
                <Link
                  to="/settings"
                  className="text-[#f90] hover:underline mt-2 block"
                >
                  Configurar Cuenta
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;