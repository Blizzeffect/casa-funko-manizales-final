'use client';

import { useEffect, useState } from 'react';
import { Product, CartItem } from '@/types';
import ProductGrid from '@/components/ProductGrid';
import Cart from '@/components/Cart';
import Toast from '@/components/Toast';
import Link from 'next/link';

export default function WishlistPage() {
    const [wishlistItems, setWishlistItems] = useState<Product[]>([]);
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [cartOpen, setCartOpen] = useState(false);
    const [toast, setToast] = useState<{ visible: boolean; product?: Product }>({ visible: false });

    useEffect(() => {
        loadWishlist();

        // Listen for updates
        window.addEventListener('wishlist-updated', loadWishlist);
        return () => window.removeEventListener('wishlist-updated', loadWishlist);
    }, []);

    const loadWishlist = () => {
        const items = JSON.parse(localStorage.getItem('wishlist') || '[]');
        setWishlistItems(items);
    };

    const addToCart = (product: Product) => {
        setCartItems([...cartItems, { ...product, cartId: crypto.randomUUID() }]);
        setToast({ visible: true, product });
    };

    const removeFromCart = (cartId: string) => {
        setCartItems(cartItems.filter(item => item.cartId !== cartId));
    };

    return (
        <div className="min-h-screen bg-dark text-white font-sans">
            <Toast
                message="Agregado al carrito"
                product={toast.product}
                isVisible={toast.visible}
                onClose={() => setToast({ ...toast, visible: false })}
                onViewCart={() => setCartOpen(true)}
            />

            {/* Header Simple */}
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

            <main className="max-w-7xl mx-auto px-4 py-12">
                <div className="flex items-center gap-4 mb-8">
                    <span className="text-4xl">❤️</span>
                    <h1 className="text-4xl font-heading font-bold text-white">Tu Lista de Deseos</h1>
                </div>

                {wishlistItems.length > 0 ? (
                    <ProductGrid
                        products={wishlistItems}
                        cartItems={cartItems}
                        onAddToCart={addToCart}
                        onRemoveItem={removeFromCart}
                    />
                ) : (
                    <div className="text-center py-20 bg-dark-2 rounded-xl border border-gray-800">
                        <div className="text-6xl mb-4 grayscale opacity-50">💔</div>
                        <p className="text-xl text-gray-400 mb-6">No tienes favoritos guardados aún.</p>
                        <Link
                            href="/"
                            className="px-8 py-3 bg-magenta text-white rounded-lg font-bold shadow-lg hover:bg-magenta/90 transition"
                        >
                            Explorar Catálogo
                        </Link>
                    </div>
                )}
            </main>

            {/* Cart Overlay */}
            {cartOpen && (
                <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm p-4 flex justify-end">
                    <div className="w-full max-w-md bg-dark-2 h-full overflow-y-auto p-6 rounded-l-xl shadow-2xl border-l border-cyan/20">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-heading font-bold text-white">Tu Carrito</h2>
                            <button onClick={() => setCartOpen(false)} className="text-gray-400 hover:text-white">✕</button>
                        </div>
                        <Cart items={cartItems} onRemoveItem={removeFromCart} onAddItem={addToCart} />
                    </div>
                </div>
            )}
        </div>
    );
}
