import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Offers from "./pages/Offers";
import Categories from "./pages/Categories";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Auth from "./pages/Auth";
import AdminPanel from "./pages/AdminPanel";
import SearchPage from "./pages/SearchPage";
import RegisterPage from "./pages/RegisterPage";
import Header from "./components/Header";
import Submenu from "./components/Submenu";
import Footer from "./components/Footer";
import Account from "./components/Account";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PaymentPage from "./pages/PaymentPage";
import SuccessPage from "./pages/SuccessPage";
import Wishlist from "./pages/Wishlist";
import BlogIndex from "./blogs/BlogIndex"; // Usamos el índice estático
import Blog1 from "./blogs/Blog1";
import Blog2 from "./blogs/Blog2";
import Blog3 from "./blogs/Blog3";

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
            <Route path="/success" element={<SuccessPage />} />
            <Route path="/offers" element={<Offers />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/account" element={<Account />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/auth">
              <Route index element={<Auth />} />
              <Route path="register" element={<RegisterPage />} />
            </Route>
            {/* Rutas para el blog */}
            <Route path="/blog" element={<BlogIndex />} />
            <Route path="/blog/armar-pc-gamer-colombia-2025" element={<Blog1 />} />
            <Route path="/blog/mejores-tarjetas-graficas-2025-colombia" element={<Blog2 />} />
            <Route path="/blog/mejorar-rendimiento-pc-gamer-2025" element={<Blog3 />} />
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
            theme="light" // Cambiar a "light"
          />
        </Router>
      </CartProvider>
    </AuthProvider>
  );
};

export default App;