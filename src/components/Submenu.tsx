import { useState } from "react";
import { Link } from "react-router-dom";

// Interface y estados relacionados con location (comentados para posible uso futuro)
//interface Address {
  //country: string;
  //city: string;
//}

const Submenu: React.FC = () => {
  // Estados relacionados con location (comentados para posible uso futuro)
  // const [address, setAddress] = useState<Address | null>(null);
  // const [showLocationModal, setShowLocationModal] = useState(false);
  // const [locationError, setLocationError] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false); // Estado para el menú hamburguesa

  // useEffect para obtener la ubicación guardada (comentado para posible uso futuro)
  // useEffect(() => {
  //   const savedLocation = localStorage.getItem("userLocation");
  //   if (savedLocation) {
  //     const [city, country] = savedLocation.split(", ");
  //     setAddress({ city, country });
  //   }
  // }, []);

  // Función para obtener la geolocalización (comentada para posible uso futuro)
  // const handleGetLocation = () => {
  //   if (!navigator.geolocation) {
  //     setLocationError("La geolocalización no es compatible con este navegador.");
  //     return;
  //   }

  //   navigator.geolocation.getCurrentPosition(
  //     async (position) => {
  //       const { latitude, longitude } = position.coords;
  //       try {
  //         const response = await fetch(
  //           `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
  //         );
  //         if (!response.ok) {
  //           throw new Error(`Error en Nominatim: ${response.status} ${response.statusText}`);
  //         }
  //         const data = await response.json();
  //         const locationString = `${data.address.city || data.address.town || data.address.village || ""}, ${
  //           data.address.country || ""
  //         }`.trim();
  //         if (locationString) {
  //           const [city, country] = locationString.split(", ");
  //           setAddress({ city, country });
  //           localStorage.setItem("userLocation", locationString);
  //           setLocationError("");
  //         } else {
  //           throw new Error("No se encontraron datos de dirección.");
  //         }
  //       } catch (error) {
  //         console.error("Error al obtener la dirección:", error);
  //         setLocationError("No se pudo obtener la dirección. Ingresa tu ubicación manualmente.");
  //         setShowLocationModal(true);
  //       }
  //     },
  //     (error) => {
  //       console.error("Error al obtener la ubicación:", error);
  //       if (error.code === error.PERMISSION_DENIED) {
  //         setLocationError("Permiso denegado. Ingresa tu ubicación manualmente.");
  //       } else {
  //         setLocationError("Error al obtener la ubicación. Ingresa tu ubicación manualmente.");
  //       }
  //       setShowLocationModal(true);
  //     }
  //   );
  // };

  // Función para guardar la ubicación manualmente (comentada para posible uso futuro)
  // const handleSaveLocation = (location: string) => {
  //   const [city, country] = location.split(", ");
  //   if (city && country) {
  //     const addressData: Address = { city, country };
  //     setAddress(addressData);
  //     localStorage.setItem("userLocation", location);
  //     setShowLocationModal(false);
  //     setLocationError("");
  //     toast.success("Ubicación guardada exitosamente.", {
  //       position: "top-right",
  //       autoClose: 3000,
  //     });
  //   } else {
  //     toast.error("Por favor, usa el formato 'Ciudad, País' (e.g., Bogotá, Colombia).", {
  //       position: "top-right",
  //       autoClose: 3000,
  //     });
  //   }
  // };

  return (
    <nav className="bg-menu text-white p-4">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between">
        {/* Sección de ubicación (comentada para posible uso futuro) */}
        {/* <div className="flex items-center space-x-4 w-full md:w-auto">
          {!address && (
            <button
              onClick={handleGetLocation}
              className="bg-button text-white px-3 py-1 rounded-md hover:bg-opacity-80 text-sm md:text-base"
            >
              Obtener Ubicación
            </button>
          )}
          <button
            onClick={() => setShowLocationModal(true)}
            className="bg-button text-white px-3 py-1 rounded-md hover:bg-opacity-80 text-sm md:text-base w-full md:w-auto"
          >
            {address ? `Ubicación: ${address.city}, ${address.country}` : "Agregar Ubicación"}
          </button>
          {locationError && <p className="text-red-500 text-xs md:text-sm">{locationError}</p>}
          {showLocationModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-[#0e0e0e] p-6 rounded-lg shadow-lg">
                <h3 className="text-xl font-bold mb-4 text-[#fff]">Ingresa tu ubicación</h3>
                <input
                  type="text"
                  placeholder="Ej: Bogotá, Colombia"
                  className="w-full p-2 mb-4 rounded bg-[#fff] text-[#000] focus:outline-none"
                  onChange={(e) => {
                    const location = e.target.value;
                    handleSaveLocation(location);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSaveLocation(e.currentTarget.value);
                    }
                  }}
                />
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => {
                      setShowLocationModal(false);
                      setLocationError("");
                    }}
                    className="bg-gray-500 text-[#fff] px-4 py-2 rounded hover:bg-gray-600 cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => handleSaveLocation(document.querySelector("input")?.value || "")}
                    className="bg-[#f90] text-[#fff] px-4 py-2 rounded hover:bg-[#e68a00] cursor-pointer"
                  >
                    Guardar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div> */}
        <div className="flex items-center w-full justify-between">
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
          <div className={`md:flex space-x-6 ${isMenuOpen ? "block" : "hidden"} md:block`}>
            <Link
              to="/offers"
              className="hover:text-button transition-colors block md:inline-block text-sm md:text-base"
              onClick={() => setIsMenuOpen(false)}
            >
              Ofertas
            </Link>
            <Link
              to="/categories"
              className="hover:text-button transition-colors block md:inline-block text-sm md:text-base"
              onClick={() => setIsMenuOpen(false)}
            >
              Categorías
            </Link>
            <Link
              to="/blog"
              className="hover:text-button transition-colors block md:inline-block text-sm md:text-base"
              onClick={() => setIsMenuOpen(false)}
            >
              Blog
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Submenu;