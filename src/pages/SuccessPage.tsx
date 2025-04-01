import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { toast } from 'react-toastify';

const SuccessPage: React.FC = () => {
  const { clearCart } = useCart();
  const [transactionStatus, setTransactionStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkTransaction = async () => {
      const transactionId = localStorage.getItem('transactionId');
      if (!transactionId) {
        setError('No se encontró el ID de la transacción.');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('https://us-central1-ecommerce-pc-parts.cloudfunctions.net/checkWompiTransactionStatus', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ data: { transactionId } }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Error al verificar el estado de la transacción');
        }

        const result = await response.json();
        const { status } = result.data;
        setTransactionStatus(status);

        if (status === 'APPROVED') {
          clearCart();
          toast.success('Pago exitoso. ¡Gracias por tu compra!');
          localStorage.removeItem('transactionId');
        } else if (status === 'DECLINED') {
          setError('El pago fue rechazado. Por favor, intenta de nuevo.');
          toast.error('El pago fue rechazado.');
        } else {
          setError('El estado del pago está pendiente. Por favor, espera unos minutos.');
          toast.warn('El estado del pago está pendiente.');
        }
      } catch (err: any) {
        setError(err.message || 'Error al verificar el estado del pago.');
        toast.error(err.message || 'Error al verificar el estado del pago.');
      } finally {
        setLoading(false);
      }
    };

    checkTransaction();
  }, [clearCart]);

  if (loading) {
    return <div className="container mx-auto p-4">Verificando el estado del pago...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Resultado del Pago</h1>
      {error ? (
        <div>
          <p className="text-red-500 mb-4">{error}</p>
          <Link to="/cart" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            Volver al carrito
          </Link>
        </div>
      ) : (
        <div>
          <p className="text-green-500 mb-4">
            {transactionStatus === 'APPROVED'
              ? '¡Tu pago fue exitoso! Gracias por tu compra.'
              : 'El estado del pago está pendiente. Te notificaremos pronto.'}
          </p>
          <Link to="/" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            Volver al inicio
          </Link>
        </div>
      )}
    </div>
  );
};

export default SuccessPage;