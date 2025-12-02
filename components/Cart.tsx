'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { CartItem, Product } from '@/types';
import Image from 'next/image';

interface CartProps {
  items: CartItem[];
  onRemoveItem: (cartId: string) => void;
  onAddItem: (product: Product) => void;
}

type ShippingLocation = 'manizales' | 'national' | null;

interface Courier {
  id: string;
  name: string;
  price: number;
}

const COURIERS: Record<string, Courier[]> = {
  manizales: [
    { id: 'local_pickup', name: 'Recogida en Tienda', price: 0 },
    { id: 'local_delivery', name: 'Domicilio Local', price: 5000 },
  ],
  national: [
    { id: 'interrapidisimo', name: 'Interrapidisimo', price: 15000 },
    { id: 'servientrega', name: 'Servientrega', price: 18000 },
    { id: 'coordinadora', name: 'Coordinadora', price: 16000 },
  ],
};

export default function Cart({ items, onRemoveItem, onAddItem }: CartProps) {
  const [shippingLocation, setShippingLocation] = useState<ShippingLocation>(null);
  const [selectedCourier, setSelectedCourier] = useState<Courier | null>(null);

  const [customerDetails, setCustomerDetails] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
  });

  const subtotal = items.reduce((sum: number, item: CartItem) => sum + item.price, 0);
  const shippingCost = selectedCourier?.price || 0;
  const total = subtotal + shippingCost;

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
    // Allow overstock for pre-orders
    const isPreorder = groupedItems[id][0].is_preorder;
    return !isPreorder && quantity > stock;
  });

  const handleLocationChange = (location: ShippingLocation) => {
    setShippingLocation(location);
    setSelectedCourier(null); // Reset courier when location changes
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCustomerDetails(prev => ({ ...prev, [name]: value }));
  };

  async function createOrderAndPay() {
    if (items.length === 0) return;
    if (hasOverStock) return;
    if (!selectedCourier) {
      alert('Por favor selecciona un método de envío');
      return;
    }

    // Validate Customer Details
    if (!customerDetails.name || !customerDetails.email || !customerDetails.phone || !customerDetails.address || !customerDetails.city) {
      alert('Por favor completa todos los datos de envío');
      return;
    }

    const reference = `casafunko-${crypto.randomUUID()}`;

    // Items de producto
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

    // Agregar envío como item
    const finalItems = [
      ...orderItems,
      {
        product_id: 999999, // ID dummy para envío
        name: `Envío: ${selectedCourier.name}`,
        price: selectedCourier.price,
        qty: 1
      }
    ];

    const { error } = await supabase.from('orders').insert([
      {
        reference,
        total_amount: total,
        items: finalItems,
        status: 'pending',
        courier: selectedCourier.name,
        customer_details: customerDetails,
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
        items: finalItems,
        payer: {
          name: customerDetails.name,
          email: customerDetails.email,
        }
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
      <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
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
            const outOfStock = !item.is_preorder && qty > item.stock;

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
                        disabled={!item.is_preorder && qty >= item.stock}
                        className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition"
                      >
                        +
                      </button>
                    </div>
                    {!item.is_preorder && (
                      <span className="text-xs text-gray-500">
                        Stock: {item.stock}
                      </span>
                    )}
                    {item.is_preorder && (
                      <span className="text-xs text-purple-400 font-bold">
                        PRE-ORDEN
                      </span>
                    )}
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
        <div className="border-t border-gray-800 pt-6 space-y-6">

          {/* Customer Details Form */}
          <div className="bg-dark p-4 rounded-lg border border-gray-800 space-y-3">
            <h4 className="font-bold text-white mb-1 flex items-center gap-2">
              <span>👤</span> Datos de Envío
            </h4>
            <input
              type="text"
              name="name"
              placeholder="Nombre Completo"
              value={customerDetails.name}
              onChange={handleInputChange}
              className="w-full bg-dark-2 border border-gray-700 rounded p-2 text-sm text-white focus:border-magenta outline-none"
            />
            <input
              type="email"
              name="email"
              placeholder="Correo Electrónico"
              value={customerDetails.email}
              onChange={handleInputChange}
              className="w-full bg-dark-2 border border-gray-700 rounded p-2 text-sm text-white focus:border-magenta outline-none"
            />
            <input
              type="tel"
              name="phone"
              placeholder="Teléfono / WhatsApp"
              value={customerDetails.phone}
              onChange={handleInputChange}
              className="w-full bg-dark-2 border border-gray-700 rounded p-2 text-sm text-white focus:border-magenta outline-none"
            />
            <div className="flex gap-2">
              <input
                type="text"
                name="city"
                placeholder="Ciudad"
                value={customerDetails.city}
                onChange={handleInputChange}
                className="flex-1 bg-dark-2 border border-gray-700 rounded p-2 text-sm text-white focus:border-magenta outline-none"
              />
              <input
                type="text"
                name="address"
                placeholder="Dirección Exacta"
                value={customerDetails.address}
                onChange={handleInputChange}
                className="flex-[2] bg-dark-2 border border-gray-700 rounded p-2 text-sm text-white focus:border-magenta outline-none"
              />
            </div>
          </div>

          {/* Shipping Section */}
          <div className="bg-dark p-4 rounded-lg border border-gray-800">
            <h4 className="font-bold text-white mb-3 flex items-center gap-2">
              <span>🚚</span> Estimación de Envío
            </h4>

            {/* Location Selector */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => handleLocationChange('manizales')}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-bold transition ${shippingLocation === 'manizales'
                  ? 'bg-cyan text-black'
                  : 'bg-dark-2 text-gray-400 hover:bg-gray-800'
                  }`}
              >
                Manizales
              </button>
              <button
                onClick={() => handleLocationChange('national')}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-bold transition ${shippingLocation === 'national'
                  ? 'bg-magenta text-white'
                  : 'bg-dark-2 text-gray-400 hover:bg-gray-800'
                  }`}
              >
                Nacional
              </button>
            </div>

            {/* Courier Selector */}
            {shippingLocation && (
              <div className="space-y-2 animate-fade-in">
                {COURIERS[shippingLocation].map((courier) => (
                  <label
                    key={courier.id}
                    className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition ${selectedCourier?.id === courier.id
                      ? 'border-white bg-white/5'
                      : 'border-gray-800 hover:border-gray-600'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="courier"
                        value={courier.id}
                        checked={selectedCourier?.id === courier.id}
                        onChange={() => setSelectedCourier(courier)}
                        className="accent-magenta"
                      />
                      <span className="text-sm text-gray-300">{courier.name}</span>
                    </div>
                    <span className="text-sm font-bold text-white">
                      {courier.price === 0 ? 'Gratis' : `$${courier.price.toLocaleString('es-CO')}`}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Totals */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-400">
              <span>Subtotal</span>
              <span>${subtotal.toLocaleString('es-CO')}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-400">
              <span>Envío</span>
              <span>${shippingCost.toLocaleString('es-CO')}</span>
            </div>
            <div className="flex justify-between text-xl font-heading font-bold pt-2 border-t border-gray-800">
              <span className="text-white">Total</span>
              <span className="text-cyan">
                ${total.toLocaleString('es-CO')}
              </span>
            </div>
          </div>

          <button
            onClick={createOrderAndPay}
            disabled={hasOverStock || !selectedCourier}
            className={`w-full py-4 rounded-lg font-bold transition-all shadow-lg
              ${hasOverStock || !selectedCourier
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-magenta to-purple text-white hover:opacity-90 hover:shadow-[0_0_20px_rgba(255,0,110,0.4)]'
              }
            `}
          >
            {hasOverStock
              ? 'AJUSTA CANTIDADES'
              : !selectedCourier
                ? 'SELECCIONA ENVÍO'
                : 'PAGAR CON MERCADO PAGO'}
          </button>

          <p className="text-xs text-gray-500 text-center">
            🔒 Pago seguro procesado por Mercado Pago
          </p>
        </div>
      )}
    </div>
  );
}
