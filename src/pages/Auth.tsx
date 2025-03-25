import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { GoogleReCaptchaProvider, useGoogleReCaptcha } from "react-google-recaptcha-v3";
import { toast } from "react-toastify";
import { getFunctions, httpsCallable } from "firebase/functions";
import { app } from "../firebase";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";

const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

interface LoginFormData {
  email: string;
  password: string;
  recaptchaToken: string;
}

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { signIn, auth } = useAuth();
  const navigate = useNavigate();
  const { executeRecaptcha } = useGoogleReCaptcha();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!executeRecaptcha) {
      toast.error("Error al cargar reCAPTCHA. Intenta de nuevo.");
      return;
    }

    setLoading(true);
    try {
      const recaptchaToken = await executeRecaptcha("login");
      if (!recaptchaToken) {
        throw new Error("No se pudo obtener el token de reCAPTCHA.");
      }
      console.log("reCAPTCHA Token:", recaptchaToken);

      const functions = getFunctions(app, "us-central1");
      const loginUser = httpsCallable<LoginFormData, { success: boolean; message?: string }>(
        functions,
        "loginUserWithRecaptcha"
      );

      const result = await loginUser({
        email,
        password,
        recaptchaToken,
      });

      if (result.data.success) {
        await signIn(email, password);
        toast.success("Inicio de sesión exitoso");
        navigate("/");
      } else {
        throw new Error(result.data.message || "Error al iniciar sesión");
      }
    } catch (err: any) {
      const errorMessage = err.message || "Error al iniciar sesión";
      if (errorMessage.includes("reCAPTCHA")) {
        setError("Error al verificar reCAPTCHA. Intenta de nuevo.");
        toast.error("Error al verificar reCAPTCHA. Intenta de nuevo.");
      } else if (errorMessage.includes("auth/")) {
        setError("Correo o contraseña incorrectos.");
        toast.error("Correo o contraseña incorrectos.");
      } else {
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      if (user) {
        toast.success("Inicio de sesión con Google exitoso");
        navigate("/");
      } else {
        throw new Error("No se pudo obtener el usuario de Google.");
      }
    } catch (err: any) {
      const errorMessage = err.message || "Error al iniciar sesión con Google";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-body text-white p-6">
      <div className="container mx-auto max-w-md">
        <h1 className="text-3xl font-semibold mb-4" style={{ color: "var(--text-color)" }}>
          Iniciar Sesión
        </h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1" style={{ color: "var(--text-color)" }}>
              Correo Electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-[#f90]"
              required
            />
          </div>
          <div>
            <label className="block mb-1" style={{ color: "var(--text-color)" }}>
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-[#f90]"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#f90] text-white px-4 py-2 rounded-md hover:bg-[#e68a00] disabled:opacity-50"
          >
            {loading ? "Iniciando..." : "Iniciar Sesión"}
          </button>
        </form>
        <div className="mt-4">
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.032,2,12.545,2C6.735,2,2,6.735,2,12.545c0,5.81,4.735,10.545,10.545,10.545c5.81,0,10.545-4.735,10.545-10.545c0-0.641-0.057-1.265-0.163-1.871H12.545z"
              />
            </svg>
            {loading ? "Iniciando..." : "Iniciar Sesión con Google"}
          </button>
        </div>
        <p className="mt-4 text-center">
          ¿No tienes una cuenta?{" "}
          <Link to="/auth/register" className="text-[#f90] hover:underline">
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  );
};

const Auth: React.FC = () => {
  return (
    <GoogleReCaptchaProvider reCaptchaKey={RECAPTCHA_SITE_KEY}>
      <LoginForm />
    </GoogleReCaptchaProvider>
  );
};

export default Auth;