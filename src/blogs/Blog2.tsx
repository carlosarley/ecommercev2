import React from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet";

const Blog2: React.FC = () => {
  return (
    <div className="bg-[#0e0e0e] text-white min-h-screen">
      <Helmet>
        <title>Las 5 Mejores Tarjetas Gráficas para Gaming en 2025 en Colombia | PCHub.net</title>
        <meta
          name="description"
          content="Descubre las 5 mejores tarjetas gráficas para gaming en 2025 y dónde comprarlas en Colombia. Encuentra la GPU perfecta en PCHub.net."
        />
        <meta name="keywords" content="mejores tarjetas gráficas para gaming 2025 Colombia, comprar tarjeta gráfica en Colombia" />
      </Helmet>

      <div className="container mx-auto p-4 flex flex-col md:flex-row gap-6">
        {/* Columna Izquierda: Contenido Principal */}
        <div className="md:w-2/3">
          <h1 className="text-3xl font-bold mb-4">
            Las 5 Mejores Tarjetas Gráficas para Gaming en 2025: ¿Cuál Comprar en Colombia?
          </h1>
          <img
            src="https://example.com/gpu-image.jpg"
            alt="Mejores Tarjetas Gráficas"
            className="w-full h-64 object-cover rounded-lg mb-6"
          />
          <p className="text-gray-400 mb-4">Publicado el 2025-04-02 por Equipo PCHub</p>

          <div className="prose prose-invert max-w-none">
            <p>
              Si eres un gamer en Colombia, sabes que una buena tarjeta gráfica es el corazón de tu setup. En este artículo, te mostramos las 5 mejores GPUs para gaming en 2025 y dónde comprarlas al mejor precio.
            </p>

            <h2>1. NVIDIA RTX 4060</h2>
            <h3>Especificaciones</h3>
            <p>
              La RTX 4060 ofrece un excelente rendimiento para juegos en 1080p y 1440p, con soporte para DLSS 3.
            </p>
            <h3>Precio en Colombia</h3>
            <p>
              Aproximadamente 1.5 millones de COP. Encuentra la <Link to="/product/2" className="text-[#f90] hover:underline">RTX 4060</Link> en nuestra tienda.
            </p>

            <h2>2. AMD RX 7700 XT</h2>
            <h3>Especificaciones</h3>
            <p>
              La RX 7700 XT compite con la RTX 4060 y es ideal para quienes prefieren AMD.
            </p>
            <h3>Precio en Colombia</h3>
            <p>
              Alrededor de 1.6 millones de COP.
            </p>

            <h2>3. NVIDIA RTX 3060 (Opción Económica)</h2>
            <p>
              Aunque es de una generación anterior, la <Link to="/product/1" className="text-[#f90] hover:underline">RTX 3060</Link> sigue siendo una gran opción para gaming en 1080p.
            </p>

            <h2>4. AMD RX 6700 XT</h2>
            <p>
              Ofrece una excelente relación costo-beneficio para juegos en 1440p.
            </p>

            <h2>5. NVIDIA RTX 4080 (Alta Gama)</h2>
            <p>
              Ideal para gamers profesionales o streamers que necesitan lo mejor del mercado.
            </p>

            <h2>Dónde Comprar Estas Tarjetas Gráficas en Colombia</h2>
            <p>
              En <Link to="/categories" className="text-[#f90] hover:underline">PCHub.net</Link>, tenemos stock de estas GPUs con envíos rápidos a todo el país.
            </p>

            <h2>Conclusión</h2>
            <p>
              Elige la mejor tarjeta gráfica para tu setup gamer. Visita <Link to="/categories" className="text-[#f90] hover:underline">PCHub.net</Link> y encuentra las mejores GPUs con envíos rápidos a toda Colombia.
            </p>
          </div>
        </div>

        {/* Columna Derecha: Barra Lateral */}
        <div className="md:w-1/3">
          <div className="bg-[#1a1a1a] p-4 rounded-lg shadow-lg mb-6">
            <h2 className="text-xl font-semibold mb-4">Explora Nuestros Productos</h2>
            <ul className="space-y-2">
              <li>
                <Link to="/categories/procesadores" className="text-[#f90] hover:underline">Procesadores</Link>
              </li>
              <li>
                <Link to="/categories/tarjetas-graficas" className="text-[#f90] hover:underline">Tarjetas Gráficas</Link>
              </li>
              <li>
                <Link to="/categories/memoria-ram" className="text-[#f90] hover:underline">Memoria RAM</Link>
              </li>
              <li>
                <Link to="/categories/almacenamiento" className="text-[#f90] hover:underline">Almacenamiento</Link>
              </li>
              <li>
                <Link to="/categories/placas-base" className="text-[#f90] hover:underline">Placas Base</Link>
              </li>
              <li>
                <Link to="/categories/fuentes-de-poder" className="text-[#f90] hover:underline">Fuentes de Poder</Link>
              </li>
            </ul>
          </div>

          <div className="bg-[#1a1a1a] p-4 rounded-lg shadow-lg mb-6">
            <h2 className="text-xl font-semibold mb-4">Artículos Relacionados</h2>
            <ul className="space-y-2">
              <li>
                <Link to="/blog/armar-pc-gamer-colombia-2025" className="text-[#f90] hover:underline">
                  Guía Completa para Armar tu Primer PC Gamer
                </Link>
              </li>
              <li>
                <Link to="/blog/mejorar-rendimiento-pc-gamer-2025" className="text-[#f90] hover:underline">
                  Cómo Mejorar el Rendimiento de tu PC Gamer
                </Link>
              </li>
            </ul>
          </div>

          <div className="text-center">
            <Link
              to="/categories"
              className="bg-[#f90] text-white px-4 py-2 rounded hover:bg-[#e68a00] inline-block"
            >
              Ver Todos los Componentes
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Blog2;