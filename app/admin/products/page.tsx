'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Product } from '@/types';
import Link from 'next/link';
import Image from 'next/image';

export default function ProductsAdminPage() {
    const supabase = createClient();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteConfirmation, setDeleteConfirmation] = useState('');

    useEffect(() => {
        fetchProducts();
    }, []);

    async function fetchProducts() {
        setLoading(true);
        const { data, error } = await supabase
            .from('products')
            .select('*');

        if (error) {
            console.error('Error fetching products:', error);
        }

        if (data) setProducts(data);
        setLoading(false);
    }

    // Toggle single selection
    const toggleSelection = (id: number) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedIds(newSelected);
    };

    // Toggle all
    const toggleAll = () => {
        if (selectedIds.size === products.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(products.map(p => p.id)));
        }
    };

    async function handleBulkDelete() {
        if (deleteConfirmation !== 'no estoy seguro pero ya que') {
            return;
        }

        const idsToDelete = Array.from(selectedIds);
        const { error } = await supabase.from('products').delete().in('id', idsToDelete);

        if (error) {
            alert('Error al eliminar: ' + error.message);
        } else {
            fetchProducts();
            setSelectedIds(new Set());
            setShowDeleteModal(false);
            setDeleteConfirmation('');
        }
    }

    async function handleSingleDelete(id: number) {
        if (!confirm('¿Estás seguro de eliminar este producto?')) return;
        const { error } = await supabase.from('products').delete().eq('id', id);
        if (error) {
            alert('Error al eliminar: ' + error.message);
        } else {
            fetchProducts();
        }
    }

    return (
        <div className="space-y-8 relative">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-heading font-bold text-transparent bg-clip-text bg-gradient-to-r from-magenta to-cyan">
                    Administrar Productos
                </h1>
                <div className="flex gap-4">
                    {selectedIds.size > 0 && (
                        <button
                            onClick={() => setShowDeleteModal(true)}
                            className="px-6 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition shadow-lg"
                        >
                            🗑️ Eliminar ({selectedIds.size})
                        </button>
                    )}
                    <Link
                        href="/admin/products/new"
                        className="px-6 py-3 bg-magenta text-white font-bold rounded-lg hover:bg-magenta/80 transition shadow-[0_0_15px_rgba(255,0,110,0.4)]"
                    >
                        + Nuevo Producto
                    </Link>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-12 animate-pulse text-cyan">Cargando productos...</div>
            ) : (
                <div className="bg-dark-2 rounded-xl border border-gray-800 overflow-hidden shadow-2xl">
                    <table className="w-full text-left">
                        <thead className="bg-black/40 text-cyan uppercase text-sm font-bold">
                            <tr>
                                <th className="p-4 w-12">
                                    <input
                                        type="checkbox"
                                        checked={products.length > 0 && selectedIds.size === products.length}
                                        onChange={toggleAll}
                                        className="w-5 h-5 rounded border-gray-600 bg-dark focus:ring-magenta"
                                    />
                                </th>
                                <th className="p-4">Imagen</th>
                                <th className="p-4">Nombre</th>
                                <th className="p-4">Precio</th>
                                <th className="p-4">Stock</th>
                                <th className="p-4">Categoría</th>
                                <th className="p-4 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {products.map((product) => (
                                <tr key={product.id} className={`hover:bg-white/5 transition ${selectedIds.has(product.id) ? 'bg-magenta/10' : ''}`}>
                                    <td className="p-4">
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.has(product.id)}
                                            onChange={() => toggleSelection(product.id)}
                                            className="w-5 h-5 rounded border-gray-600 bg-dark focus:ring-magenta"
                                        />
                                    </td>
                                    <td className="p-4 w-24">
                                        <div className="relative w-16 h-16 rounded overflow-hidden bg-dark">
                                            {product.image_url ? (
                                                <Image src={product.image_url} alt={product.name} fill className="object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-4 font-medium text-white">
                                        {product.name}
                                    </td>
                                    <td className="p-4 text-gray-300">
                                        ${product.price.toLocaleString('es-CO')}
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs border ${product.stock > 0
                                            ? 'bg-green-500/10 text-green-500 border-green-500/20'
                                            : 'bg-red-500/10 text-red-500 border-red-500/20'
                                            }`}>
                                            {product.stock} un.
                                        </span>
                                    </td>
                                    <td className="p-4 text-gray-400 text-sm">
                                        {product.description}
                                    </td>
                                    <td className="p-4 text-right space-x-2">
                                        <Link
                                            href={`/admin/products/edit/${product.id}`}
                                            className="text-gray-300 hover:text-white transition mr-4"
                                        >
                                            ✏️ Editar
                                        </Link>
                                        <button
                                            onClick={() => handleSingleDelete(product.id)}
                                            className="text-red-500 hover:text-red-400 transition"
                                        >
                                            🗑️ Eliminar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {products.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="p-12 text-center text-gray-500">
                                        No hay productos registrados aún.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* DELETE CONFIRMATION MODAL */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-dark-2 border border-red-500/50 rounded-xl p-8 max-w-md w-full shadow-[0_0_50px_rgba(255,0,0,0.2)]">
                        <h3 className="text-2xl font-bold text-white mb-4">¿Eliminar {selectedIds.size} productos?</h3>
                        <p className="text-gray-300 mb-6">
                            Esta acción no se puede deshacer. Para confirmar, escribe exactamente:
                            <br />
                            <span className="font-mono text-red-400 font-bold select-all">no estoy seguro pero ya que</span>
                        </p>

                        <input
                            type="text"
                            value={deleteConfirmation}
                            onChange={(e) => setDeleteConfirmation(e.target.value)}
                            placeholder="Escribe la frase aquí..."
                            className="w-full bg-black/50 border border-gray-700 rounded-lg p-3 text-white mb-6 focus:border-red-500 outline-none"
                        />

                        <div className="flex gap-4 justify-end">
                            <button
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setDeleteConfirmation('');
                                }}
                                className="px-4 py-2 text-gray-400 hover:text-white transition"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleBulkDelete}
                                disabled={deleteConfirmation !== 'no estoy seguro pero ya que'}
                                className="px-6 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Confirmar Eliminación
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
