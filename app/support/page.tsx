'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function SupportPage() {
    const [formData, setFormData] = useState({
        email: '',
        subject: '',
        message: '',
    });
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('submitting');

        const { error } = await supabase.from('tickets').insert([formData]);

        if (error) {
            console.error('Error submitting ticket:', error);
            setStatus('error');
        } else {
            setStatus('success');
            setFormData({ email: '', subject: '', message: '' });
        }
    };

    return (
        <div className="min-h-screen bg-dark text-white font-sans">
            <header className="bg-dark-2 border-b border-gray-800 py-6">
                <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
                    <Link href="/" className="text-2xl font-heading font-bold text-transparent bg-clip-text bg-gradient-to-r from-magenta to-cyan">
                        Casa Funko
                    </Link>
                    <Link href="/" className="text-gray-400 hover:text-white transition">
                        ← Volver a la tienda
                    </Link>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-4 py-12">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-heading font-bold mb-4">Centro de Ayuda</h1>
                    <p className="text-gray-400 text-lg">¿Tienes dudas sobre tu pedido o un Funko específico? Escríbenos.</p>
                </div>

                <div className="bg-dark-2 p-8 rounded-xl border border-gray-800 shadow-2xl">
                    {status === 'success' ? (
                        <div className="text-center py-12 animate-fade-in">
                            <div className="text-6xl mb-4">✅</div>
                            <h2 className="text-2xl font-bold text-white mb-2">¡Mensaje Recibido!</h2>
                            <p className="text-gray-400">Te responderemos a tu correo lo antes posible.</p>
                            <button
                                onClick={() => setStatus('idle')}
                                className="mt-6 text-magenta font-bold hover:underline"
                            >
                                Enviar otro mensaje
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-300 mb-2">Tu Correo Electrónico</label>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full bg-dark border border-gray-700 rounded-lg p-3 text-white focus:border-cyan outline-none transition"
                                    placeholder="ejemplo@correo.com"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-300 mb-2">Asunto</label>
                                <select
                                    required
                                    value={formData.subject}
                                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                    className="w-full bg-dark border border-gray-700 rounded-lg p-3 text-white focus:border-cyan outline-none transition"
                                >
                                    <option value="">Selecciona un tema...</option>
                                    <option value="Pedido">Estado de mi Pedido</option>
                                    <option value="Pre-orden">Duda sobre Pre-orden</option>
                                    <option value="Garantia">Garantía / Devolución</option>
                                    <option value="Otro">Otro</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-300 mb-2">Mensaje</label>
                                <textarea
                                    required
                                    rows={5}
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    className="w-full bg-dark border border-gray-700 rounded-lg p-3 text-white focus:border-cyan outline-none transition resize-none"
                                    placeholder="Cuéntanos cómo podemos ayudarte..."
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={status === 'submitting'}
                                className="w-full py-4 bg-gradient-to-r from-cyan to-blue-500 text-black font-bold rounded-lg hover:opacity-90 transition shadow-[0_0_20px_rgba(0,245,255,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {status === 'submitting' ? 'Enviando...' : 'Enviar Mensaje'}
                            </button>

                            {status === 'error' && (
                                <p className="text-red-500 text-center font-bold">Hubo un error al enviar. Intenta de nuevo.</p>
                            )}
                        </form>
                    )}
                </div>
            </main>
        </div>
    );
}
