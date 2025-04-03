import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import SHA256 from 'crypto-js/sha256';

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [customerData, setCustomerData] = useState<CustomerData>({
    fullName: '',
    email: '',
    phoneNumber: '',
    legalId: '',
    legalIdType: 'CC',
    addressLine1: '',
    city: '',
    region: '',
    country: 'CO',
  });

  const [termsAccepted, setTermsAccepted] = useState(false);

  const subtotal = cartItems.reduce((sum: number, item) => {
    const itemPrice = item.price;
    const discountPercentage = item.discount || 0;
    const discountedPrice = itemPrice * (1 - discountPercentage / 100);
    return sum + discountedPrice * item.quantity;
  }, 0);

  const total = subtotal;
  const amountInCents = Math.round(total * 100);

  const WOMPI_PUBLIC_KEY = 'pub_prod_YvzwsKQJJGHLKvhbPXcc8GrHDVzf2Dfw';
  const WOMPI_INTEGRITY_SECRET = 'prod_integrity_WYldkU1ZmlmMb1eAdcE7JYkqratHPswh';
  const currency = 'COP';
  const redirectUrl = 'https://pchub.net/success';

  const reference = `order_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  const signatureIntegrity = useMemo(() => {
    const stringToHash = `${reference}${amountInCents}${currency}${WOMPI_INTEGRITY_SECRET}`;
    console.log('Datos para la firma:', { reference, amountInCents, currency });
    const signature = SHA256(stringToHash).toString();
    console.log('Firma generada:', signature);
    return signature;
  }, [reference, amountInCents, currency]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCustomerData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!termsAccepted) {
      setError('Debes aceptar los términos y condiciones para continuar.');
      setLoading(false);
      return;
    }

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
      setLoading(false);
      return;
    }

    try {
      console.log('Enviando formulario a Wompi...');
      // El formulario se enviará automáticamente
    } catch (err) {
      setError('Ocurrió un error al procesar el pago. Por favor, intenta de nuevo.');
      setLoading(false);
      console.error('Error en el proceso de pago:', err);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Página de Pago</h1>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Resumen de tu compra</h2>
        {cartItems.length === 0 ? (
          <p>Tu carrito está vacío.</p>
        ) : (
          <ul className="border p-4 rounded">
            {cartItems.map((item) => {
              const originalPrice = item.price;
              const discountPercentage = item.discount || 0;
              const discountedPrice = originalPrice * (1 - discountPercentage / 100);

              return (
                <li key={item.id} className="flex justify-between py-2">
                  <span>
                    {item.name} (x{item.quantity})
                    {discountPercentage > 0 && (
                      <span className="text-green-500 ml-2">({discountPercentage}% OFF)</span>
                    )}
                  </span>
                  <span>
                    {discountPercentage > 0 && (
                      <span className="line-through text-gray-500 mr-2">
                        ${(originalPrice * item.quantity).toLocaleString('es-CO')}
                      </span>
                    )}
                    ${(discountedPrice * item.quantity).toLocaleString('es-CO')}
                  </span>
                </li>
              );
            })}
            <li className="flex justify-between font-bold pt-2 border-t">
              <span>Total:</span>
              <span>${total.toLocaleString('es-CO')}</span>
            </li>
          </ul>
        )}
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Datos del cliente</h2>
        <form action="https://checkout.wompi.co/p/" method="GET" onSubmit={handlePayment}>
          <input type="hidden" name="public-key" value={WOMPI_PUBLIC_KEY} />
          <input type="hidden" name="currency" value={currency} />
          <input type="hidden" name="amount-in-cents" value={amountInCents.toString()} />
          <input type="hidden" name="reference" value={reference} />
          <input type="hidden" name="signature:integrity" value={signatureIntegrity} />
          <input type="hidden" name="redirect-url" value={redirectUrl} />
          <input
            type="hidden"
            name="expiration-time"
            value={new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()}
          />
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

          <div className="flex space-x-4">
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <button
              type="submit"
              disabled={loading || cartItems.length === 0}
              className={`bg-blue-500 text-white px-6 py-2 rounded ${
                loading || cartItems.length === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'
              }`}
            >
              {loading ? 'Procesando...' : 'Pagar con Wompi'}
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