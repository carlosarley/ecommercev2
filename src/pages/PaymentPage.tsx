import React from "react";
import { useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { useCart } from "../context/CartContext";
import { getFunctions, httpsCallable } from "firebase/functions";

interface TransactionResponse {
  success: boolean;
  transactionId: string;
  reference: string;
  redirectUrl: string;
  error?: string;
}

const PaymentPage: React.FC = () => {
  const { cartItems } = useCart();
  const { state } = useLocation();
  const { total = 0 } = state || {};

  const totalInCents = Math.round(total * 100);

  const handleCreateTransaction = async () => {
    if (cartItems.length === 0) {
      toast.error("El carrito está vacío. Agrega productos antes de pagar.");
      return;
    }

    const functions = getFunctions();
    const createWompiTransaction = httpsCallable<unknown, TransactionResponse>(
      functions,
      "createWompiTransaction"
    );

    try {
      const result = await createWompiTransaction({
        amountInCents: totalInCents,
        customerEmail: "cliente@example.com",
        customerData: {
          full_name: "Cliente Ejemplo",
          email: "cliente@example.com",
          phone_number: "3001234567", // El backend lo convertirá a "573001234567"
          legal_id: "123456789",
          legal_id_type: "CC",
        },
      });

      const { success, transactionId, reference, redirectUrl, error } = result.data;

      if (success && transactionId && reference && redirectUrl) {
        toast.success("Transacción creada. Redirigiendo al checkout de Wompi...");
        // Redirigir al usuario al checkout de Wompi
        window.location.href = redirectUrl;
      } else {
        console.error("Error al crear transacción:", error);
        toast.error("Error al procesar el pago. Intenta de nuevo.");
      }
    } catch (error) {
      console.error("Error al crear transacción:", error);
      toast.error("Error al procesar el pago. Intenta de nuevo.");
    }
  };

  return (
    <div className="container mx-auto p-6 min-h-screen">
      <h1 className="text-2xl font-bold mb-4" style={{ color: "var(--text-color)" }}>
        Pago con Wompi
      </h1>
      <div className="space-y-4">
        <p className="text-lg" style={{ color: "var(--text-color)" }}>
          Total a pagar: ${(total / 100).toFixed(2)} COP
        </p>
        <button
          onClick={handleCreateTransaction}
          className="bg-[#f90] text-white px-4 py-2 rounded hover:bg-[#e68a00]"
        >
          Pagar con Wompi
        </button>
      </div>
    </div>
  );
};

export default PaymentPage;