import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import SHA256 from 'crypto-js/sha256';

// Definir el tipo de los datos del cliente
interface CustomerData {
  fullName: string;
  email: string;
  phoneNumber: string;
  legalId: string;
  legalIdType: string;
  addressLine1: string;
  city: string;
  region: string;
  country: string;
}

const PaymentPage: React.FC = () => {
  const { cartItems } = useCart();
  const [error, setError] = useState<string | null>(null);

  // Estado para los datos del cliente
  const [customerData, setCustomerData] = useState<CustomerData>({
    fullName: '',
    email: '',
    phoneNumber: '',
    legalId: '',
    legalIdType: 'CC',
    addressLine1: '',
    city: '',
    region: '',
    country: 'CO', // Por defecto Colombia
  });

  const [termsAccepted, setTermsAccepted] = useState(false);

  // Calcular el total del carrito con IVA
  const subtotal = cartItems.reduce((sum: number, item) => sum + item.price * item.quantity, 0);
  const iva = subtotal * 0.19; // 19% IVA en Colombia
  const totalWithIva = subtotal + iva;
  const amountInCents = Math.round(totalWithIva * 100); // Wompi usa centavos

  // Configuración de Wompi
  const WOMPI_PUBLIC_KEY = 'pub_prod_YvzwsKQJJGHLKvhbPXcc8GrHDVzf2Dfw'; // Llave pública de Wompi
  const WOMPI_INTEGRITY_SECRET = 'prod_integrity_WYldkU1ZmlmMb1eAdcE7JYkqratHPswh'; // Clave secreta de integridad de Wompi
  const currency = 'COP';
  const redirectUrl = 'https://pchub.net/success'; // URL a la que Wompi redirigirá después del pago

  // Generar una referencia única para el pago
  const reference = `order_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  // Generar la firma de integridad (signature:integrity) usando la clave secreta de integridad
  const signatureIntegrity = useMemo(() => {
    const stringToHash = `${reference}${amountInCents}${currency}${WOMPI_INTEGRITY_SECRET}`;
    return SHA256(stringToHash).toString();
  }, [reference, amountInCents, currency]);

  // Manejar cambios en el formulario
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCustomerData((prev) => ({ ...prev, [name]: value }));
  };

  // Función para manejar el envío del formulario
  const handlePayment = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    // Validar términos y condiciones
    if (!termsAccepted) {
      setError('Debes aceptar los términos y condiciones para continuar.');
      return;
    }

    // Validar datos del cliente
    if (
      !customerData.fullName ||
      !customerData.email ||
      !customerData.phoneNumber ||
      !customerData.legalId ||
      !customerData.addressLine1 ||
      !customerData.city ||
      !customerData.region
    ) {
      setError('Por favor, completa todos los campos requeridos.');
      return;
    }

    // Si las validaciones pasan, el formulario se enviará automáticamente a Wompi
    e.currentTarget.submit();
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
                <span>
                  {item.name} (x{item.quantity})
                </span>
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

      {/* Formulario para datos del cliente y envío a Wompi */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Datos del cliente</h2>
        <form action="https://checkout.wompi.co/p/" method="GET" onSubmit={handlePayment}>
          {/* Campos ocultos requeridos por Wompi */}
          <input type="hidden" name="public-key" value={WOMPI_PUBLIC_KEY} />
          <input type="hidden" name="currency" value={currency} />
          <input type="hidden" name="amount-in-cents" value={amountInCents.toString()} />
          <input type="hidden" name="reference" value={reference} />
          <input type="hidden" name="signature:integrity" value={signatureIntegrity} />

          {/* Campos ocultos opcionales */}
          <input type="hidden" name="redirect-url" value={redirectUrl} />
          <input
            type="hidden"
            name="expiration-time"
            value={new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()} // Expira en 24 horas
          />
          <input type="hidden" name="tax-in-cents:vat" value={Math.round(iva * 100).toString()} />
          <input type="hidden" name="tax-in-cents:consumption" value="0" /> {/* Impoconsumo, si aplica */}
          <input type="hidden" name="customer-data:email" value={customerData.email} />
          <input type="hidden" name="customer-data:full-name" value={customerData.fullName} />
          <input type="hidden" name="customer-data:phone-number" value={customerData.phoneNumber} />
          <input type="hidden" name="customer-data:legal-id" value={customerData.legalId} />
          <input type="hidden" name="customer-data:legal-id-type" value={customerData.legalIdType} />
          <input type="hidden" name="shipping-address:address-line-1" value={customerData.addressLine1} />
          <input type="hidden" name="shipping-address:country" value={customerData.country} />
          <input type="hidden" name="shipping-address:phone-number" value={customerData.phoneNumber} />
          <input type="hidden" name="shipping-address:city" value={customerData.city} />
          <input type="hidden" name="shipping-address:region" value={customerData.region} />

          {/* Campos visibles para el cliente */}
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
            <label className="block mb-1">Dirección de envío</label>
            <input
              type="text"
              name="addressLine1"
              value={customerData.addressLine1}
              onChange={handleInputChange}
              className="border p-2 w-full rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1">Ciudad</label>
            <input
              type="text"
              name="city"
              value={customerData.city}
              onChange={handleInputChange}
              className="border p-2 w-full rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1">Región/Departamento</label>
            <input
              type="text"
              name="region"
              value={customerData.region}
              onChange={handleInputChange}
              className="border p-2 w-full rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1">País</label>
            <select
              name="country"
              value={customerData.country}
              onChange={handleInputChange}
              className="border p-2 w-full rounded"
            >
              <option value="CO">Colombia</option>
              {/* Agrega más países si es necesario */}
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
                <a
                  href="https://wompi.co/terminos"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
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
              disabled={cartItems.length === 0}
              className={`bg-blue-500 text-white px-6 py-2 rounded ${
                cartItems.length === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'
              }`}
            >
              Pagar con Wompi
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