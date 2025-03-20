import { onCall } from "firebase-functions/v2/https"; // Eliminamos HttpsOptions
import { logger } from "firebase-functions/v2";
import axios from "axios";
import * as nodemailer from "nodemailer";
import * as admin from "firebase-admin";
import { TransactionData, TransactionResponse } from "./types";

// Inicializa Firebase Admin
admin.initializeApp();

const WOMPI_PRIVATE_KEY = process.env.WOMPI_PRIVATE_KEY;
const WOMPI_SANDBOX_URL = "https://sandbox.wompi.co/v1/transactions";

// Configuración de SMTP desde las variables de entorno
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = parseInt(process.env.SMTP_PORT || "465", 10);
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;

// Crear un transportador de nodemailer
const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: true, // Usa SSL/TLS para el puerto 465
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
});

interface WompiTransactionResponse {
  data: {
    id: string;
    reference: string;
  };
}

// Función para crear transacciones con Wompi (2nd Gen)
export const createWompiTransaction = onCall(
  { region: "us-central1" },
  async (request): Promise<TransactionResponse> => {
    if (!request.data || typeof request.data !== "object") {
      throw new Error("Los datos de la solicitud son inválidos.");
    }

    const { amountInCents, customerEmail, customerData } = request.data as TransactionData;

    const transactionData = {
      amount_in_cents: amountInCents,
      currency: "COP",
      customer_email: customerEmail,
      payment_method: {
        type: "MULTIPLE",
        installments: 1,
      },
      reference: `REF_${Date.now()}`,
      customer_data: customerData,
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
      };
    } catch (error: unknown) {
      logger.error("Error al crear transacción con Wompi:", error);
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.error || error.message);
      }
      throw new Error((error as Error).message || "Error desconocido");
    }
  }
);

// Nueva función para enviar correos de bienvenida (2nd Gen)
interface SendWelcomeEmailData {
  email: string;
  fullName: string;
}

interface SendWelcomeEmailResponse {
  success: boolean;
  message?: string;
}

export const sendWelcomeEmail = onCall(
  { region: "us-central1" },
  async (request): Promise<SendWelcomeEmailResponse> => {
    if (!request.data || typeof request.data !== "object") {
      throw new Error("Los datos de la solicitud son inválidos.");
    }

    const { email, fullName } = request.data as SendWelcomeEmailData;

    const mailOptions = {
      from: `"Ecommerce PC Parts" <${SMTP_USER}>`,
      to: email,
      subject: "¡Bienvenido a Ecommerce PC Parts!",
      text: `Hola ${fullName},\n\nGracias por registrarte en Ecommerce PC Parts. ¡Esperamos que disfrutes de tu experiencia de compra!\n\nSaludos,\nEl equipo de Ecommerce PC Parts`,
      html: `
        <h1>¡Bienvenido, ${fullName}!</h1>
        <p>Gracias por registrarte en <strong>Ecommerce PC Parts</strong>.</p>
        <p>Esperamos que disfrutes de tu experiencia de compra con nosotros.</p>
        <p>Saludos,<br>El equipo de Ecommerce PC Parts</p>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
      logger.info(`Correo enviado a ${email}`);
      return {
        success: true,
        message: "Correo de bienvenida enviado exitosamente.",
      };
    } catch (error: unknown) {
      logger.error("Error al enviar correo:", error);
      throw new Error((error as Error).message || "Error al enviar el correo de bienvenida.");
    }
  }
);