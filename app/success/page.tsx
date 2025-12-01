'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

import { Order } from '@/types';

function SuccessContent() {
  const searchParams = useSearchParams();
  const [orderData, setOrderData] = useState<Order | null>(null);

  useEffect(() => {
    const externalReference = searchParams.get('external_reference');

    const fetchOrderDetails = async (reference: string) => {
      try {
        const response = await fetch(`/api/orders/${reference}`);
        const data = await response.json();
        setOrderData(data);
      } catch (error) {
        console.error('Error fetching order:', error);
      }
    };

    if (externalReference) {
      fetchOrderDetails(externalReference);
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          ¡Pago Exitoso!
        </h1>

        <p className="text-gray-600 mb-6">
          Tu compra ha sido procesada correctamente. Pronto recibirás un email
          con los detalles de tu orden.
        </p>

        {orderData && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Referencia:</span>
                <span className="font-semibold text-gray-900">
                  {orderData.reference}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total:</span>
                <span className="font-semibold text-gray-900">
                  ${orderData.total_amount}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Estado:</span>
                <span className="font-semibold text-green-600">
                  {orderData.status === 'paid' ? 'Pagado' : orderData.status}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <Link
            href="/orders"
            className="block w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition"
          >
            Ver mis órdenes
          </Link>

          <Link
            href="/"
            className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold py-3 px-4 rounded-lg transition"
          >
            Volver a inicio
          </Link>
        </div>

        <p className="text-xs text-gray-500 mt-6">
          ID de pago: {searchParams.get('payment_id')}
        </p>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Cargando...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
