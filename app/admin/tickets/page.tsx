'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';

interface Ticket {
    id: string;
    email: string;
    subject: string;
    message: string;
    status: 'open' | 'resolved';
    created_at: string;
}

export default function TicketsAdminPage() {
    const supabase = createClient();
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTickets();
    }, []);

    async function fetchTickets() {
        setLoading(true);
        const { data, error } = await supabase
            .from('tickets')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching tickets:', error);
        } else {
            setTickets(data || []);
        }
        setLoading(false);
    }

    async function resolveTicket(id: string) {
        const { error } = await supabase
            .from('tickets')
            .update({ status: 'resolved' })
            .eq('id', id);

        if (error) {
            alert('Error updating ticket');
        } else {
            fetchTickets();
        }
    }

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-heading font-bold text-transparent bg-clip-text bg-gradient-to-r from-magenta to-cyan">
                Soporte al Cliente
            </h1>

            <div className="bg-dark-2 rounded-xl border border-gray-800 overflow-hidden shadow-2xl">
                {loading ? (
                    <div className="p-8 text-center text-cyan animate-pulse">Cargando tickets...</div>
                ) : tickets.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">No hay tickets pendientes. 🎉</div>
                ) : (
                    <div className="divide-y divide-gray-800">
                        {tickets.map((ticket) => (
                            <div key={ticket.id} className="p-6 hover:bg-white/5 transition">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${ticket.status === 'open' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
                                                }`}>
                                                {ticket.status === 'open' ? 'Abierto' : 'Resuelto'}
                                            </span>
                                            <span className="text-gray-400 text-sm">
                                                {new Date(ticket.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <h3 className="text-xl font-bold text-white">{ticket.subject}</h3>
                                        <p className="text-cyan text-sm">{ticket.email}</p>
                                    </div>

                                    {ticket.status === 'open' && (
                                        <button
                                            onClick={() => resolveTicket(ticket.id)}
                                            className="px-4 py-2 bg-green-600 text-white rounded-lg font-bold text-sm hover:bg-green-500 transition"
                                        >
                                            Marcar Resuelto
                                        </button>
                                    )}
                                </div>

                                <p className="text-gray-300 bg-black/30 p-4 rounded-lg border border-gray-700">
                                    {ticket.message}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
