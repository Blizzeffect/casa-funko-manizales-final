'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Post } from '@/types';
import Link from 'next/link';
import Image from 'next/image';

export default function BlogAdminPage() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPosts();
    }, []);

    async function fetchPosts() {
        setLoading(true);
        const { data } = await supabase
            .from('posts')
            .select('*')
            .order('published_at', { ascending: false });

        if (data) setPosts(data);
        setLoading(false);
    }

    async function handleDelete(id: string) {
        if (!confirm('¿Estás seguro de eliminar este artículo?')) return;

        const { error } = await supabase.from('posts').delete().eq('id', id);
        if (error) {
            alert('Error al eliminar: ' + error.message);
        } else {
            fetchPosts();
        }
    }

    return (
        <div className="min-h-screen bg-dark text-white p-8 font-sans">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-4">
                        <div className="relative w-16 h-16">
                            <Image src="/logo.png" alt="Logo" fill className="object-contain drop-shadow-[0_0_5px_rgba(255,0,110,0.5)]" />
                        </div>
                        <h1 className="text-3xl font-heading font-bold text-transparent bg-clip-text bg-gradient-to-r from-magenta to-cyan">
                            Administrar Blog
                        </h1>
                    </div>
                    <Link
                        href="/admin/blog/new"
                        className="px-6 py-3 bg-magenta text-white font-bold rounded-lg hover:bg-magenta/80 transition shadow-[0_0_15px_rgba(255,0,110,0.4)]"
                    >
                        + Nuevo Artículo
                    </Link>
                </div>

                {loading ? (
                    <div className="text-center py-12 animate-pulse text-cyan">Cargando artículos...</div>
                ) : (
                    <div className="bg-dark-2 rounded-xl border border-gray-800 overflow-hidden shadow-2xl">
                        <table className="w-full text-left">
                            <thead className="bg-black/40 text-cyan uppercase text-sm font-bold">
                                <tr>
                                    <th className="p-4">Imagen</th>
                                    <th className="p-4">Título</th>
                                    <th className="p-4">Categoría</th>
                                    <th className="p-4">Fecha</th>
                                    <th className="p-4 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {posts.map((post) => (
                                    <tr key={post.id} className="hover:bg-white/5 transition">
                                        <td className="p-4 w-24">
                                            <div className="relative w-16 h-16 rounded overflow-hidden bg-dark">
                                                {post.image_url ? (
                                                    <Image src={post.image_url} alt={post.title} fill className="object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-2xl">📝</div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-4 font-medium">
                                            <div className="line-clamp-1">{post.title}</div>
                                            <div className="text-xs text-gray-500 font-mono mt-1">/{post.slug}</div>
                                        </td>
                                        <td className="p-4">
                                            <span className="px-2 py-1 rounded-full text-xs bg-cyan/10 text-cyan border border-cyan/20">
                                                {post.category}
                                            </span>
                                        </td>
                                        <td className="p-4 text-gray-400 text-sm">
                                            {new Date(post.published_at).toLocaleDateString()}
                                        </td>
                                        <td className="p-4 text-right space-x-2">
                                            <Link
                                                href={`/admin/blog/edit/${post.id}`}
                                                className="text-gray-300 hover:text-white transition"
                                            >
                                                ✏️ Editar
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(post.id)}
                                                className="text-red-500 hover:text-red-400 transition ml-4"
                                            >
                                                🗑️ Eliminar
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {posts.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="p-12 text-center text-gray-500">
                                            No hay artículos publicados aún.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
