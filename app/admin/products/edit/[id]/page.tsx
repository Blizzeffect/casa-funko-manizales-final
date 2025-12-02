'use client';

import { useState, useEffect, FormEvent, use } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

const TEMPLATE_BACKGROUND_URLS: Record<string, string> = {
    default:
        'https://kcesbopmsmbbxczkooay.supabase.co/storage/v1/object/public/funkos/templates/default.png',
};

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const [name, setName] = useState('');
    const [price, setPrice] = useState<number | ''>('');
    const [cost, setCost] = useState<number | ''>('');
    const [stock, setStock] = useState<number | ''>(1);
    const [category, setCategory] = useState('');
    const [description, setDescription] = useState('');
    const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
    const [isPreorder, setIsPreorder] = useState(false);
    const [releaseDate, setReleaseDate] = useState('');

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    useEffect(() => {
        async function fetchProduct() {
            setLoading(true);
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('id', id)
                .single();

            if (error) {
                console.error('Error fetching product:', error);
                setMessage('Error al cargar el producto.');
            } else if (data) {
                setName(data.name);
                setPrice(data.price);
                setCost(data.cost || '');
                setStock(data.stock);
                setCategory(data.category || '');
                setDescription(data.description || '');
                setCurrentImageUrl(data.image_url);
                setPreviewUrl(data.image_url);
                setIsPreorder(data.is_preorder || false);
                setReleaseDate(data.release_date || '');
            }
            setLoading(false);
        }

        fetchProduct();
    }, [id]);

    function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) {
            return;
        }
        setImageFile(file);
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
    }

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setMessage(null);

        if (!name || !price || !stock) {
            setMessage('Faltan campos obligatorios (nombre, precio, stock).');
            return;
        }

        try {
            setIsSubmitting(true);
            let imageUrl = currentImageUrl;

            // 1. Upload new image if selected
            if (imageFile) {
                const ext = imageFile.name.split('.').pop() || 'png';
                const fileName = `${crypto.randomUUID()}.${ext}`;
                const filePath = `products/${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('funkos')
                    .upload(filePath, imageFile);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('funkos')
                    .getPublicUrl(filePath);

                imageUrl = publicUrl;
            }

            // 2. Update Product
            const { error: updateError } = await supabase
                .from('products')
                .update({
                    name,
                    price: Number(price),
                    cost: cost !== '' ? Number(cost) : null,
                    stock: Number(stock),
                    category,
                    description,
                    image_url: imageUrl,
                    is_preorder: isPreorder,
                    release_date: releaseDate || null,
                })
                .eq('id', id);

            if (updateError) throw updateError;

            setMessage('Producto actualizado correctamente.');
            router.refresh();

        } catch (error: any) {
            console.error(error);
            setMessage('Error al actualizar: ' + (error.message || 'Error desconocido'));
        } finally {
            setIsSubmitting(false);
        }
    }

    const inputStyle: React.CSSProperties = {
        width: '100%',
        padding: '0.5rem',
        backgroundColor: '#020617',
        color: '#e5e7eb',
        border: '1px solid #1f2937',
        borderRadius: 6,
    };

    const labelStyle: React.CSSProperties = {
        display: 'block',
        fontWeight: 'bold',
        marginBottom: 4,
    };

    if (loading) {
        return <div className="p-12 text-center text-cyan animate-pulse">Cargando producto...</div>;
    }

    return (
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '2rem' }}>
            <div className="flex items-center gap-4 mb-8">
                <Link href="/admin/products" className="text-gray-400 hover:text-white transition">
                    ← Volver
                </Link>
                <h1 style={{ fontSize: '1.8rem' }}>Editar Producto</h1>
            </div>

            <form
                onSubmit={handleSubmit}
                style={{
                    display: 'grid',
                    gap: '1.5rem',
                    gridTemplateColumns: '1.5fr 1fr',
                }}
            >
                {/* Columna izquierda: campos */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {/* Imagen */}
                    <div>
                        <label style={labelStyle}>Imagen del Funko (PNG/JPG)</label>
                        <input
                            type="file"
                            accept="image/png, image/jpeg"
                            onChange={handleImageChange}
                            style={{
                                ...inputStyle,
                                cursor: 'pointer',
                            }}
                        />
                    </div>

                    {/* Datos básicos */}
                    <div>
                        <label style={labelStyle}>Nombre</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Ej: Luffy Gear 5"
                            style={inputStyle}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <div style={{ flex: 1 }}>
                            <label style={labelStyle}>Precio (venta)</label>
                            <input
                                type="number"
                                value={price}
                                onChange={(e) =>
                                    setPrice(e.target.value ? Number(e.target.value) : '')
                                }
                                placeholder="Ej: 120000"
                                style={inputStyle}
                            />
                        </div>

                        <div style={{ flex: 1 }}>
                            <label style={labelStyle}>Costo (opcional)</label>
                            <input
                                type="number"
                                value={cost}
                                onChange={(e) =>
                                    setCost(e.target.value ? Number(e.target.value) : '')
                                }
                                placeholder="Ej: 80000"
                                style={inputStyle}
                            />
                        </div>

                        <div style={{ flex: 1 }}>
                            <label style={labelStyle}>Stock</label>
                            <input
                                type="number"
                                value={stock}
                                onChange={(e) =>
                                    setStock(e.target.value ? Number(e.target.value) : '')
                                }
                                placeholder="Ej: 5"
                                style={inputStyle}
                            />
                        </div>
                    </div>

                    {/* Clasificación */}
                    <div>
                        <label style={labelStyle}>Categoría</label>
                        <input
                            type="text"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            placeholder="Ej: Funko Pop, Keychain..."
                            style={inputStyle}
                        />
                    </div>

                    {/* Descripción */}
                    <div>
                        <label style={labelStyle}>Descripción</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Detalles del Funko (condición, edición, etc.)"
                            rows={4}
                            style={{
                                ...inputStyle,
                                resize: 'vertical',
                            }}
                        />
                    </div>

                    {/* Pre-order Section */}
                    <div className="bg-dark-2 p-4 rounded-lg border border-gray-800">
                        <div className="flex items-center gap-3 mb-4">
                            <input
                                type="checkbox"
                                id="is_preorder"
                                checked={isPreorder}
                                onChange={(e) => setIsPreorder(e.target.checked)}
                                className="w-5 h-5 accent-magenta"
                            />
                            <label htmlFor="is_preorder" className="font-bold text-white cursor-pointer">
                                ¿Es Pre-orden?
                            </label>
                        </div>

                        {isPreorder && (
                            <div className="animate-fade-in">
                                <label style={labelStyle}>Fecha de Lanzamiento</label>
                                <input
                                    type="date"
                                    value={releaseDate}
                                    onChange={(e) => setReleaseDate(e.target.value)}
                                    style={inputStyle}
                                />
                            </div>
                        )}
                    </div>

                    {/* Mensaje y botón */}
                    {message && (
                        <div
                            style={{
                                marginTop: '0.5rem',
                                fontSize: '0.85rem',
                                color: message.includes('correctamente')
                                    ? '#22c55e'
                                    : '#f97316',
                            }}
                        >
                            {message}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        style={{
                            marginTop: '0.5rem',
                            padding: '0.75rem 1.5rem',
                            backgroundColor: '#111827',
                            color: 'white',
                            borderRadius: 6,
                            border: 'none',
                            cursor: 'pointer',
                            opacity: isSubmitting ? 0.7 : 1,
                        }}
                    >
                        {isSubmitting ? 'Guardando...' : '💾 Guardar Cambios'}
                    </button>
                </div>

                {/* Columna derecha: preview */}
                <div
                    style={{
                        border: '1px solid #e5e7eb',
                        borderRadius: 8,
                        padding: '1rem',
                        background: '#f9fafb',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem',
                    }}
                >
                    <h2 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: '#111827' }}>
                        Vista previa
                    </h2>

                    <div
                        style={{
                            width: '100%',
                            aspectRatio: '3 / 4',
                            borderRadius: 12,
                            backgroundImage: `url(${TEMPLATE_BACKGROUND_URLS['default']})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden',
                            position: 'relative',
                        }}
                    >
                        {previewUrl ? (
                            <img
                                src={previewUrl}
                                alt="Preview Funko"
                                style={{
                                    maxWidth: '70%',
                                    maxHeight: '80%',
                                    objectFit: 'contain',
                                    position: 'relative',
                                    zIndex: 1,
                                }}
                            />
                        ) : (
                            <span style={{ color: '#e5e7eb', zIndex: 1 }}>
                                Sube una imagen para verla aquí
                            </span>
                        )}
                    </div>

                    <div>
                        <div style={{ fontWeight: 'bold', color: '#111827' }}>
                            {name || 'Nombre del Funko'}
                        </div>
                        <div style={{ color: '#4b5563' }}>
                            {price
                                ? `Precio: $${Number(price).toLocaleString('es-CO')}`
                                : 'Precio aún sin definir'}
                        </div>
                        {stock !== '' && (
                            <div style={{ color: '#4b5563' }}>Stock: {stock}</div>
                        )}
                    </div>
                </div>
            </form>
        </div>
    );
}
