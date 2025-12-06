'use client';

import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const supabase = createClient();

    async function handleLogout() {
        await supabase.auth.signOut();
        router.push('/admin/login');
        router.refresh();
    }

    return (
        <div className="min-h-screen bg-dark flex">
            {/* Sidebar */}
            <aside className="w-64 bg-dark-2 border-r border-gray-800 flex flex-col fixed h-full z-10">
                <div className="p-6 flex items-center gap-3 border-b border-gray-800">
                    <div className="relative w-8 h-8">
                        <Image src="/logo.png" alt="Logo" fill className="object-contain" />
                    </div>
                    <span className="font-heading font-bold text-xl text-white tracking-wider">
                        ADMIN
                    </span>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <Link
                        href="/admin"
                        className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-white/5 hover:text-cyan rounded-lg transition group"
                    >
                        <span className="text-xl group-hover:scale-110 transition">📊</span>
                        <span className="font-medium">Dashboard</span>
                    </Link>

                    <Link
                        href="/admin/products"
                        className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-white/5 hover:text-magenta rounded-lg transition group"
                    >
                        <span className="text-xl group-hover:scale-110 transition">📦</span>
                        <span className="font-medium">Productos</span>
                    </Link>

                    <Link
                        href="/admin/orders"
                        className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-white/5 hover:text-green-400 rounded-lg transition group"
                    >
                        <span className="text-xl group-hover:scale-110 transition">🚚</span>
                        <span className="font-medium">Pedidos</span>
                    </Link>

                    <Link
                        href="/admin/blog"
                        className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-white/5 hover:text-yellow-400 rounded-lg transition group"
                    >
                        <span className="text-xl group-hover:scale-110 transition">📝</span>
                        <span className="font-medium">Blog</span>
                    </Link>

                    <Link
                        href="/admin/chat"
                        className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-white/5 hover:text-purple-400 rounded-lg transition group"
                    >
                        <span className="text-xl group-hover:scale-110 transition">💬</span>
                        <span className="font-medium">Comunidad</span>
                    </Link>

                    <Link
                        href="/admin/radio"
                        className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-white/5 hover:text-cyan rounded-lg transition group"
                    >
                        <span className="text-xl group-hover:scale-110 transition">📻</span>
                        <span className="font-medium">Radio</span>
                    </Link>

                    <Link
                        href="/admin/tickets"
                        className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-white/5 hover:text-blue-400 rounded-lg transition group"
                    >
                        <span className="text-xl group-hover:scale-110 transition">🎫</span>
                        <span className="font-medium">Soporte</span>
                    </Link>
                </nav>

                <div className="p-4 border-t border-gray-800 space-y-2">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 transition px-4 py-2 rounded-lg"
                    >
                        <span>🚪</span>
                        <span>Cerrar Sesión</span>
                    </button>

                    <Link
                        href="/"
                        className="flex items-center gap-2 text-gray-500 hover:text-white transition px-4 py-2"
                    >
                        <span>⬅️</span>
                        <span>Volver a la web</span>
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-64 p-8">
                {children}
            </main>
        </div>
    );
}
