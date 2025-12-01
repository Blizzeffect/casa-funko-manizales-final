'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import ProductGrid from '@/components/ProductGrid';
import Cart from '@/components/Cart';
import { Product, CartItem } from '@/types';

import Toast from '@/components/Toast';

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [toast, setToast] = useState<{ visible: boolean; product?: Product }>({ visible: false });

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*');

      if (error) {
        console.error('Error fetching products:', error);
        setProducts([]);
      } else {
        setProducts(data || []);
      }
    };

    fetchProducts();
  }, []);

  const addToCart = (product: Product) => {
    setCartItems([...cartItems, { ...product, cartId: crypto.randomUUID() }]);
    setToast({ visible: true, product });
  };

  const removeFromCart = (cartId: string) => {
    setCartItems(cartItems.filter(item => item.cartId !== cartId));
  };

  return (
    <div
      className="min-h-screen bg-black text-white"
      style={{
        backgroundImage:
          'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%2300d4ff" fill-opacity="0.03"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
      }}
    >
      <Toast
        message="Agregado al carrito"
        product={toast.product}
        isVisible={toast.visible}
        onClose={() => setToast({ ...toast, visible: false })}
        onViewCart={() => setCartOpen(true)}
      />
      {/* HEADER */}
      <header className="border-b-2 border-cyan-500 bg-black/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="text-xl md:text-2xl font-bold font-mono text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-yellow-400 whitespace-nowrap">
              {'<'} CASA FUNKO {'/>'}
            </div>
            <span className="text-xs text-cyan-500 animate-pulse hidden sm:inline">Manizales</span>
            <span className="text-[10px] text-cyan-500 animate-pulse sm:hidden">MZL</span>
          </div>

          <button
            onClick={() => setCartOpen(!cartOpen)}
            className="relative px-6 py-2 border-2 border-cyan-500 bg-black hover:bg-cyan-500/10 transition-all font-mono text-cyan-400 hover:text-cyan-300"
            style={{
              boxShadow:
                '0 0 10px rgba(0, 212, 255, 0.5), inset 0 0 10px rgba(0, 212, 255, 0.1)',
            }}
          >
            🛒 CARRITO ({cartItems.length})
          </button>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative py-20 px-4 border-b-2 border-yellow-400/30 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 text-cyan-500/20 font-mono text-xs whitespace-pre">
            {`> system.boot()
  ┌─────────────────────┐
  │ FUNKO.NEXUS v2.0.1 │
  └─────────────────────┘
  ✓ Connection: STABLE`}
          </div>
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-5xl md:text-6xl font-black mb-4 font-mono text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-yellow-400 to-cyan-400 animate-pulse">
            CASA FUNKO
          </h1>

          <p className="text-lg text-cyan-300 mb-2 font-mono">
            {`// La oda a los Funkos en código limpio`}
          </p>

          <p className="text-yellow-400 font-mono mb-8 text-sm">
            {'{'} pixel_art: true, anime: &apos;essential&apos;, vibe: &apos;cyberpunk&apos; {'}'}
          </p>

          <div className="flex justify-center gap-4 mb-8">
            <div className="px-4 py-2 border-2 border-cyan-500 bg-black text-cyan-400 font-mono text-sm">
              {products.length} FUNKOS EN STOCK
            </div>
            <div className="px-4 py-2 border-2 border-yellow-400 bg-black text-yellow-400 font-mono text-sm">
              ENVÍOS A COLOMBIA
            </div>
          </div>
        </div>
      </section>

      <div className="flex gap-8 max-w-7xl mx-auto p-4">
        {/* GRID PRINCIPAL */}
        <div className="flex-1">
          <ProductGrid
            products={products}
            cartItems={cartItems}
            onAddToCart={addToCart}
            onRemoveItem={removeFromCart}
          />
        </div>

        {/* CARRITO SIDEBAR */}
        {/* CARRITO SIDEBAR / OVERLAY */}
        {cartOpen && (
          <div className="fixed inset-0 z-50 md:static md:z-auto md:w-80 md:block bg-black/90 md:bg-transparent backdrop-blur-sm md:backdrop-blur-none p-4 md:p-0 overflow-y-auto md:overflow-visible">
            <div className="md:sticky md:top-24">
              <div className="flex justify-end md:hidden mb-4">
                <button
                  onClick={() => setCartOpen(false)}
                  className="px-4 py-2 border border-red-500 text-red-500 font-mono text-sm hover:bg-red-500/10"
                >
                  [X] CERRAR
                </button>
              </div>
              <Cart items={cartItems} onRemoveItem={removeFromCart} onAddItem={addToCart} />
            </div>
          </div>
        )}
      </div>

      {/* FOOTER */}
      <footer className="border-t-2 border-cyan-500/30 mt-20 py-8 px-4 text-center bg-black/50">
        <p className="text-cyan-500/50 font-mono text-sm">
          © 2025 Casa Funko Manizales | Crafted with {'<3'} and next.js
        </p>
      </footer>
    </div>
  );
}
