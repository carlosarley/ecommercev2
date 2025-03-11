import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom"; // useNavigate reemplaza useHistory
import { toast } from "react-toastify";
import { useCart } from "../context/CartContext";
import { getFunctions, httpsCallable } from "firebase/functions";
import { TransactionResponse } from "../types";

const WOMPI_PUBLIC_KEY = import.meta.env.VITE_WOMPI_PUBLIC_KEY;

const PaymentPage: React.FC = () => {
  const { cartItems } = useCart();
  const { state } = useLocation();
  const { total = 0 } = state || {};
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [transactionReference, setTransactionReference] = useState<string | null>(null);
  const navigate = useNavigate(); // Reemplazo de useHistory

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
          phone_number: "1234567890",
          legal_id: "123456789",
          legal_id_type: "CC",
        },
      });

      const { success, transactionId, reference, error } = result.data;

      if (success && transactionId && reference) {
        setTransactionId(transactionId);
        setTransactionReference(reference);
        toast.success("Transacción creada. Redirigiendo al widget de pago...");
      } else {
        console.error("Error al crear transacción:", error);
        toast.error("Error al procesar el pago. Intenta de nuevo.");
      }
    } catch (error) {
      console.error("Error al crear transacción:", error);
      toast.error("Error al procesar el pago. Intenta de nuevo.");
    }
  };

  useEffect(() => {
    if (transactionId && transactionReference) {
      const script = document.createElement("script");
      script.src = "https://checkout.wompi.co/widget.js";
      script.async = true;
      script.onload = () => {
        if (window.WompiWidget) {
          const widget = new window.WompiWidget({
            render: "button",
            publicKey: WOMPI_PUBLIC_KEY,
            currency: "COP",
            amountInCents: totalInCents,
            reference: transactionReference,
            onSuccess: (data: any) => {
              console.log("Pago exitoso:", data);
              toast.success("Pago aprobado. ¡Gracias por tu compra!");
              navigate("/order-confirmation"); // Uso de navigate
            },
            onError: (error: any) => {
              console.error("Error en el pago:", error);
              toast.error("Error al procesar el pago.");
            },
            onClose: () => {
              console.log("Widget cerrado");
              setTransactionId(null);
              setTransactionReference(null);
            },
          });

          widget.open();
        } else {
          console.error("Wompi widget no cargado");
          toast.error("Error al cargar el widget de pago.");
        }
      };
      script.onerror = () => {
        console.error("Error al cargar el script de Wompi");
        toast.error("Error al cargar el widget de pago.");
      };
      document.body.appendChild(script);

      return () => {
        document.body.removeChild(script);
      };
    }
  }, [transactionId, transactionReference, totalInCents, navigate]);

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