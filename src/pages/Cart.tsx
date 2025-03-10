import { useCart } from "../context/CartContext";

const Cart: React.FC = () => {
  const { cartItems, removeFromCart, clearCart, increaseQuantity, decreaseQuantity } = useCart();

  const totalPrice = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <div className="bg-body text-white p-6">
      <div className="container mx-auto">
        <h1 className="text-3xl font-semibold mb-4">Carrito de Compras</h1>
        {cartItems.length > 0 ? (
          <div>
            <div className="grid grid-cols-1 gap-6">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center bg-menu p-4 rounded-lg border border-gray-700"
                >
                  <img
                    src={item.image || "/placeholder.jpg"}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded-md mr-4"
                  />
                  <div className="flex-1">
                    <h3 className="text-lg font-medium">{item.name}</h3>
                    <p className="text-md text-button">${item.price} x {item.quantity}</p>
                    <p className="text-md">Subtotal: ${(item.price * item.quantity).toFixed(2)}</p>
                    <div className="flex items-center mt-2">
                      <button
                        onClick={() => decreaseQuantity(item.id)}
                        className="bg-gray-500 text-white px-3 py-1 rounded-md hover:bg-gray-600"
                      >
                        −
                      </button>
                      <span className="mx-3">{item.quantity}</span>
                      <button
                        onClick={() => increaseQuantity(item.id)}
                        className="bg-gray-500 text-white px-3 py-1 rounded-md hover:bg-gray-600"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
                  >
                    Eliminar
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-6 text-right">
              <p className="text-xl font-semibold">Total: ${totalPrice.toFixed(2)}</p>
              <button
                onClick={clearCart}
                className="mt-4 bg-red-500 text-white px-6 py-3 rounded-md hover:bg-red-600 mr-4"
              >
                Limpiar carrito
              </button>
              <button className="mt-2 bg-[#f90] text-white px-4 py-2 rounded-md hover:bg-[#e68a00]">
                Proceder al pago
              </button>
            </div>
          </div>
        ) : (
          <p>Tu carrito está vacío.</p>
        )}
      </div>
    </div>
  );
};

export default Cart;