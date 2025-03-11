import React, { useCallback, useState } from "react";
import { GoogleReCaptchaProvider, useGoogleReCaptcha } from "react-google-recaptcha-v3";
import { toast } from "react-toastify";
import { getFunctions, httpsCallable } from "firebase/functions";
import { useNavigate } from "react-router-dom";

const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

interface RegisterFormData {
  email: string;
  password: string;
  recaptchaToken: string;
}

interface SendWelcomeEmailData {
  email: string;
  fullName: string;
}

const RegisterForm: React.FC = () => {
  const { executeRecaptcha } = useGoogleReCaptcha();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!executeRecaptcha) {
      toast.error("Error al cargar reCaptcha. Intenta de nuevo.");
      return;
    }

    setLoading(true);
    try {
      // Obtener el token de reCaptcha
      const recaptchaToken = await executeRecaptcha("register");
      console.log("reCaptcha Token:", recaptchaToken);

      // Llamar a una Cloud Function para manejar el registro y verificar el token
      const functions = getFunctions();
      const registerUser = httpsCallable<RegisterFormData, { success: boolean; message?: string }>(
        functions,
        "registerUserWithRecaptcha"
      );

      const result = await registerUser({
        email,
        password,
        recaptchaToken,
      });

      if (result.data.success) {
        toast.success("Registro exitoso. ¡Bienvenido!");

        // Llamar a sendWelcomeEmail después del registro exitoso
        const sendWelcomeEmail = httpsCallable<SendWelcomeEmailData, { success: boolean; message?: string }>(
          functions,
          "sendWelcomeEmail"
        );

        const emailResult = await sendWelcomeEmail({
          email,
          fullName,
        });

        if (emailResult.data.success) {
          console.log("Correo de bienvenida enviado:", emailResult.data.message);
          toast.info("Se ha enviado un correo de bienvenida.");
          navigate("/auth"); // Redirige a la página de login después del registro
        } else {
          console.error("Error al enviar correo:", emailResult.data.message);
          toast.error("Registro exitoso, pero falló el envío del correo.");
        }
      } else {
        toast.error(result.data.message || "Error al registrarse.");
      }
    } catch (error) {
      console.error("Error en el registro:", error);
      toast.error("Error al registrarse. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold text-center">Registro</h1>
      <div>
        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
          Nombre Completo
        </label>
        <input
          type="text"
          id="fullName"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500"
          required
        />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500"
          required
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Contraseña
        </label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500"
          required
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
      >
        {loading ? "Registrando..." : "Registrarse"}
      </button>
      <p className="text-center text-sm text-gray-600">
        ¿Ya tienes cuenta?{" "}
        <a href="/auth" className="text-indigo-600 hover:underline">
          Inicia sesión
        </a>
      </p>
    </form>
  );
};

// Envuelve el componente en GoogleReCaptchaProvider
const RegisterPage: React.FC = () => {
  return (
    <GoogleReCaptchaProvider reCaptchaKey={RECAPTCHA_SITE_KEY}>
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <RegisterForm />
      </div>
    </GoogleReCaptchaProvider>
  );
};

export default RegisterPage;