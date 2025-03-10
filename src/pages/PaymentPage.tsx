import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios, { AxiosError } from "axios";
import { toast } from "react-toastify";
import { useCart } from "../context/CartContext";

// Obtener variables de entorno
const WOMPI_PUBLIC_KEY = import.meta.env.VITE_WOMPI_PUBLIC_KEY;
const WOMPI_PRIVATE_KEY = import.meta.env.VITE_WOMPI_PRIVATE_KEY;

interface TransactionResponse {
  id: string;
  status: string;
  payment_method: {
    type: string;
    async_payment_url?: string;
  };
}

const PaymentPage: React.FC = () => {
  const { cartItems } = useCart();
  const { state } = useLocation();
  const { total = 0 } = state || {};
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const navigate = useNavigate();

  const totalInCents = Math.round(total * 100);

  const handleCreateTransaction = async () => {
    if (cartItems.length === 0) {
      toast.error("El carrito está vacío. Agrega productos antes de pagar.");
      return;
    }

    const transactionData = {
      amount_in_cents: totalInCents,
      currency: "COP",
      customer_email: "cliente@example.com", // Reemplaza con email del usuario si tienes autenticación
      payment_method_type: "MULTIPLE", // Permite elegir entre PSE, tarjeta, etc.
      payment_method: {
        installments: 1, // Número de cuotas (1 para pago único)
      },
      reference: `REF_${Date.now()}`, // Referencia única para la transacción
      customer_data: {
        full_name: "Cliente Ejemplo", // Personaliza con datos del usuario si los tienes
        email: "cliente@example.com",
        phone_number: "1234567890",
        legal_id: "123456789", // Documento del cliente
        legal_id_type: "CC",
      },
    };

    try {
      const response = await axios.post<{ data: TransactionResponse }>(
        "https://api.wompi.co/v1/transactions",
        transactionData,
        {
          headers: {
            Authorization: `Bearer ${WOMPI_PRIVATE_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );
      const transaction = response.data.data;
      setTransactionId(transaction.id);
      toast.success("Transacción creada. Redirigiendo al widget de pago...");
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error("Error al crear transacción:", {
        message: axiosError.message,
        status: axiosError.response?.status,
        response: axiosError.response?.data,
      });
      toast.error("Error al procesar el pago. Intenta de nuevo.");
    }
  };

  // Efecto para cargar el widget después de obtener el transactionId
  useEffect(() => {
    if (transactionId) {
      const script = document.createElement("script");
      script.src = "https://checkout.wompi.co/widget.js";
      script.async = true;
      script.onload = () => {
        if (window.Wompi) {
          window.Wompi.renderButton({
            publicKey: WOMPI_PUBLIC_KEY, // Clave pública de prueba
            reference: `REF_${transactionId}`, // Usa el transactionId como referencia
            amountInCents: totalInCents,
            currency: "COP",
            onSuccess: (data: any) => {
              console.log("Pago exitoso:", data);
              toast.success("Pago aprobado. ¡Gracias por tu compra!");
              navigate("/order-confirmation");
            },
            onError: (error: any) => {
              console.error("Error en el pago:", error);
              toast.error("Error al procesar el pago.");
            },
            onClose: () => {
              console.log("Widget cerrado");
              setTransactionId(null); // Resetear para nueva transacción
            },
          });
        } else {
          console.error("Wompi widget no cargado");
          toast.error("Error al cargar el widget de pago.");
        }
      };
      document.body.appendChild(script);

      return () => {
        document.body.removeChild(script);
      };
    }
  }, [transactionId, totalInCents, navigate]);

  return (
    <div className="container mx-auto p-6 bg-menu text-white min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Pago con Wompi</h1>
      <div className="space-y-4">
        <p className="text-lg">Total a pagar: ${(total / 100).toFixed(2)} COP</p>
        <button
          onClick={handleCreateTransaction}
          className="bg-[#f90] text-white px-4 py-2 rounded hover:bg-[#e68a00]"
        >
          Pagar con Wompi
        </button>
        {transactionId && (
          <div id="wompi-button-container" style={{ marginTop: "20px" }}></div>
        )}
      </div>
    </div>
  );
};

export default PaymentPage;