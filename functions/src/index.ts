import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as functions from "firebase-functions";
import * as logger from "firebase-functions/logger";
import axios from "axios";

const WOMPI_SANDBOX_URL = "https://sandbox.wompi.co/v1/transactions";
const WOMPI_PRIVATE_KEY = functions.config().wompi?.private_key;

interface TransactionData {
  amountInCents: number;
  customerEmail: string;
  customerData: {
    full_name: string;
    email: string;
    phone_number: string;
    legal_id: string;
    legal_id_type: string;
  };
}

interface WompiTransactionResponse {
  data: {
    id: string;
    redirect_url: string;
  };
}

interface TransactionResponse {
  success: boolean;
  transactionId: string;
  reference: string;
  redirectUrl: string;
}

export const createWompiTransaction = onCall(
  { region: "us-central1" },
  async (request): Promise<TransactionResponse> => {
    // Validar que WOMPI_PRIVATE_KEY esté configurada
    if (!WOMPI_PRIVATE_KEY) {
      logger.error("WOMPI_PRIVATE_KEY no está configurada en las variables de entorno.");
      throw new HttpsError("internal", "Configuración del servidor incompleta.");
    }

    // Validar los datos de entrada
    if (!request.data || typeof request.data !== "object") {
      throw new HttpsError("invalid-argument", "Los datos de la solicitud son inválidos.");
    }

    const { amountInCents, customerEmail, customerData } = request.data as TransactionData;

    if (!amountInCents || typeof amountInCents !== "number") {
      throw new HttpsError("invalid-argument", "amountInCents es requerido y debe ser un número.");
    }
    if (!customerEmail || typeof customerEmail !== "string") {
      throw new HttpsError("invalid-argument", "customerEmail es requerido y debe ser una cadena.");
    }
    if (!customerData || typeof customerData !== "object") {
      throw new HttpsError("invalid-argument", "customerData es requerido y debe ser un objeto.");
    }

    // Asegurarse de que el phone_number tenga el código de país
    const phoneNumberWithCountryCode = customerData.phone_number.startsWith("57")
      ? customerData.phone_number
      : `57${customerData.phone_number}`;

    const transactionData = {
      amount_in_cents: amountInCents,
      currency: "COP",
      customer_email: customerEmail,
      payment_method: {
        type: "CARD", // Cambiado de "MULTIPLE" a "CARD"
        installments: 1,
      },
      reference: `REF_${Date.now()}`,
      customer_data: {
        full_name: customerData.full_name,
        email: customerData.email,
        phone_number: phoneNumberWithCountryCode,
        legal_id: customerData.legal_id,
        legal_id_type: customerData.legal_id_type,
      },
    };

    try {
      const response = await axios.post<WompiTransactionResponse>(
        WOMPI_SANDBOX_URL,
        transactionData,
        {
          headers: {
            Authorization: `Bearer ${WOMPI_PRIVATE_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      return {
        success: true,
        transactionId: response.data.data.id,
        reference: transactionData.reference,
        redirectUrl: response.data.data.redirect_url,
      };
    } catch (error: unknown) {
      logger.error("Error al crear transacción con Wompi:", error);
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.error?.message || error.message;
        const statusCode = error.response?.status || "desconocido";
        logger.error(`Detalles del error de Wompi: Status ${statusCode}, Mensaje: ${errorMessage}`);
        throw new HttpsError(
          "internal",
          `Error al crear transacción con Wompi (Status ${statusCode}): ${errorMessage}`
        );
      }
      const genericError = error instanceof Error ? error.message : "Error desconocido";
      throw new HttpsError("internal", `Error desconocido al crear transacción: ${genericError}`);
    }
  }
);