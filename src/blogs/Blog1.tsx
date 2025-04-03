import React from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet";

const Blog1: React.FC = () => {
  return (
    <div className="bg-[#0e0e0e] text-white min-h-screen">
      <Helmet>
        <title>Guía 2025: Cómo Armar tu Primer PC Gamer en Colombia | PCHub.net</title>
        <meta
          name="description"
          content="Aprende a armar tu PC gamer en Colombia con esta guía paso a paso. Encuentra los mejores componentes al mejor precio en PCHub.net."
        />
        <meta name="keywords" content="armar PC gamer en Colombia 2025, comprar componentes para PC gamer en Colombia" />
      </Helmet>

      <div className="container mx-auto p-4 flex flex-col md:flex-row gap-6">
        {/* Columna Izquierda: Contenido Principal */}
        <div className="md:w-2/3">
          <h1 className="text-3xl font-bold mb-4">
            Guía Completa para Armar tu Primer PC Gamer en Colombia (2025)
          </h1>
          <img
            src="https://example.com/pc-gamer-image.jpg"
            alt="Armar PC Gamer"
            className="w-full h-64 object-cover rounded-lg mb-6"
          />
          <p className="text-gray-400 mb-4">Publicado el 2025-04-01 por Equipo PCHub</p>

          <div className="prose prose-invert max-w-none">
            <p>
              Si eres un gamer en Colombia y quieres armar tu primer PC, estás en el lugar correcto. En esta guía, te explicaremos paso a paso cómo elegir los mejores componentes para tu presupuesto y dónde comprarlos al mejor precio.
            </p>

            <h2>Paso 1: Define tu Presupuesto</h2>
            <p>
              Antes de empezar, es importante definir cuánto estás dispuesto a gastar. Un PC gamer decente en Colombia puede costar entre 2 y 5 millones de pesos colombianos, dependiendo de los componentes que elijas.
            </p>

            <h2>Paso 2: Elige los Componentes Clave</h2>
            <h3>Procesador (CPU)</h3>
            <p>
              Para gaming, recomendamos el <strong>AMD Ryzen 5 5600X</strong> o el <strong>Intel Core i5-12400F</strong>. Ambos ofrecen un excelente rendimiento por su precio.
            </p>

            <h3>Tarjeta Gráfica (GPU)</h3>
            <p>
              La GPU es el componente más importante para gaming. Opciones como la <Link to="/product/1" className="text-[#f90] hover:underline">NVIDIA RTX 3060</Link> o la AMD RX 6700 XT son ideales para juegos modernos como Valorant o Cyberpunk 2077.
            </p>

            <h3>Memoria RAM</h3>
            <p>
              Necesitarás al menos 16 GB de RAM para gaming. Puedes encontrar opciones asequibles en <Link to="/categories" className="text-[#f90] hover:underline">nuestra tienda</Link>.
            </p>

            <h3>Almacenamiento</h3>
            <p>
              Un SSD de 1 TB para velocidad y un HDD de 2 TB para almacenamiento adicional es una combinación ideal.
            </p>

            <h3>Placa Base, Fuente de Poder y Gabinete</h3>
            <p>
              Asegúrate de elegir una placa base compatible con tu CPU (como una ASUS B550) y una fuente de poder de al menos 650W (como una Corsair CX650).
            </p>

            <h2>Paso 3: Dónde Comprar Componentes en Colombia</h2>
            <p>
              En <Link to="/categories" className="text-[#f90] hover:underline">PCHub.net</Link>, encontrarás todos estos componentes con envíos rápidos a Bogotá, Medellín, y toda Colombia.
            </p>

            <h2>Paso 4: Ensamblaje Paso a Paso</h2>
            <p>
              Sigue estos pasos para ensamblar tu PC:
            </p>
            <ol className="list-decimal list-inside">
              <li>Instala el procesador en la placa base.</li>
              <li>Coloca la placa base en el gabinete.</li>
              <li>Conecta la fuente de poder y asegúrate de que el cable de 8 pines esté conectado a la GPU.</li>
              <li>Instala el sistema operativo desde un USB.</li>
            </ol>
            <p>
              Mira este <a href="https://www.youtube.com/watch?v=example" className="text-[#f90] hover:underline" target="_blank" rel="noopener noreferrer">video tutorial</a> para más detalles.
            </p>

            <h2>Conclusión</h2>
            <p>
              Armar tu PC gamer es más fácil de lo que parece. ¡Empieza hoy mismo y encuentra todos los componentes que necesitas en <Link to="/categories" className="text-[#f90] hover:underline">PCHub.net</Link>!
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
                <Link to="/blog/mejores-tarjetas-graficas-2025-colombia" className="text-[#f90] hover:underline">
                  Las 5 Mejores Tarjetas Gráficas para Gaming en 2025
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

export default Blog1;