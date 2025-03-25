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

interface SendWelcomeEmailData {
  email: string;
  fullName: string;
}

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

// Función callable para verificar reCAPTCHA (si la necesitas desde el frontend)
export const verifyRecaptcha = onCall(
  { region: "us-central1" },
  async (request): Promise<{ success: boolean; score: number; message?: string }> => {
    const { recaptchaToken } = request.data as RecaptchaVerificationData;

    if (!recaptchaToken) {
      throw new HttpsError("invalid-argument", "Falta el token de reCAPTCHA");
    }

    return await verifyRecaptchaToken(recaptchaToken);
  }
);

export const registerUserWithRecaptcha = onCall(
  { region: "us-central1" },
  async (request): Promise<{ success: boolean; message?: string }> => {
    const { email, password, recaptchaToken } = request.data as RegisterFormData;

    if (!email || !password || !recaptchaToken) {
      throw new HttpsError("invalid-argument", "Faltan datos requeridos");
    }

    // Usar la función auxiliar para verificar reCAPTCHA
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
  { region: "us-central1" },
  async (request): Promise<{ success: boolean; message?: string }> => {
    const { email, password, recaptchaToken } = request.data as LoginFormData;

    if (!email || !password || !recaptchaToken) {
      throw new HttpsError("invalid-argument", "Faltan datos requeridos");
    }

    // Usar la función auxiliar para verificar reCAPTCHA
    const verifyResult = await verifyRecaptchaToken(recaptchaToken);
    if (!verifyResult.success || verifyResult.score < 0.5) {
      throw new HttpsError("permission-denied", "Verificación de reCAPTCHA fallida.");
    }

    return { success: true };
  }
);

export const sendWelcomeEmail = onCall(
  { region: "us-central1" },
  async (request): Promise<{ success: boolean; message?: string }> => {
    const { email, fullName } = request.data as SendWelcomeEmailData;

    if (!email || !fullName) {
      throw new HttpsError("invalid-argument", "Faltan datos requeridos");
    }

    logger.info(`Enviando correo de bienvenida a ${email} (${fullName})`);
    return {
      success: true,
      message: `Correo de bienvenida enviado a ${email}`,
    };
  }
);

const WOMPI_SANDBOX_URL = "https://sandbox.wompi.co/v1/transactions";

export const createWompiTransaction = onCall(
  { region: "us-central1" },
  async (request): Promise<TransactionResponse> => {
    const WOMPI_PRIVATE_KEY = process.env.WOMPI_PRIVATE_KEY;

    if (!WOMPI_PRIVATE_KEY) {
      logger.error("WOMPI_PRIVATE_KEY no está configurada.");
      throw new HttpsError("internal", "Configuración del servidor incompleta.");
    }

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

    const phoneNumberWithCountryCode = customerData.phone_number.startsWith("57")
      ? customerData.phone_number
      : `57${customerData.phone_number}`;

    const transactionData = {
      amount_in_cents: amountInCents,
      currency: "COP",
      customer_email: customerEmail,
      payment_method: {
        type: "CARD",
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