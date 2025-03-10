import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Auth: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState("");
  const { signUp, signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      if (isSignUp) {
        await signUp(email, password);
      } else {
        await signIn(email, password);
      }
      navigate("/"); // Redirigir al inicio después de autenticarse
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="bg-body text-white p-6">
      <div className="container mx-auto max-w-md">
        <h1 className="text-3xl font-semibold mb-4">{isSignUp ? "Registrarse" : "Iniciar Sesión"}</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1">Correo Electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-[#f90]"
              required
            />
          </div>
          <div>
            <label className="block mb-1">Contraseña</label>
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
            className="w-full bg-[#f90] text-white px-4 py-2 rounded-md hover:bg-[#e68a00]"
          >
            {isSignUp ? "Registrarse" : "Iniciar Sesión"}
          </button>
        </form>
        <p className="mt-4 text-center">
          {isSignUp ? "¿Ya tienes una cuenta?" : "¿No tienes una cuenta?"}{" "}
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-[#f90] hover:underline"
          >
            {isSignUp ? "Inicia Sesión" : "Regístrate"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Auth;