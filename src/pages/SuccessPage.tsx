import React, { useEffect, useState } from 'react';
import { functions, httpsCallable } from '../firebase';
import { Link } from 'react-router-dom';

// Definir el tipo de la respuesta de la Cloud Function
interface TransactionStatusResponse {
  status: string;
  message: string;
}

const SuccessPage: React.FC = () => {
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
      const transactionId = localStorage.getItem('transactionId');
      if (!transactionId) {
        setStatus('No se encontró el ID de la transacción');
        setLoading(false);
        return;
      }

      try {
        const checkWompiTransactionStatus = httpsCallable<unknown, TransactionStatusResponse>(
          functions,
          'checkWompiTransactionStatus'
        );
        const result = await checkWompiTransactionStatus({ transactionId });
        setStatus(result.data.status);
      } catch (error) {
        setStatus('Error al verificar el estado de la transacción');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    checkStatus();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Resultado del Pago</h1>
      {loading ? (
        <p>Verificando el estado del pago...</p>
      ) : (
        <div>
          <p className="mb-4">
            {status === 'APPROVED'
              ? '¡Pago exitoso! Gracias por tu compra.'
              : status === 'DECLINED'
              ? 'El pago fue rechazado. Por favor, intenta de nuevo.'
              : status === 'PENDING'
              ? 'El pago está pendiente. Te notificaremos cuando se complete.'
              : 'Error: ' + status}
          </p>
          <Link to="/" className="text-blue-500 hover:underline">
            Volver a la página principal
          </Link>
        </div>
      )}
    </div>
  );
};

export default SuccessPage;