import { useState } from "react";
import { GoogleReCaptchaProvider, useGoogleReCaptcha } from "react-google-recaptcha-v3";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { useAuth } from "../context/AuthContext";

const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

const RegisterForm: React.FC = () => {
  const { executeRecaptcha } = useGoogleReCaptcha();
  const navigate = useNavigate();
  const { auth } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!executeRecaptcha) {
      toast.error("Error al cargar reCAPTCHA. Intenta de nuevo.");
      return;
    }

    setLoading(true);
    try {
      const recaptchaToken = await executeRecaptcha("register");
      if (!recaptchaToken) {
        throw new Error("No se pudo obtener el token de reCAPTCHA.");
      }
      console.log("reCAPTCHA Token:", recaptchaToken);

      // Hacer la solicitud a registerUserWithRecaptcha usando fetch
      const registerResponse = await fetch(
        "https://us-central1-ecommerce-pc-parts.cloudfunctions.net/registerUserWithRecaptcha",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            data: { email, password, recaptchaToken },
          }),
        }
      );

      if (!registerResponse.ok) {
        const errorData = await registerResponse.json();
        throw new Error(errorData.error || "Error al registrarse");
      }

      const registerResult = await registerResponse.json();
      const { success, message } = registerResult.data;

      if (success) {
        toast.success("Registro exitoso. ¡Bienvenido!");

        // Hacer la solicitud a sendWelcomeEmail usando fetch
        const emailResponse = await fetch(
          "https://us-central1-ecommerce-pc-parts.cloudfunctions.net/sendWelcomeEmail",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              data: { email, fullName },
            }),
          }
        );

        if (!emailResponse.ok) {
          const emailErrorData = await emailResponse.json();
          console.error("Error al enviar correo:", emailErrorData.error);
          toast.error("Registro exitoso, pero falló el envío del correo.");
        } else {
          const emailResult = await emailResponse.json();
          const { success: emailSuccess, message: emailMessage } = emailResult.data;
          if (emailSuccess) {
            console.log("Correo de bienvenida enviado:", emailMessage);
            toast.info("Se ha enviado un correo de bienvenida.");
          } else {
            console.error("Error al enviar correo:", emailMessage);
            toast.error("Registro exitoso, pero falló el envío del correo.");
          }
        }

        navigate("/auth");
      } else {
        throw new Error(message || "Error al registrarse");
      }
    } catch (err: any) {
      const errorMessage = err.message || "Error al registrarse";
      if (errorMessage.includes("reCAPTCHA")) {
        toast.error("Error al verificar reCAPTCHA. Intenta de nuevo.");
      } else if (errorMessage.includes("auth/email-already-in-use")) {
        toast.error("El correo ya está registrado. Intenta iniciar sesión.");
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      if (user) {
        // Hacer la solicitud a sendWelcomeEmail usando fetch
        const emailResponse = await fetch(
          "https://us-central1-ecommerce-pc-parts.cloudfunctions.net/sendWelcomeEmail",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              data: { email: user.email || "", fullName: user.displayName || "Usuario" },
            }),
          }
        );

        if (!emailResponse.ok) {
          const emailErrorData = await emailResponse.json();
          console.error("Error al enviar correo:", emailErrorData.error);
          toast.error("Registro exitoso, pero falló el envío del correo.");
        } else {
          const emailResult = await emailResponse.json();
          const { success: emailSuccess, message: emailMessage } = emailResult.data;
          if (emailSuccess) {
            console.log("Correo de bienvenida enviado:", emailMessage);
            toast.info("Se ha enviado un correo de bienvenida.");
          } else {
            console.error("Error al enviar correo:", emailMessage);
            toast.error("Registro exitoso, pero falló el envío del correo.");
          }
        }

        toast.success("Registro con Google exitoso");
        navigate("/");
      } else {
        throw new Error("No se pudo obtener el usuario de Google.");
      }
    } catch (err: any) {
      const errorMessage = err.message || "Error al registrarse con Google";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 max-w-md mx-auto p-6 rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold text-center" style={{ color: "var(--text-color)" }}>
        Registro
      </h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium" style={{ color: "var(--text-color)" }}>
            Nombre Completo
          </label>
          <input
            type="text"
            id="fullName"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 focus:ring-[#f90] focus:border-[#f90] bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            required
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium" style={{ color: "var(--text-color)" }}>
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 focus:ring-[#f90] focus:border-[#f90] bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            required
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium" style={{ color: "var(--text-color)" }}>
            Contraseña
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 focus:ring-[#f90] focus:border-[#f90] bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[var(--button-bg)] text-[var(--button-text)] py-2 px-4 rounded-md hover:bg-[var (--button-bg-hover)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#f90] disabled:bg-gray-400 dark:disabled:bg-gray-600"
        >
          {loading ? "Registrando..." : "Registrarse"}
        </button>
      </form>
      <div className="mt-4">
        <button
          onClick={handleGoogleSignUp}
          disabled={loading}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.032,2,12.545,2C6.735,2,2,6.735,2,12.545c0,5.81,4.735,10.545,10.545,10.545c5.81,0,10.545-4.735,10.545-10.545c0-0.641-0.057-1.265-0.163-1.871H12.545z"
            />
          </svg>
          {loading ? "Registrando..." : "Registrarse con Google"}
        </button>
      </div>
      <p className="text-center text-sm" style={{ color: "var(--text-color)" }}>
        ¿Ya tienes cuenta?{" "}
        <a href="/auth" className="text-[var(--button-bg)] hover:underline">
          Inicia sesión
        </a>
      </p>
    </div>
  );
};

const RegisterPage: React.FC = () => {
  return (
    <GoogleReCaptchaProvider reCaptchaKey={RECAPTCHA_SITE_KEY}>
      <div className="min-h-screen bg-[var(--background-color)] flex items-center justify-center">
        <RegisterForm />
      </div>
    </GoogleReCaptchaProvider>
  );
};

export default RegisterPage;