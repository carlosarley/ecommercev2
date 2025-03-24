import React, { createContext, useState, useContext, useEffect } from "react";
import { Product, CartItem } from "../types";
import { toast } from "react-toastify";
import { db } from "../firebase";
import { doc, setDoc, onSnapshot } from "firebase/firestore";
import { useAuth } from "./AuthContext";

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
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [lastAddedProduct, setLastAddedProduct] = useState<Product | null>(null);
  const { currentUser } = useAuth();

  // Cargar el carrito desde Firestore (o localStorage si no hay usuario autenticado)
  useEffect(() => {
    if (!currentUser) {
      // Si no hay usuario autenticado, usa localStorage
      const storedCart = localStorage.getItem("cart");
      setCartItems(storedCart ? JSON.parse(storedCart) : []);
      return;
    }

    // Si hay usuario autenticado, carga el carrito desde Firestore
    const cartRef = doc(db, "carts", currentUser.uid);
    const unsubscribe = onSnapshot(
      cartRef,
      (doc) => {
        if (doc.exists()) {
          setCartItems(doc.data().items || []);
        } else {
          setCartItems([]);
        }
      },
      (error) => {
        console.error("Error al cargar el carrito:", error);
        toast.error("Error al cargar el carrito", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  // Guardar el carrito en Firestore o localStorage
  const saveCart = async (newCart: CartItem[]) => {
    if (currentUser) {
      // Si hay usuario autenticado, guarda en Firestore
      try {
        await setDoc(doc(db, "carts", currentUser.uid), { items: newCart });
      } catch (error) {
        console.error("Error al guardar el carrito:", error);
        toast.error("Error al guardar el carrito", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } else {
      // Si no hay usuario autenticado, guarda en localStorage
      localStorage.setItem("cart", JSON.stringify(newCart));
    }
  };

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
      let newCart;
      if (existingItem) {
        newCart = prevItems.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        newCart = [...prevItems, { ...product, quantity: 1 }];
      }
      saveCart(newCart); // Guardar en Firestore o localStorage
      return newCart;
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

    setCartItems((prevItems) => {
      const newCart = prevItems.map((item) =>
        item.id === productId ? { ...item, quantity: item.quantity + 1 } : item
      );
      saveCart(newCart); // Guardar en Firestore o localStorage
      return newCart;
    });
  };

  const decreaseQuantity = (productId: string) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === productId);
      let newCart;
      if (existingItem && existingItem.quantity > 1) {
        newCart = prevItems.map((item) =>
          item.id === productId ? { ...item, quantity: item.quantity - 1 } : item
        );
      } else {
        newCart = prevItems.filter((item) => item.id !== productId);
      }
      saveCart(newCart); // Guardar en Firestore o localStorage
      return newCart;
    });
  };

  const removeFromCart = (productId: string) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === productId);
      let newCart;
      if (existingItem && existingItem.quantity > 1) {
        newCart = prevItems.map((item) =>
          item.id === productId ? { ...item, quantity: item.quantity - 1 } : item
        );
      } else {
        newCart = prevItems.filter((item) => item.id !== productId);
      }
      saveCart(newCart); // Guardar en Firestore o localStorage
      return newCart;
    });
  };

  const clearCart = () => {
    setCartItems([]);
    saveCart([]); // Guardar en Firestore o localStorage
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