'use client';

import { useState, useEffect, use } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function EditBlogPostPage({ params }: { params: Promise<{ id: string }> }) {
    const supabase = createClient();
    const { id } = use(params);
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    // Form Fields
    const [title, setTitle] = useState('');
    const [slug, setSlug] = useState('');
    const [excerpt, setExcerpt] = useState('');
    const [content, setContent] = useState('');
    const [category, setCategory] = useState('');
    const [readingTime, setReadingTime] = useState('5 min');
    const [currentImageUrl, setCurrentImageUrl] = useState('');

    // Fetch Post Data
    useEffect(() => {
        const fetchPost = async () => {
            const { data, error } = await supabase
                .from('posts')
                .select('*')
                .eq('id', id)
                .single();

            if (error) {
                alert('Error al cargar el artículo');
                router.push('/admin/blog');
                return;
            }

            if (data) {
                setTitle(data.title);
                setSlug(data.slug);
                setExcerpt(data.excerpt);
                setContent(data.content);
                setCategory(data.category);
                setReadingTime(data.reading_time);
                setCurrentImageUrl(data.image_url);
                setPreviewUrl(data.image_url);
            }
            setFetching(false);
        };
        fetchPost();
    }, [id, router]);

    // Auto-generate slug from title ONLY if slug is empty (don't overwrite existing slug on edit unless user wants to)
    // Actually, for edit, we usually don't auto-update slug to avoid breaking links, so I'll remove the auto-effect here
    // or make it optional. Let's keep it manual for edits.

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            let imageUrl = currentImageUrl;

            // 1. Upload Image if selected
            if (imageFile) {
                const fileExt = imageFile.name.split('.').pop();
                const fileName = `${slug}-${Date.now()}.${fileExt}`;
                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('posts')
                    .upload(fileName, imageFile);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('posts')
                    .getPublicUrl(fileName);

                imageUrl = publicUrl;
            }

            // 2. Update Post
            const { error: updateError } = await supabase
                .from('posts')
                .update({
                    title,
                    slug,
                    excerpt,
                    content,
                    category,
                    image_url: imageUrl,
                    reading_time: readingTime,
                })
                .eq('id', id);

            if (updateError) throw updateError;

            alert('¡Artículo actualizado exitosamente!');
            router.push('/admin/blog');

        } catch (error: any) {
            console.error('Error:', error);
            alert('Error al actualizar: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return <div className="min-h-screen bg-dark flex items-center justify-center text-cyan animate-pulse">Cargando datos...</div>;
    }

    return (
        <div className="min-h-screen bg-dark text-white p-8 font-sans">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/admin/blog" className="text-gray-400 hover:text-white transition">
                        ← Volver
                    </Link>
                    <h1 className="text-3xl font-heading font-bold text-white">
                        Editar Artículo
                    </h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* LEFT COLUMN: FORM */}
                    <div className="lg:col-span-2 space-y-6">
                        <form onSubmit={handleSubmit} className="space-y-6">

                            {/* Title */}
                            <div className="space-y-2">
                                <label className="block font-bold text-cyan">Título del Artículo</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full bg-dark-2 border border-gray-700 rounded-lg p-3 text-white focus:border-magenta outline-none transition"
                                    required
                                />
                            </div>

                            {/* Slug */}
                            <div className="space-y-2">
                                <label className="block text-sm text-gray-400">Slug (URL amigable)</label>
                                <input
                                    type="text"
                                    value={slug}
                                    onChange={(e) => setSlug(e.target.value)}
                                    className="w-full bg-black/20 border border-gray-800 rounded-lg p-2 text-gray-300 font-mono text-sm"
                                    required
                                />
                            </div>

                            {/* Category & Time */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="block font-bold text-cyan">Categoría</label>
                                    <select
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        className="w-full bg-dark-2 border border-gray-700 rounded-lg p-3 text-white focus:border-magenta outline-none"
                                        required
                                    >
                                        <option value="">Seleccionar...</option>
                                        <option value="Guías">Guías</option>
                                        <option value="Noticias">Noticias</option>
                                        <option value="Coleccionismo">Coleccionismo</option>
                                        <option value="Reseñas">Reseñas</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="block font-bold text-cyan">Tiempo de Lectura</label>
                                    <input
                                        type="text"
                                        value={readingTime}
                                        onChange={(e) => setReadingTime(e.target.value)}
                                        className="w-full bg-dark-2 border border-gray-700 rounded-lg p-3 text-white focus:border-magenta outline-none"
                                    />
                                </div>
                            </div>

                            {/* Excerpt */}
                            <div className="space-y-2">
                                <label className="block font-bold text-cyan">Extracto (Resumen corto)</label>
                                <textarea
                                    value={excerpt}
                                    onChange={(e) => setExcerpt(e.target.value)}
                                    className="w-full bg-dark-2 border border-gray-700 rounded-lg p-3 text-white focus:border-magenta outline-none h-24 resize-none"
                                    required
                                />
                            </div>

                            {/* Content */}
                            <div className="space-y-2">
                                <label className="block font-bold text-cyan">Contenido (Markdown soportado)</label>
                                <textarea
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    className="w-full bg-dark-2 border border-gray-700 rounded-lg p-3 text-white focus:border-magenta outline-none h-96 font-mono text-sm leading-relaxed"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-magenta to-purple text-white font-bold py-4 rounded-lg shadow-lg hover:shadow-[0_0_20px_rgba(255,0,110,0.4)] transition transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Guardando...' : '💾 Guardar Cambios'}
                            </button>

                        </form>
                    </div>

                    {/* RIGHT COLUMN: SIDEBAR & TIPS */}
                    <div className="space-y-8">

                        {/* Image Upload */}
                        <div className="bg-dark-2 p-6 rounded-xl border border-gray-800 shadow-lg">
                            <h3 className="font-bold text-white mb-4">Imagen Principal</h3>

                            <div className="mb-4 aspect-video bg-black/40 rounded-lg overflow-hidden border-2 border-dashed border-gray-700 flex items-center justify-center relative group">
                                {previewUrl ? (
                                    <Image src={previewUrl} alt="Preview" fill className="object-cover" />
                                ) : (
                                    <div className="text-center p-4">
                                        <div className="text-4xl mb-2">🖼️</div>
                                        <p className="text-sm text-gray-500">Arrastra o selecciona</p>
                                    </div>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                />
                            </div>

                            <div className="space-y-3 text-sm text-gray-400 bg-black/20 p-4 rounded-lg">
                                <p className="font-bold text-cyan">Recomendaciones:</p>
                                <ul className="list-disc list-inside space-y-1">
                                    <li>Tamaño: <span className="text-white">1200 x 630 px</span></li>
                                    <li>Formato: <span className="text-white">WebP</span> o JPG</li>
                                </ul>
                            </div>
                        </div>

                    </div>

                </div>
            </div>
        </div>
    );
}
