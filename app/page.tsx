'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import ProductGrid from '@/components/ProductGrid';
import Cart from '@/components/Cart';
import { Product, CartItem } from '@/types';
import Toast from '@/components/Toast';
import Image from 'next/image';

'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import ProductGrid from '@/components/ProductGrid';
import Cart from '@/components/Cart';
import { Product, CartItem } from '@/types';
import Toast from '@/components/Toast';
import Image from 'next/image';
import ProductFilters, { FilterState } from '@/components/ProductFilters';

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [toast, setToast] = useState<{ visible: boolean; product?: Product }>({ visible: false });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(0);
  const [navbarBg, setNavbarBg] = useState(false);

  // Filter State
  const [filters, setFilters] = useState<FilterState>({
    minPrice: '',
    maxPrice: '',
    category: '',
    rarity: '',
    search: '',
  });
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [filters]); // Re-fetch when filters change

  const fetchCategories = async () => {
    const { data } = await supabase.from('products').select('category');
    if (data) {
      // Extract unique categories
      const uniqueCats = Array.from(new Set(data.map(p => p.category).filter(Boolean))) as string[];
      setCategories(uniqueCats);
    }
  };

  const fetchProducts = async () => {
    let query = supabase.from('products').select('*');

    // Apply Filters
    if (filters.search) {
      query = query.ilike('name', `%${filters.search}%`);
    }
    if (filters.category) {
      query = query.eq('category', filters.category);
    }
    if (filters.minPrice !== '') {
      query = query.gte('price', filters.minPrice);
    }
    if (filters.maxPrice !== '') {
      query = query.lte('price', filters.maxPrice);
    }

    // Rarity Filter (Client-side or complex OR logic)
    // Since Supabase OR syntax can be tricky with other AND filters in simple query builder,
    // we'll fetch and then filter for rarity if needed, OR use a text search on description/name
    if (filters.rarity) {
      // Using ilike on name or description for the rarity term
      // Note: This might conflict with the search filter if not careful, but for now we'll chain it
      // A better approach for "OR" across columns with "AND" for other filters requires raw SQL or advanced syntax
      // For simplicity/robustness here, let's filter rarity client-side after fetch if the dataset is small,
      // OR use a specific column if we had one. Let's try to add it to the query as a text match.
      // query = query.textSearch('description', filters.rarity); // Requires FTS setup
      // Let's stick to simple client-side filtering for rarity for now to avoid complex query errors
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } else {
      let filteredData = data || [];

      // Client-side Rarity Filter
      if (filters.rarity) {
        const term = filters.rarity.toLowerCase();
        filteredData = filteredData.filter(p =>
          p.name.toLowerCase().includes(term) ||
          (p.description && p.description.toLowerCase().includes(term))
        );
      }

      setProducts(filteredData);
    }
  };

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
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${navbarBg ? 'bg-black/80 backdrop-blur-md' : ''}`}
      >
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2 group">
            <div className="relative w-16 h-16 group-hover:scale-105 transition-transform">
              <Image
                src="/logo.png"
                alt="Casa Funko Colombia"
                fill
                className="object-contain drop-shadow-[0_0_10px_rgba(0,255,255,0.5)]"
                priority
              />
            </div>
          </a>

          {/* Menu Desktop */}
          <div className="hidden md:flex gap-8 items-center font-medium">
            <a href="/blog" className="text-gray-300 hover:text-cyan transition">Blog</a>
            <a href="#shop" className="text-cyan hover:text-white transition">Tienda</a>
            <a href="#contact" className="text-gray-300 hover:text-cyan transition">Contacto</a>
          </div>

          {/* CTA + Cart */}
          <div className="flex gap-4 items-center">
            <button
              onClick={() => setCartOpen(true)}
              className="hidden sm:flex items-center gap-2 text-white hover:text-magenta transition"
            >
              <span>🛒</span>
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
      <section className="relative w-full h-[70vh] flex items-center justify-center overflow-hidden pt-20">
        <div className="absolute inset-0 z-0">
          <div
            className="w-full h-full bg-gradient-to-br from-magenta/20 via-purple/10 to-cyan/20"
            style={{
              backgroundImage: 'url("data:image/svg+xml,%3Csvg width=%22100%22 height=%22100%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Ccircle cx=%2250%22 cy=%2250%22 r=%2240%22 fill=%22%23FF006E%22 opacity=%220.05%22/%3E%3C/svg%3E")',
              backgroundSize: '100px 100px'
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-dark/50 via-dark/30 to-dark/70" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 text-center w-full">
          <h1 className="mb-6 animate-fade-in font-heading text-5xl md:text-8xl font-bold leading-tight">
            <span className="text-white">Colecciona</span>
            <br />
            <span className="bg-gradient-to-r from-magenta to-cyan bg-clip-text text-transparent">
              Tu Pasión
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-cyan mb-8 max-w-2xl mx-auto animate-fade-in opacity-0" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
            La tienda de Funko Pops más cool de Manizales
          </p>

          <div className="flex gap-4 justify-center flex-wrap animate-fade-in opacity-0" style={{ animationDelay: '0.4s', animationFillMode: 'forwards' }}>
            <a href="#shop" className="px-8 py-3 bg-magenta text-white rounded-lg font-bold shadow-[0_0_20px_rgba(255,0,110,0.3)] hover:scale-105 hover:shadow-[0_0_30px_rgba(255,0,110,0.6)] transition-all">
              Ver Catálogo
            </a>
          </div>
        </div>
      </section>

      {/* SHOP SECTION */}
      <section id="shop" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row gap-8">
            {/* SIDEBAR FILTERS */}
            <aside className="w-full md:w-64 flex-shrink-0">
              <ProductFilters onFilterChange={setFilters} categories={categories} />
            </aside>

            {/* GRID PRINCIPAL */}
            <div className="flex-1">
              <div className="mb-8 flex items-center justify-between">
                <h2 className="text-3xl font-heading font-bold">Catálogo Disponible</h2>
                <span className="text-gray-400">{products.length} Productos</span>
              </div>

              {products.length > 0 ? (
                <ProductGrid
                  products={products}
                  cartItems={cartItems}
                  onAddToCart={addToCart}
                  onRemoveItem={removeFromCart}
                />
              ) : (
                <div className="text-center py-20 bg-dark-2 rounded-xl border border-gray-800">
                  <p className="text-xl text-gray-400 mb-2">No se encontraron productos 😢</p>
                  <p className="text-sm text-gray-500">Intenta ajustar tus filtros de búsqueda.</p>
                </div>
              )}
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
