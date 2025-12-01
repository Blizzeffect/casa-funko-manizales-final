'use client';

import { supabase } from '@/lib/supabase';
import { CartItem, Product } from '@/types';
import Image from 'next/image';

interface CartProps {
  items: CartItem[];
  onRemoveItem: (cartId: string) => void;
  onAddItem: (product: Product) => void;
}

export default function Cart({ items, onRemoveItem, onAddItem }: CartProps) {
  const total = items.reduce((sum: number, item: CartItem) => sum + item.price, 0);

  // Agrupar items por ID de producto
  const groupedItems = items.reduce((acc: Record<number, CartItem[]>, item: CartItem) => {
    if (!acc[item.id]) {
      acc[item.id] = [];
    }
    acc[item.id].push(item);
    return acc;
  }, {});

  const uniqueItemIds = Object.keys(groupedItems).map(Number);

  const hasOverStock = uniqueItemIds.some((id) => {
    const quantity = groupedItems[id].length;
    const stock = groupedItems[id][0].stock;
    return quantity > stock;
  });

  async function createOrderAndPay() {
    if (items.length === 0) return;
    if (hasOverStock) return;

    const reference = `casafunko-${crypto.randomUUID()}`;

    // Para la orden, enviamos items agrupados o individuales?
    // MercadoPago prefiere items individuales o agrupados con qty.
    // Vamos a agruparlos para MP también.
    const orderItems = uniqueItemIds.map((id) => {
      const group = groupedItems[id];
      const item = group[0];
      return {
        product_id: item.id,
        name: item.name,
        price: item.price,
        qty: group.length,
      };
    });

    const { error } = await supabase.from('orders').insert([
      {
        reference,
        total_amount: total,
        items: orderItems,
        status: 'pending',
      },
    ]);

    if (error) {
      console.error('Error creating order:', error);
      return;
    }

    const resp = await fetch('/api/mercadopago', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        reference,
        items: orderItems,
      }),
    });

    if (!resp.ok) {
      console.error('Error creating Mercado Pago preference');
      return;
    }

    const data = await resp.json();
    if (!data.init_point) {
      console.error('No init_point from Mercado Pago');
      return;
    }

    window.location.assign(data.init_point);
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
        {items.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="text-4xl mb-2">🛒</div>
            <p>Tu carrito está vacío</p>
          </div>
        ) : (
          uniqueItemIds.map((id) => {
            const group = groupedItems[id];
            const item = group[0];
            const qty = group.length;
            const outOfStock = qty > item.stock;

            return (
              <div
                key={item.id}
                className="bg-dark p-4 rounded-lg border border-gray-800 flex gap-4"
              >
                <div className="w-20 h-20 bg-dark-2 rounded overflow-hidden flex-shrink-0 relative">
                  <Image src={item.image_url} alt={item.name} fill className="object-cover" />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-white truncate mb-1">{item.name}</h3>
                  <p className="text-magenta font-bold mb-2">
                    ${(item.price * qty).toLocaleString('es-CO')}
                  </p>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center bg-dark-2 rounded-lg border border-gray-700">
                      <button
                        onClick={() => onRemoveItem(group[0].cartId)}
                        className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white transition"
                      >
                        -
                      </button>
                      <span className="w-8 text-center text-sm font-bold">{qty}</span>
                      <button
                        onClick={() => onAddItem(item)}
                        disabled={qty >= item.stock}
                        className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition"
                      >
                        +
                      </button>
                    </div>
                    <span className="text-xs text-gray-500">
                      Stock: {item.stock}
                    </span>
                  </div>

                  {outOfStock && (
                    <p className="text-xs text-red-500 mt-2 font-bold">
                      ⚠️ Stock insuficiente (Max: {item.stock})
                    </p>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {items.length > 0 && (
        <div className="border-t border-gray-800 pt-6">
          <div className="flex justify-between text-xl font-heading font-bold mb-6">
            <span className="text-gray-400">Total</span>
            <span className="text-white">
              ${total.toLocaleString('es-CO')}
            </span>
          </div>

          <button
            onClick={createOrderAndPay}
            disabled={hasOverStock}
            className={`w-full py-4 rounded-lg font-bold transition-all shadow-lg
              ${hasOverStock
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-magenta to-purple text-white hover:opacity-90 hover:shadow-[0_0_20px_rgba(255,0,110,0.4)]'
              }
            `}
          >
            {hasOverStock
              ? 'AJUSTA CANTIDADES'
              : 'PAGAR CON MERCADO PAGO'}
          </button>

          <p className="text-xs text-gray-500 text-center mt-4">
            🔒 Pago seguro procesado por Mercado Pago
          </p>
        </div>
      )}
    </div>
  );
}
