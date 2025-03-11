import * as functions from "firebase-functions";
import axios from "axios";
import * as nodemailer from "nodemailer";
import { TransactionData, TransactionResponse } from "./types";

const WOMPI_PRIVATE_KEY = functions.config().wompi.private_key;
const WOMPI_SANDBOX_URL = "https://sandbox.wompi.co/v1/transactions";

// Configuración de SMTP desde las variables de entorno
const SMTP_HOST = functions.config().smtp.host;
const SMTP_PORT = parseInt(functions.config().smtp.port, 10);
const SMTP_USER = functions.config().smtp.user;
const SMTP_PASS = functions.config().smtp.pass;

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

// Función existente para Wompi
exports.createWompiTransaction = functions.https.onCall(
  async (request): Promise<TransactionResponse> => {
    if (!request.data || typeof request.data !== "object") {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Los datos de la solicitud son inválidos."
      );
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
      functions.logger.error("Error al crear transacción con Wompi:", error);
      if (axios.isAxiosError(error)) {
        throw new functions.https.HttpsError(
          "internal",
          error.response?.data?.error || error.message
        );
      }
      throw new functions.https.HttpsError(
        "internal",
        (error as Error).message || "Error desconocido"
      );
    }
  }
);

// Nueva función para enviar correos de bienvenida
interface SendWelcomeEmailData {
  email: string;
  fullName: string;
}

interface SendWelcomeEmailResponse {
  success: boolean;
  message?: string;
}

exports.sendWelcomeEmail = functions.https.onCall(
  async (request): Promise<SendWelcomeEmailResponse> => {
    if (!request.data || typeof request.data !== "object") {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Los datos de la solicitud son inválidos."
      );
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
      functions.logger.info(`Correo enviado a ${email}`);
      return {
        success: true,
        message: "Correo de bienvenida enviado exitosamente.",
      };
    } catch (error: unknown) {
      functions.logger.error("Error al enviar correo:", error);
      throw new functions.https.HttpsError(
        "internal",
        (error as Error).message || "Error al enviar el correo de bienvenida."
      );
    }
  }
);