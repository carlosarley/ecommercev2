import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";
import axios from "axios";
import { onCall, HttpsError } from "firebase-functions/v2/https";

admin.initializeApp();

interface RecaptchaVerificationData {
  recaptchaToken: string;
}

interface RegisterFormData {
  email: string;
  password: string;
  recaptchaToken: string;
}

interface LoginFormData {
  email: string;
  password: string;
  recaptchaToken: string;
}

interface TransactionData {
  amountInCents: number;
  customerEmail: string;
  paymentMethod: string;
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

// Función auxiliar para verificar reCAPTCHA
const verifyRecaptchaToken = async (recaptchaToken: string): Promise<{ success: boolean; score: number; message?: string }> => {
  try {
    const response = await axios.post(
      "https://www.google.com/recaptcha/api/siteverify",
      null,
      {
        params: {
          secret: process.env.RECAPTCHA_SECRET,
          response: recaptchaToken,
        },
      }
    );

    const result = response.data;
    if (result.success) {
      return {
        success: true,
        score: result.score,
      };
    } else {
      logger.error("Error al verificar reCAPTCHA:", result["error-codes"]);
      return {
        success: false,
        score: 0,
        message: "Fallo en la verificación de reCAPTCHA",
      };
    }
  } catch (error) {
    logger.error("Error al verificar reCAPTCHA:", error);
    throw new HttpsError("internal", "Error al verificar reCAPTCHA");
  }
};

// Función callable para verificar reCAPTCHA
export const verifyRecaptcha = onCall(
  { region: "us-central1", cors: ["http://localhost:5173", "https://tu-dominio.com"] },
  async (request): Promise<{ success: boolean; score: number; message?: string }> => {
    const { recaptchaToken } = request.data as RecaptchaVerificationData;

    if (!recaptchaToken) {
      throw new HttpsError("invalid-argument", "Falta el token de reCAPTCHA");
    }

    return await verifyRecaptchaToken(recaptchaToken);
  }
);

export const registerUserWithRecaptcha = onCall(
  { region: "us-central1", cors: ["http://localhost:5173", "https://tu-dominio.com"] },
  async (request): Promise<{ success: boolean; message?: string }> => {
    const { email, password, recaptchaToken } = request.data as RegisterFormData;

    if (!email || !password || !recaptchaToken) {
      throw new HttpsError("invalid-argument", "Faltan datos requeridos");
    }

    const verifyResult = await verifyRecaptchaToken(recaptchaToken);
    if (!verifyResult.success || verifyResult.score < 0.5) {
      throw new HttpsError("permission-denied", "Verificación de reCAPTCHA fallida.");
    }

    try {
      const userRecord = await admin.auth().createUser({ email, password });
      logger.info(`Usuario registrado: ${userRecord.uid}`);
      return { success: true };
    } catch (error) {
      logger.error("Error al registrar usuario:", error);
      throw new HttpsError("internal", "Error al registrar usuario");
    }
  }
);

export const loginUserWithRecaptcha = onCall(
  { region: "us-central1", cors: ["http://localhost:5173", "https://tu-dominio.com"] },
  async (request): Promise<{ success: boolean; message?: string }> => {
    const { email, password, recaptchaToken } = request.data as LoginFormData;

    if (!email || !password || !recaptchaToken) {
      throw new HttpsError("invalid-argument", "Faltan datos requeridos");
    }

    const verifyResult = await verifyRecaptchaToken(recaptchaToken);
    if (!verifyResult.success || verifyResult.score < 0.5) {
      throw new HttpsError("permission-denied", "Verificación de reCAPTCHA fallida.");
    }

    return { success: true };
  }
);

export const createWompiTransaction = onCall(
  { region: "us-central1", cors: ["http://localhost:5173", "https://tu-dominio.com"] },
  async (request): Promise<TransactionResponse> => {
    const { amountInCents, customerEmail, paymentMethod, customerData } = request.data as TransactionData;

    if (!amountInCents || !customerEmail || !paymentMethod || !customerData) {
      throw new HttpsError("invalid-argument", "Faltan datos requeridos");
    }

    try {
      const reference = `txn_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const response = await axios.post<WompiTransactionResponse>(
        "https://sandbox.wompi.co/v1/transactions",
        {
          amount_in_cents: amountInCents,
          currency: "COP",
          customer_email: customerEmail,
          payment_method: {
            type: paymentMethod,
            installments: 1,
          },
          reference: reference,
          redirect_url: "http://localhost:5173/success",
          customer_data: customerData,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.WOMPI_PRIVATE_KEY}`,
          },
        }
      );

      const transaction = response.data.data;
      return {
        success: true,
        transactionId: transaction.id,
        reference: reference,
        redirectUrl: transaction.redirect_url,
      };
    } catch (error) {
      logger.error("Error al crear transacción con Wompi:", error);
      throw new HttpsError("internal", "Error al crear transacción con Wompi");
    }
  }
);

export const checkWompiTransactionStatus = onCall(
  { region: "us-central1", cors: ["http://localhost:5173", "https://tu-dominio.com"] },
  async (request): Promise<{ status: string; message: string }> => {
    const { transactionId } = request.data;

    if (!transactionId) {
      throw new HttpsError("invalid-argument", "Falta el ID de la transacción");
    }

    try {
      const response = await axios.get(
        `https://sandbox.wompi.co/v1/transactions/${transactionId}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.WOMPI_PRIVATE_KEY}`,
          },
        }
      );

      const transaction = response.data.data;
      return {
        status: transaction.status,
        message: transaction.status_message || "Estado de la transacción verificado",
      };
    } catch (error) {
      logger.error("Error al verificar transacción con Wompi:", error);
      throw new HttpsError("internal", "Error al verificar transacción con Wompi");
    }
  }
);