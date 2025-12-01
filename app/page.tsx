'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import ProductGrid from '@/components/ProductGrid';
import Cart from '@/components/Cart';
import { Product, CartItem } from '@/types';
import Toast from '@/components/Toast';
import Image from 'next/image';

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [toast, setToast] = useState<{ visible: boolean; product?: Product }>({ visible: false });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(0);
  const [navbarBg, setNavbarBg] = useState(false);

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

  // Scroll Progress & Navbar
  useEffect(() => {
    const handleScroll = () => {
      const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = (winScroll / height) * 100;
      setScrolled(scrolled);
      setNavbarBg(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const addToCart = (product: Product) => {
    setCartItems([...cartItems, { ...product, cartId: crypto.randomUUID() }]);
    setToast({ visible: true, product });
  };

  const removeFromCart = (cartId: string) => {
    setCartItems(cartItems.filter(item => item.cartId !== cartId));
  };

  return (
    <div className="bg-dark text-white font-sans selection:bg-magenta selection:text-white">
      {/* Scroll Progress Bar */}
      <div
        className="fixed top-0 left-0 h-[3px] bg-gradient-to-r from-magenta to-cyan z-50 transition-all duration-100 ease-out"
        style={{ width: `${scrolled}%` }}
      />

      <Toast
        message="Agregado al carrito"
        product={toast.product}
        isVisible={toast.visible}
        onClose={() => setToast({ ...toast, visible: false })}
        onViewCart={() => setCartOpen(true)}
      />

      {/* NAVIGATION */}
      <nav
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${navbarBg ? 'bg-black/80 backdrop-blur-md shadow-[0_0_20px_rgba(255,0,110,0.2)]' : 'bg-transparent'}`}
      >
        <div className="max-w-7xl mx-auto px-4 py-2 flex justify-between items-center">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2 group">
            <div className="relative w-24 h-24 group-hover:scale-110 transition-transform duration-300">
              <Image
                src="/logo.png"
                alt="Casa Funko Colombia"
                fill
                className="object-contain drop-shadow-[0_0_15px_rgba(0,255,255,0.6)]"
                priority
              />
            </div>
          </a>

          {/* Menu Desktop */}
          <div className="hidden md:flex gap-8 items-center font-medium">
            <a href="/blog" className="text-gray-300 hover:text-cyan hover:drop-shadow-[0_0_5px_rgba(0,255,255,0.8)] transition">Blog</a>
            <a href="#shop" className="text-cyan hover:text-white hover:drop-shadow-[0_0_5px_rgba(255,0,110,0.8)] transition">Tienda</a>
            <a href="#contact" className="text-gray-300 hover:text-cyan hover:drop-shadow-[0_0_5px_rgba(0,255,255,0.8)] transition">Contacto</a>
          </div>

          {/* CTA + Cart */}
          <div className="flex gap-4 items-center">
            <button
              onClick={() => setCartOpen(true)}
              className="hidden sm:flex items-center gap-2 text-white hover:text-magenta transition hover:drop-shadow-[0_0_5px_rgba(255,0,110,0.8)]"
            >
              <span className="text-2xl">🛒</span>
              <span className="text-sm font-bold">Carrito ({cartItems.length})</span>
            </button>

            {/* Menu Hamburger Mobile */}
            <button
              className="md:hidden text-white text-2xl"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-dark-2 border-t border-cyan/20 animate-slide-down">
            <a href="/blog" className="block px-4 py-3 text-gray-300 hover:bg-dark" onClick={() => setMobileMenuOpen(false)}>Blog</a>
            <a href="#shop" className="block px-4 py-3 text-cyan hover:bg-dark" onClick={() => setMobileMenuOpen(false)}>Tienda</a>
            <a href="#contact" className="block px-4 py-3 text-gray-300 hover:bg-dark" onClick={() => setMobileMenuOpen(false)}>Contacto</a>
            <button
              onClick={() => { setCartOpen(true); setMobileMenuOpen(false); }}
              className="w-full text-left px-4 py-3 text-magenta font-bold hover:bg-dark"
            >
              🛒 Ver Carrito ({cartItems.length})
            </button>
          </div>
        )}
      </nav>

      {/* HERO SECTION */}
      <section className="relative w-full h-[80vh] flex items-center justify-center overflow-hidden pt-20">
        <div className="absolute inset-0 z-0">
          {/* Background Image/Pattern */}
          <div
            className="w-full h-full bg-dark"
            style={{
              backgroundImage: `
                radial-gradient(circle at 50% 50%, rgba(255, 0, 110, 0.15) 0%, transparent 50%),
                radial-gradient(circle at 80% 20%, rgba(0, 255, 255, 0.15) 0%, transparent 40%),
                url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")
              `,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-dark/20 to-dark" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 text-center w-full">
          <h1 className="mb-6 animate-fade-in font-heading text-6xl md:text-9xl font-bold leading-tight drop-shadow-[0_0_25px_rgba(255,0,110,0.5)]">
            <span className="text-white">Colecciona</span>
            <br />
            <span className="bg-gradient-to-r from-magenta via-purple to-cyan bg-clip-text text-transparent drop-shadow-none">
              Tu Pasión
            </span>
          </h1>

          <p className="text-xl md:text-3xl text-cyan mb-10 max-w-2xl mx-auto animate-fade-in opacity-0 font-light tracking-wide drop-shadow-[0_0_10px_rgba(0,255,255,0.4)]" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
            La tienda de Funko Pops más cool de Manizales
          </p>

          <div className="flex gap-6 justify-center flex-wrap animate-fade-in opacity-0" style={{ animationDelay: '0.4s', animationFillMode: 'forwards' }}>
            <a href="#shop" className="px-10 py-4 bg-magenta text-white text-lg rounded-full font-bold shadow-[0_0_20px_rgba(255,0,110,0.4)] hover:scale-110 hover:shadow-[0_0_40px_rgba(255,0,110,0.8)] transition-all duration-300 border border-white/10">
              Ver Catálogo
            </a>
            <a href="#contact" className="px-10 py-4 bg-transparent border-2 border-cyan text-cyan text-lg rounded-full font-bold hover:bg-cyan hover:text-dark hover:shadow-[0_0_30px_rgba(0,255,255,0.6)] transition-all duration-300">
              Contáctanos
            </a>
          </div>
        </div>
      </section>

      {/* SHOP SECTION */}
      <section id="shop" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row gap-8">
            {/* GRID PRINCIPAL */}
            <div className="flex-1">
              <div className="mb-8 flex items-center justify-between">
                <h2 className="text-3xl font-heading font-bold">Catálogo Disponible</h2>
                <span className="text-gray-400">{products.length} Productos</span>
              </div>

              <ProductGrid
                products={products}
                cartItems={cartItems}
                onAddToCart={addToCart}
                onRemoveItem={removeFromCart}
              />
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-dark-2 border-t border-gray-800 py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-500 text-sm">Copyright © 2025 CasaFunko | Hecho con 💜 en Colombia</p>
        </div>
      </footer>

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
