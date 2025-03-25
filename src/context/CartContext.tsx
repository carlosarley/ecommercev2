import React, { createContext, useState, useContext, useEffect } from "react";
import { Product, CartItem } from "../types";
import { toast } from "react-toastify";

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  increaseQuantity: (productId: string) => void;
  decreaseQuantity: (productId: string) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Función para cargar el carrito desde localStorage
  const loadCartFromStorage = (): CartItem[] => {
    try {
      const storedCart = localStorage.getItem("cart");
      console.log("Cargando carrito desde localStorage:", storedCart);
      return storedCart ? JSON.parse(storedCart) : [];
    } catch (error) {
      console.error("Error al cargar el carrito desde localStorage:", error);
      return [];
    }
  };

  // Inicializa el estado del carrito con los datos de localStorage
  const [cartItems, setCartItems] = useState<CartItem[]>(loadCartFromStorage());
  const [lastAddedProduct, setLastAddedProduct] = useState<Product | null>(null);

  // Cada vez que cartItems cambie, guárdalo en localStorage
  useEffect(() => {
    try {
      console.log("Guardando carrito en localStorage:", cartItems);
      localStorage.setItem("cart", JSON.stringify(cartItems));
    } catch (error) {
      console.error("Error al guardar el carrito en localStorage:", error);
    }
  }, [cartItems]);

  const addToCart = (product: Product) => {
    const existingItem = cartItems.find((item) => item.id === product.id);
    const currentQuantity = existingItem ? existingItem.quantity : 0;

    // Validar stock antes de añadir
    if (product.stock !== undefined && currentQuantity >= product.stock) {
      toast.error(`No hay más stock disponible para ${product.name}`, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      return;
    }

    setLastAddedProduct(product);
    setCartItems((prevItems) => {
      if (existingItem) {
        return prevItems.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevItems, { ...product, quantity: 1 }];
    });
  };

  const increaseQuantity = (productId: string) => {
    const existingItem = cartItems.find((item) => item.id === productId);
    if (!existingItem) return;

    // Validar stock antes de aumentar la cantidad
    if (existingItem.stock !== undefined && existingItem.quantity >= existingItem.stock) {
      toast.error(`No hay más stock disponible para ${existingItem.name}`, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      return;
    }

    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === productId ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const decreaseQuantity = (productId: string) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === productId);
      if (existingItem && existingItem.quantity > 1) {
        return prevItems.map((item) =>
          item.id === productId ? { ...item, quantity: item.quantity - 1 } : item
        );
      }
      return prevItems.filter((item) => item.id !== productId);
    });
  };

  const removeFromCart = (productId: string) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === productId);
      if (existingItem && existingItem.quantity > 1) {
        return prevItems.map((item) =>
          item.id === productId ? { ...item, quantity: item.quantity - 1 } : item
        );
      }
      return prevItems.filter((item) => item.id !== productId);
    });
  };

  const clearCart = () => {
    setCartItems([]);
  };

  useEffect(() => {
    if (lastAddedProduct) {
      const existingItem = cartItems.find((item) => item.id === lastAddedProduct.id);
      if (existingItem) {
        toast.success(`${lastAddedProduct.name} añadido al carrito (x${existingItem.quantity})`, {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      } else {
        toast.success(`${lastAddedProduct.name} añadido al carrito`, {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      }
      setLastAddedProduct(null);
    }
  }, [cartItems, lastAddedProduct]);

  return (
    <CartContext.Provider
      value={{ cartItems, addToCart, removeFromCart, clearCart, increaseQuantity, decreaseQuantity }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};