const Footer: React.FC = () => {
    return (
      <footer className="bg-menu text-white p-8 mt-8">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Ecommerce PC Parts</h3>
              <p>Tu tienda favorita para componentes de PC y más.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Enlaces</h3>
              <ul>
                <li><a href="#" className="hover:text-button">Inicio</a></li>
                <li><a href="#" className="hover:text-button">Ofertas</a></li>
                <li><a href="#" className="hover:text-button">Categorías</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Redes Sociales</h3>
              <ul>
                <li><a href="#" className="hover:text-button">Facebook</a></li>
                <li><a href="#" className="hover:text-button">Twitter</a></li>
                <li><a href="#" className="hover:text-button">Instagram</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Contacto</h3>
              <p>Email: support@ecommercepcparts.com</p>
              <p>Teléfono: +123 456 7890</p>
            </div>
          </div>
          <p className="text-center mt-8">© 2025 Ecommerce PC Parts. Todos los derechos reservados.</p>
        </div>
      </footer>
    );
  };
  
  export default Footer;