import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext'; // Usar el hook useCart
import { functions, httpsCallable } from '../firebase';

// Definir el tipo de los datos del cliente
interface CustomerData {
  fullName: string;
  email: string;
  phoneNumber: string;
  legalId: string;
  legalIdType: string;
}

// Definir el tipo de la respuesta de la Cloud Function
interface TransactionResponse {
  success: boolean;
  transactionId: string;
  reference: string;
  redirectUrl: string;
}

const PaymentPage: React.FC = () => {
  const { cartItems, clearCart } = useCart(); // Usar useCart para obtener el contexto tipado
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estado para los datos del cliente
  const [customerData, setCustomerData] = useState<CustomerData>({
    fullName: '',
    email: '',
    phoneNumber: '',
    legalId: '',
    legalIdType: 'CC',
  });

  const [termsAccepted, setTermsAccepted] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string>('CARD');

  // Calcular el total del carrito con IVA
  const subtotal = cartItems.reduce((sum: number, item) => sum + item.price * item.quantity, 0);
  const iva = subtotal * 0.19; // 19% IVA en Colombia
  const totalWithIva = subtotal + iva;

  // Manejar cambios en el formulario
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCustomerData((prev) => ({ ...prev, [name]: value }));
  };

  // Función para manejar el pago
  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!termsAccepted) {
      setError('Debes aceptar los términos y condiciones para continuar.');
      setLoading(false);
      return;
    }

    try {
      // Validar datos del cliente
      if (!customerData.fullName || !customerData.email || !customerData.phoneNumber || !customerData.legalId) {
        throw new Error('Por favor, completa todos los campos requeridos.');
      }

      // Preparar los datos para enviar a la Cloud Function
      const transactionData = {
        amountInCents: Math.round(totalWithIva * 100), // Wompi usa centavos
        customerEmail: customerData.email,
        paymentMethod: paymentMethod,
        customerData: {
          full_name: customerData.fullName,
          email: customerData.email,
          phone_number: customerData.phoneNumber,
          legal_id: customerData.legalId,
          legal_id_type: customerData.legalIdType,
        },
      };

      // Llamar a la Cloud Function usando la SDK de Firebase
      const createWompiTransaction = httpsCallable<unknown, TransactionResponse>(
        functions,
        'createWompiTransaction'
      );
      const result = await createWompiTransaction(transactionData);

      const { success, transactionId, redirectUrl } = result.data;

      if (!success) {
        throw new Error('Error al crear la transacción con Wompi');
      }

      // Guardar el transactionId para verificarlo después
      localStorage.setItem('transactionId', transactionId);

      // Redirigir al usuario al redirectUrl de Wompi para completar el pago
      window.location.href = redirectUrl;
    } catch (err: any) {
      setError(err.message || 'Error al procesar el pago');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Página de Pago</h1>

      {/* Resumen del carrito */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Resumen de tu compra</h2>
        {cartItems.length === 0 ? (
          <p>Tu carrito está vacío.</p>
        ) : (
          <ul className="border p-4 rounded">
            {cartItems.map((item) => (
              <li key={item.id} className="flex justify-between py-2">
                <span>{item.name} (x{item.quantity})</span>
                <span>${(item.price * item.quantity).toLocaleString('es-CO')}</span>
              </li>
            ))}
            <li className="flex justify-between py-2">
              <span>Subtotal:</span>
              <span>${subtotal.toLocaleString('es-CO')}</span>
            </li>
            <li className="flex justify-between py-2">
              <span>IVA (19%):</span>
              <span>${iva.toLocaleString('es-CO')}</span>
            </li>
            <li className="flex justify-between font-bold pt-2 border-t">
              <span>Total:</span>
              <span>${totalWithIva.toLocaleString('es-CO')}</span>
            </li>
          </ul>
        )}
      </div>

      {/* Formulario para datos del cliente */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Datos del cliente</h2>
        <form onSubmit={handlePayment}>
          <div className="mb-4">
            <label className="block mb-1">Nombre completo</label>
            <input
              type="text"
              name="fullName"
              value={customerData.fullName}
              onChange={handleInputChange}
              className="border p-2 w-full rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1">Correo electrónico</label>
            <input
              type="email"
              name="email"
              value={customerData.email}
              onChange={handleInputChange}
              className="border p-2 w-full rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1">Número de teléfono</label>
            <input
              type="tel"
              name="phoneNumber"
              value={customerData.phoneNumber}
              onChange={handleInputChange}
              className="border p-2 w-full rounded"
              placeholder="Ej: 3001234567"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1">Documento de identidad</label>
            <input
              type="text"
              name="legalId"
              value={customerData.legalId}
              onChange={handleInputChange}
              className="border p-2 w-full rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1">Tipo de documento</label>
            <select
              name="legalIdType"
              value={customerData.legalIdType}
              onChange={handleInputChange}
              className="border p-2 w-full rounded"
            >
              <option value="CC">Cédula de Ciudadanía (CC)</option>
              <option value="CE">Cédula de Extranjería (CE)</option>
              <option value="NIT">NIT</option>
              <option value="PP">Pasaporte (PP)</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block mb-1">Método de pago</label>
            <select
              name="paymentMethod"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="border p-2 w-full rounded"
            >
              <option value="CARD">Tarjeta de crédito/débito</option>
              <option value="PSE">PSE</option>
              <option value="NEQUI">Nequi</option>
              <option value="BANCOLOMBIA">Bancolombia</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                required
              />
              <span className="ml-2">
                Acepto los{' '}
                <a href="https://wompi.co/terminos" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                  términos y condiciones
                </a>
              </span>
            </label>
          </div>

          {/* Botones */}
          <div className="flex space-x-4">
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <button
              type="submit"
              disabled={loading || cartItems.length === 0}
              className={`bg-blue-500 text-white px-6 py-2 rounded ${
                loading || cartItems.length === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'
              }`}
            >
              {loading ? 'Procesando...' : 'Pagar ahora'}
            </button>
            <Link to="/cart" className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600">
              Volver al carrito
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentPage;