import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";
import axios, { isAxiosError } from "axios";
import { onRequest } from "firebase-functions/v2/https";
import { Request, Response } from "express";
import { config } from "firebase-functions";
import express from "express";

// Initialize the express app for Cloud Functions
const app = express();

// Log to verify module loading
logger.info("Initializing Cloud Functions module");

// Load Firebase Functions configuration
const functionsConfig = config();
logger.info("Firebase Functions configuration:", functionsConfig);

// Get environment variables
const getEnvVar = (key: string): string => {
  const [namespace, field] = key.split(".");
  const value = functionsConfig[namespace]?.[field];
  if (!value) {
    logger.error(`Required environment variable not configured: ${key}`);
    throw new Error(`Required environment variable not configured: ${key}`);
  }
  return value;
};

const envVars = {
  WOMPI_PRIVATE_KEY: getEnvVar("wompi.private_key"),
  RECAPTCHA_SECRET: getEnvVar("recaptcha.secret_key"),
  APP_ENVIRONMENT: getEnvVar("app.environment"),
  SMTP_CONFIG: {
    host: getEnvVar("smtp.host"),
    port: getEnvVar("smtp.port"),
    user: getEnvVar("smtp.user"),
    pass: getEnvVar("smtp.pass"),
  }
};

// Initialize Firebase Admin
try {
  admin.initializeApp();
  logger.info("Firebase Admin initialized successfully");
} catch (error) {
  logger.error("Error initializing Firebase Admin:", error);
  throw error;
}

// Error details interface
interface ErrorDetails {
  [key: string]: unknown;
}

// Standard error response function
const sendErrorResponse = (res: Response, status: number, message: string, details?: ErrorDetails) => {
  logger.error(message, details);
  res.status(status).json({ error: message, details });
};

// CORS middleware
const handleCors = (req: Request, res: Response, next: () => void) => {
  const allowedOrigins = ["http://localhost:5173", "https://pchub.net"];
  const origin = req.headers.origin || "";
  
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  } else if (envVars.APP_ENVIRONMENT === "development") {
    // Allow all origins in development
    res.setHeader("Access-Control-Allow-Origin", "*");
  } else {
    sendErrorResponse(res, 403, "Origin not allowed", { origin });
    return;
  }

  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  next();
};

// Transaction data interface
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

// Create Wompi Transaction
export const createWompiTransaction = onRequest(
  { 
    region: "us-central1", 
    timeoutSeconds: 540 // 9 minutos (máximo permitido)
  },
  async (req: Request, res: Response) => {
    handleCors(req, res, async () => {
      logger.info("Starting createWompiTransaction function");

      if (req.method !== "POST") {
        sendErrorResponse(res, 405, "Method not allowed");
        return;
      }

      if (!req.body?.data) {
        sendErrorResponse(res, 400, "Invalid request body", { body: req.body });
        return;
      }

      const { amountInCents, customerEmail, paymentMethod, customerData } = req.body.data as TransactionData;

      if (!amountInCents || !customerEmail || !paymentMethod || !customerData) {
        sendErrorResponse(res, 400, "Missing required data", { data: req.body.data });
        return;
      }

      if (!Number.isInteger(amountInCents) || amountInCents <= 0) {
        sendErrorResponse(res, 400, "amountInCents must be a positive integer", { amountInCents });
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(customerEmail)) {
        sendErrorResponse(res, 400, "Invalid customerEmail format", { customerEmail });
        return;
      }

      try {
        const reference = `txn_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        const response = await axios.post<WompiTransactionResponse>(
          "https://production.wompi.co/v1/transactions",
          {
            amount_in_cents: amountInCents,
            currency: "COP",
            customer_email: customerEmail,
            payment_method: {
              type: paymentMethod,
              installments: 1,
            },
            reference: reference,
            redirect_url: "https://pchub.net/success",
            customer_data: customerData,
          },
          {
            headers: {
              Authorization: `Bearer ${envVars.WOMPI_PRIVATE_KEY}`,
            },
          }
        );

        const transaction = response.data.data;
        res.status(200).json({
          data: {
            success: true,
            transactionId: transaction.id,
            reference: reference,
            redirectUrl: transaction.redirect_url,
          },
        });
      } catch (error: unknown) {
        if (isAxiosError(error)) {
          sendErrorResponse(res, 500, "Error creating Wompi transaction", {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
          });
        } else {
          sendErrorResponse(res, 500, "Unexpected error creating Wompi transaction", { 
            error: error instanceof Error ? error.message : String(error) 
          });
        }
      }
    });
  }
);

// Check Wompi Transaction Status
export const checkWompiTransactionStatus = onRequest(
  { 
    region: "us-central1", 
    timeoutSeconds: 540 // 9 minutos (máximo permitido)
  },
  async (req: Request, res: Response) => {
    handleCors(req, res, async () => {
      logger.info("Starting checkWompiTransactionStatus function");

      if (req.method !== "POST") {
        sendErrorResponse(res, 405, "Method not allowed");
        return;
      }

      if (!req.body?.data) {
        sendErrorResponse(res, 400, "Invalid request body", { body: req.body });
        return;
      }

      const { transactionId } = req.body.data;

      if (!transactionId) {
        sendErrorResponse(res, 400, "Missing transaction ID");
        return;
      }

      try {
        const response = await axios.get(
          `https://production.wompi.co/v1/transactions/${transactionId}`,
          {
            headers: {
              Authorization: `Bearer ${envVars.WOMPI_PRIVATE_KEY}`,
            },
          }
        );

        const transaction = response.data.data;
        res.status(200).json({
          data: {
            status: transaction.status,
            message: transaction.status_message || "Transaction status verified",
          },
        });
      } catch (error: unknown) {
        if (isAxiosError(error)) {
          sendErrorResponse(res, 500, "Error verifying Wompi transaction", {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
          });
        } else {
          sendErrorResponse(res, 500, "Unexpected error verifying Wompi transaction", { 
            error: error instanceof Error ? error.message : String(error) 
          });
        }
      }
    });
  }
);

// reCAPTCHA interfaces
interface RecaptchaVerificationData {
  recaptchaToken: string;
}

interface RecaptchaVerificationResult {
  success: boolean;
  score: number;
  message?: string;
}

const RECAPTCHA_THRESHOLD = 0.5;

const verifyRecaptchaToken = async (recaptchaToken: string): Promise<RecaptchaVerificationResult> => {
  try {
    const response = await axios.post(
      "https://www.google.com/recaptcha/api/siteverify",
      null,
      {
        params: {
          secret: envVars.RECAPTCHA_SECRET,
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
      logger.error("reCAPTCHA verification error:", result["error-codes"]);
      return {
        success: false,
        score: 0,
        message: "reCAPTCHA verification failed",
      };
    }
  } catch (error: unknown) {
    if (isAxiosError(error)) {
      logger.error("reCAPTCHA verification error:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      return { success: false, score: 0, message: "Error verifying reCAPTCHA" };
    } else {
      logger.error("Unexpected reCAPTCHA verification error:", error);
      return { success: false, score: 0, message: "Unexpected error verifying reCAPTCHA" };
    }
  }
};

// Verify reCAPTCHA
export const verifyRecaptcha = onRequest(
  { 
    region: "us-central1", 
    timeoutSeconds: 540 // 9 minutos (máximo permitido)
  },
  async (req: Request, res: Response) => {
    handleCors(req, res, async () => {
      logger.info("Starting verifyRecaptcha function");

      if (req.method !== "POST") {
        sendErrorResponse(res, 405, "Method not allowed");
        return;
      }

      if (!req.body?.data) {
        sendErrorResponse(res, 400, "Invalid request body", { body: req.body });
        return;
      }

      const { recaptchaToken } = req.body.data as RecaptchaVerificationData;

      if (!recaptchaToken) {
        sendErrorResponse(res, 400, "Missing reCAPTCHA token");
        return;
      }

      const result = await verifyRecaptchaToken(recaptchaToken);
      res.status(200).json({ data: result });
    });
  }
);

// Register User with reCAPTCHA
export const registerUserWithRecaptcha = onRequest(
  { 
    region: "us-central1", 
    timeoutSeconds: 540 // 9 minutos (máximo permitido)
  },
  async (req: Request, res: Response) => {
    handleCors(req, res, async () => {
      logger.info("Starting registerUserWithRecaptcha function");

      if (req.method !== "POST") {
        sendErrorResponse(res, 405, "Method not allowed");
        return;
      }

      if (!req.body?.data) {
        sendErrorResponse(res, 400, "Invalid request body", { body: req.body });
        return;
      }

      const { email, password, recaptchaToken } = req.body.data;

      if (!email || !password || !recaptchaToken) {
        sendErrorResponse(res, 400, "Missing required data");
        return;
      }

      const verifyResult = await verifyRecaptchaToken(recaptchaToken);
      if (!verifyResult.success || verifyResult.score < RECAPTCHA_THRESHOLD) {
        sendErrorResponse(res, 403, "reCAPTCHA verification failed");
        return;
      }

      try {
        const userRecord = await admin.auth().createUser({ email, password });
        logger.info(`User registered: ${userRecord.uid}`);
        res.status(200).json({ data: { success: true, uid: userRecord.uid } });
      } catch (error) {
        const typedError = error as Error;
        if (typedError.message.includes("auth/email-already-in-use")) {
          sendErrorResponse(res, 400, "Email already registered");
        } else {
          sendErrorResponse(res, 500, "Error registering user", { error: typedError.message });
        }
      }
    });
  }
);

// Login User with reCAPTCHA
export const loginUserWithRecaptcha = onRequest(
  { 
    region: "us-central1", 
    timeoutSeconds: 540 // 9 minutos (máximo permitido)
  },
  async (req: Request, res: Response) => {
    handleCors(req, res, async () => {
      logger.info("Starting loginUserWithRecaptcha function");

      if (req.method !== "POST") {
        sendErrorResponse(res, 405, "Method not allowed");
        return;
      }

      if (!req.body?.data) {
        sendErrorResponse(res, 400, "Invalid request body", { body: req.body });
        return;
      }

      const { idToken, recaptchaToken } = req.body.data;

      if (!idToken || !recaptchaToken) {
        sendErrorResponse(res, 400, "Missing required data (idToken and recaptchaToken)");
        return;
      }

      const verifyResult = await verifyRecaptchaToken(recaptchaToken);
      if (!verifyResult.success || verifyResult.score < RECAPTCHA_THRESHOLD) {
        sendErrorResponse(res, 403, "reCAPTCHA verification failed");
        return;
      }

      try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        logger.info(`User authenticated: ${decodedToken.uid}`);
        res.status(200).json({ data: { success: true, uid: decodedToken.uid } });
      } catch (error) {
        const typedError = error as Error;
        sendErrorResponse(res, 401, "Error authenticating user", { error: typedError.message });
      }
    });
  }
);

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).send('OK');
});

// Export the express app for Cloud Functions
export const api = onRequest(
  { 
    region: "us-central1", 
    timeoutSeconds: 540 // 9 minutos (máximo permitido)
  }, 
  app
);