import React from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../utils/formatPrice";

const Cart: React.FC = () => {
  const { cartItems, removeFromCart, clearCart, increaseQuantity, decreaseQuantity } = useCart();
  const navigate = useNavigate();

  // Calcular el total con descuentos aplicados
  const totalPrice = cartItems.reduce((total, item) => {
    const itemPrice = item.price;
    const discountPercentage = item.discount || 0; // Si no hay descuento, usa 0
    const discountedPrice = itemPrice * (1 - discountPercentage / 100);
    return total + discountedPrice * item.quantity;
  }, 0);

  const handleProceedToPayment = () => {
    if (cartItems.length === 0) {
      alert("El carrito está vacío. Agrega productos antes de pagar.");
      return;
    }
    navigate("/payment", { state: { total: totalPrice, cartItems } });
  };

  return (
    <div className="p-6">
      <div className="container mx-auto">
        <h1 className="text-3xl font-semibold mb-4" style={{ color: "var(--text-color)" }}>
          Carrito de Compras
        </h1>
        {cartItems.length > 0 ? (
          <div>
            <div className="grid grid-cols-1 gap-6">
              {cartItems.map((item) => {
                const originalPrice = item.price;
                const discountPercentage = item.discount || 0;
                const discountedPrice = originalPrice * (1 - discountPercentage / 100);

                return (
                  <div
                    key={item.id}
                    className="flex items-center bg-white p-4 rounded-lg border border-gray-300"
                  >
                    <img
                      src={item.image || "/placeholder.jpg"}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-md mr-4"
                    />
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-black">
                        {item.name}
                        {discountPercentage > 0 && (
                          <span className="text-green-500 ml-2">({discountPercentage}% OFF)</span>
                        )}
                      </h3>
                      <p className="text-xl text-black">
                        {discountPercentage > 0 ? (
                          <>
                            <span className="line-through text-gray-500 mr-2">
                              ${formatPrice(originalPrice)}
                            </span>
                            ${formatPrice(discountedPrice)}
                          </>
                        ) : (
                          `$${formatPrice(originalPrice)}`
                        )}{" "}
                        x {item.quantity}
                      </p>
                      <p className="text-md text-black">
                        Subtotal: ${formatPrice(discountedPrice * item.quantity)}
                      </p>
                      <div className="flex items-center mt-2">
                        <button
                          onClick={() => decreaseQuantity(item.id)}
                          className="bg-gray-300 text-black px-3 py-1 rounded-md hover:bg-gray-400"
                        >
                          −
                        </button>
                        <span className="mx-3 text-black">{item.quantity}</span>
                        <button
                          onClick={() => increaseQuantity(item.id)}
                          className="bg-gray-300 text-black px-3 py-1 rounded-md hover:bg-gray-400"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="bg-[#f90] text-white px-4 py-2 rounded-md hover:bg-[#e68a00]"
                    >
                      Eliminar
                    </button>
                  </div>
                );
              })}
            </div>
            <div className="mt-6 text-right">
              <p className="text-2xl font-semibold text-black">
                TOTAL: ${formatPrice(totalPrice)}
              </p>
              <button
                onClick={clearCart}
                className="mt-4 bg-red-500 text-white px-6 py-3 rounded-md hover:bg-red-600 mr-4"
              >
                Limpiar carrito
              </button>
              <button
                onClick={handleProceedToPayment}
                className="mt-2 bg-[#f90] text-white px-4 py-2 rounded-md hover:bg-[#e68a00]"
              >
                Proceder al pago
              </button>
            </div>
          </div>
        ) : (
          <p style={{ color: "var(--text-color)" }}>Tu carrito está vacío.</p>
        )}
      </div>
    </div>
  );
};

export default Cart;