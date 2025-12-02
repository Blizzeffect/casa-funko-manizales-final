'use client';

import { useEffect, useState, use } from 'react';
import { supabase } from '@/lib/supabase';
import { Product, CartItem, Post } from '@/types';
import Toast from '@/components/Toast';
import Cart from '@/components/Cart';
import Image from 'next/image';

export default function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
    // Unwrap params using React.use()
    const { slug } = use(params);

    const [post, setPost] = useState<Post | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [cartOpen, setCartOpen] = useState(false);
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [toast, setToast] = useState<{ visible: boolean; product?: Product }>({ visible: false });
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(0);
    const [navbarBg, setNavbarBg] = useState(false);

    // Fetch Post & Products
    useEffect(() => {
        const fetchData = async () => {
            // Fetch Post
            const { data: postData } = await supabase
                .from('posts')
                .select('*')
                .eq('slug', slug)
                .single();

            if (postData) setPost(postData);

            // Fetch Bestsellers (for funnel)
            const { data: productsData } = await supabase
                .from('products')
                .select('*')
                .limit(4);

            if (productsData) setProducts(productsData);
        };
        fetchData();
    }, [slug]);

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

    if (!post) {
        return (
            <div className="min-h-screen bg-dark flex items-center justify-center text-white">
                <div className="animate-pulse">Cargando artículo...</div>
            </div>
        );
    }

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
                    <a href="/" className="flex items-center gap-2 group">
                        <div className="relative w-16 h-16 group-hover:scale-105 transition-transform">
                            <Image
                                src="/logo.png"
                                alt="Casa Funko Colombia"
                                fill
                                className="object-contain drop-shadow-[0_0_10px_rgba(0,255,255,0.5)]"
                            />
                        </div>
                    </a>

                    {/* Menu Desktop */}
                    <div className="hidden md:flex gap-8 items-center font-medium">
                        <a href="/blog" className="text-cyan hover:text-white transition">← Volver al Blog</a>
                        <a href="/#shop" className="text-gray-300 hover:text-cyan transition">Tienda</a>
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
                        <a href="/blog" className="block px-4 py-3 text-cyan hover:bg-dark" onClick={() => setMobileMenuOpen(false)}>← Volver al Blog</a>
                        <a href="/#shop" className="block px-4 py-3 text-gray-300 hover:bg-dark" onClick={() => setMobileMenuOpen(false)}>Tienda</a>
                        <button
                            onClick={() => { setCartOpen(true); setMobileMenuOpen(false); }}
                            className="w-full text-left px-4 py-3 text-magenta font-bold hover:bg-dark"
                        >
                            🛒 Ver Carrito ({cartItems.length})
                        </button>
                    </div>
                )}
            </nav>

            {/* ARTICLE HERO */}
            <header className="relative w-full h-[60vh] flex items-center justify-center overflow-hidden pt-20">
                <div className="absolute inset-0 z-0">
                    {post.image_url ? (
                        <Image
                            src={post.image_url}
                            alt={post.title}
                            fill
                            className="object-cover opacity-40"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-magenta/20 via-purple/10 to-cyan/20" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-b from-dark/80 via-dark/50 to-dark" />
                </div>

                <div className="relative z-10 max-w-4xl mx-auto px-4 text-center w-full">
                    <span className="inline-block px-4 py-1 mb-6 rounded-full text-sm font-bold bg-cyan/20 text-cyan border border-cyan/30">
                        {post.category}
                    </span>
                    <h1 className="mb-6 font-heading text-4xl md:text-6xl font-bold leading-tight text-white">
                        {post.title}
                    </h1>
                    <div className="flex items-center justify-center gap-6 text-gray-400 text-sm">
                        <span>⏱️ {post.reading_time}</span>
                        <time>{new Date(post.published_at).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })}</time>
                    </div>
                </div>
            </header>

            {/* ARTICLE CONTENT */}
            <article className="max-w-3xl mx-auto px-4 py-12">
                <div className="prose prose-invert prose-lg max-w-none">
                    <p className="lead text-xl text-gray-300 mb-8 font-medium border-l-4 border-magenta pl-4">
                        {post.excerpt}
                    </p>
                    <div className="text-gray-300 space-y-6 whitespace-pre-line">
                        {post.content}
                    </div>
                </div>
            </article>

            {/* FUNNEL / BESTSELLERS */}
            <section className="py-20 bg-dark-2/50 border-t border-gray-800">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-heading font-bold mb-4">Completa tu Colección</h2>
                        <p className="text-gray-400">Productos relacionados que te podrían gustar</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {products.map((product) => (
                            <div key={product.id} className="bg-dark rounded-xl p-6 shadow-lg group hover:-translate-y-2 transition-transform duration-300 border border-gray-800 hover:border-magenta/50">
                                <div className="relative h-48 mb-4 overflow-hidden rounded-lg bg-dark-2 flex items-center justify-center">
                                    <Image
                                        src={product.image_url}
                                        alt={product.name}
                                        fill
                                        className="object-contain group-hover:scale-110 transition-transform duration-300 p-4"
                                    />
                                </div>
                                <h3 className="font-bold mb-2 font-heading truncate">{product.name}</h3>
                                <div className="text-xl font-bold text-magenta mb-4">
                                    ${product.price.toLocaleString('es-CO')}
                                </div>
                                <button
                                    onClick={() => addToCart(product)}
                                    className="w-full py-2 rounded font-bold bg-cyan text-black hover:bg-cyan/90 transition-colors"
                                >
                                    + Agregar
                                </button>
                            </div>
                        ))}
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
