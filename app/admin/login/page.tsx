'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const supabase = createClient();

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            router.push('/admin');
            router.refresh();
        }
    }

    return (
        <div className="min-h-screen bg-dark flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-dark-2 border border-gray-800 rounded-2xl p-8 shadow-[0_0_50px_rgba(255,0,110,0.1)]">
                <div className="text-center mb-8">
                    <div className="relative w-20 h-20 mx-auto mb-4">
                        <Image src="/logo.png" alt="Logo" fill className="object-contain" />
                    </div>
                    <h1 className="text-2xl font-heading font-bold text-white">
                        Admin Access
                    </h1>
                    <p className="text-gray-400 text-sm">
                        Ingresa tus credenciales para continuar
                    </p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-300 mb-2">
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-black/50 border border-gray-700 rounded-lg p-3 text-white focus:border-magenta outline-none transition"
                            placeholder="admin@casafunko.com"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-300 mb-2">
                            Contraseña
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-black/50 border border-gray-700 rounded-lg p-3 text-white focus:border-cyan outline-none transition"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-gradient-to-r from-magenta to-purple-600 text-white font-bold rounded-lg hover:opacity-90 transition shadow-lg disabled:opacity-50"
                    >
                        {loading ? 'Ingresando...' : 'Iniciar Sesión'}
                    </button>
                </form>
            </div>
        </div>
    );
}
