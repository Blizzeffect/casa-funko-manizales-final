'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Order } from '@/types';
import Link from 'next/link';

export default function OrdersAdminPage() {
    const supabase = createClient();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [trackingInput, setTrackingInput] = useState('');

    useEffect(() => {
        fetchOrders();
    }, []);

    async function fetchOrders() {
        setLoading(true);
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching orders:', error);
        } else {
            setOrders(data || []);
        }
        setLoading(false);
    }

    async function updateStatus(id: number, status: string) {
        const { error } = await supabase
            .from('orders')
            .update({ status })
            .eq('id', id);

        if (error) {
            alert('Error updating status: ' + error.message);
        } else {
            fetchOrders();
            if (selectedOrder?.id === id) {
                setSelectedOrder(prev => prev ? { ...prev, status: status as any } : null);
            }
        }
    }

    async function saveTracking(id: number) {
        const { error } = await supabase
            .from('orders')
            .update({ tracking_number: trackingInput })
            .eq('id', id);

        if (error) {
            alert('Error saving tracking: ' + error.message);
        } else {
            fetchOrders();
            if (selectedOrder?.id === id) {
                setSelectedOrder(prev => prev ? { ...prev, tracking_number: trackingInput } : null);
            }
            alert('Guía guardada correctamente');
        }
    }

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-heading font-bold text-transparent bg-clip-text bg-gradient-to-r from-magenta to-cyan">
                    Administrar Pedidos
                </h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Orders List */}
                <div className="lg:col-span-2 bg-dark-2 rounded-xl border border-gray-800 overflow-hidden shadow-2xl">
                    {loading ? (
                        <div className="p-8 text-center text-cyan animate-pulse">Cargando pedidos...</div>
                    ) : orders.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">No hay pedidos aún.</div>
                    ) : (
                        <table className="w-full text-left">
                            <thead className="bg-black/40 text-cyan uppercase text-sm font-bold">
                                <tr>
                                    <th className="p-4">Ref</th>
                                    <th className="p-4">Fecha</th>
                                    <th className="p-4">Total</th>
                                    <th className="p-4">Estado</th>
                                    <th className="p-4">Acción</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {orders.map((order) => (
                                    <tr
                                        key={order.id}
                                        className={`hover:bg-white/5 transition cursor-pointer ${selectedOrder?.id === order.id ? 'bg-white/10' : ''}`}
                                        onClick={() => {
                                            setSelectedOrder(order);
                                            setTrackingInput(order.tracking_number || '');
                                        }}
                                    >
                                        <td className="p-4 font-mono text-sm text-gray-300">
                                            {order.reference.split('-')[1]}...
                                        </td>
                                        <td className="p-4 text-gray-400 text-sm">
                                            {new Date(order.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="p-4 font-bold text-white">
                                            ${order.total_amount.toLocaleString('es-CO')}
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded text-xs font-bold uppercase
                                                ${order.status === 'paid' ? 'bg-green-500/20 text-green-400' :
                                                    order.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                                                        order.status === 'shipped' ? 'bg-cyan/20 text-cyan' :
                                                            'bg-gray-700 text-gray-400'
                                                }
                                            `}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <button className="text-magenta hover:text-white text-sm font-bold">
                                                Ver →
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Order Details Panel */}
                <div className="bg-dark-2 rounded-xl border border-gray-800 p-6 h-fit sticky top-8">
                    {selectedOrder ? (
                        <div className="space-y-6 animate-fade-in">
                            <div className="border-b border-gray-800 pb-4">
                                <h2 className="text-xl font-bold text-white mb-1">Detalle del Pedido</h2>
                                <p className="text-sm text-gray-400 font-mono">{selectedOrder.reference}</p>
                            </div>

                            {/* Items */}
                            <div className="space-y-3">
                                <h3 className="text-sm font-bold text-cyan uppercase">Productos</h3>
                                <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                                    {selectedOrder.items.map((item: any, idx: number) => (
                                        <div key={idx} className="flex justify-between text-sm">
                                            <span className="text-gray-300">
                                                {item.qty}x {item.name}
                                            </span>
                                            <span className="text-white font-bold">
                                                ${item.price.toLocaleString('es-CO')}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Customer Details */}
                            {selectedOrder.customer_details && (
                                <div className="space-y-3 pt-4 border-t border-gray-800">
                                    <h3 className="text-sm font-bold text-cyan uppercase">Cliente</h3>
                                    <div className="text-sm space-y-1">
                                        <p className="text-white font-bold">{selectedOrder.customer_details.name}</p>
                                        <p className="text-gray-400">{selectedOrder.customer_details.email}</p>
                                        <p className="text-gray-400">{selectedOrder.customer_details.phone}</p>
                                        <p className="text-gray-300 mt-2">
                                            {selectedOrder.customer_details.address}<br />
                                            {selectedOrder.customer_details.city}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Status Management */}
                            <div className="space-y-3 pt-4 border-t border-gray-800">
                                <h3 className="text-sm font-bold text-cyan uppercase">Gestión</h3>

                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">Estado</label>
                                    <select
                                        value={selectedOrder.status}
                                        onChange={(e) => updateStatus(selectedOrder.id, e.target.value)}
                                        className="w-full bg-black/50 border border-gray-700 rounded p-2 text-white text-sm"
                                    >
                                        <option value="pending">Pendiente de Pago</option>
                                        <option value="paid">Pagado (Preparar)</option>
                                        <option value="shipped">Enviado</option>
                                        <option value="delivered">Entregado</option>
                                        <option value="cancelled">Cancelado</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">Número de Guía</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={trackingInput}
                                            onChange={(e) => setTrackingInput(e.target.value)}
                                            placeholder="Ej: 9988776655"
                                            className="flex-1 bg-black/50 border border-gray-700 rounded p-2 text-white text-sm"
                                        />
                                        <button
                                            onClick={() => saveTracking(selectedOrder.id)}
                                            className="bg-magenta text-white px-3 rounded text-sm font-bold hover:bg-magenta/80"
                                        >
                                            💾
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-12 text-gray-500">
                            <p>Selecciona un pedido para ver los detalles</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
