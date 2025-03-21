import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Offers from "./pages/Offers";
import Categories from "./pages/Categories";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Auth from "./pages/Auth";
import AdminPanel from "./pages/AdminPanel";
import SearchPage from "./pages/SearchPage";
import RegisterPage from "./pages/RegisterPage"; // Importa RegisterPage
import Header from "./components/Header";
import Submenu from "./components/Submenu";
import Footer from "./components/Footer";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PaymentPage from "./pages/PaymentPage";

const App: React.FC = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <Header />
          <Submenu />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/payment" element={<PaymentPage />} />
            <Route path="/offers" element={<Offers />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/search" element={<SearchPage />} />
            {/* Anidamos las rutas de autenticación */}
            <Route path="/auth">
              <Route index element={<Auth />} /> {/* /auth muestra la página de login */}
              <Route path="register" element={<RegisterPage />} /> {/* /auth/register muestra la página de registro */}
            </Route>
          </Routes>
          <Footer />
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="dark"
          />
        </Router>
      </CartProvider>
    </AuthProvider>
  );
};

export default App;