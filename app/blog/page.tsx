'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Product, CartItem, Post } from '@/types';
import Toast from '@/components/Toast';
import Cart from '@/components/Cart';
import Image from 'next/image';

export default function BlogPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [posts, setPosts] = useState<Post[]>([]);
    const [cartOpen, setCartOpen] = useState(false);
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [toast, setToast] = useState<{ visible: boolean; product?: Product }>({ visible: false });
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(0);
    const [navbarBg, setNavbarBg] = useState(false);

    // Fetch Products & Posts
    useEffect(() => {
        const fetchData = async () => {
            // Products
            const { data: productsData } = await supabase.from('products').select('*').limit(4);
            if (productsData) setProducts(productsData);

            // Posts
            const { data: postsData } = await supabase.from('posts').select('*').order('published_at', { ascending: false });
            if (postsData) setPosts(postsData);
        };
        fetchData();
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
                    <a href="/" className="flex items-center gap-2 group">
                        <div className="relative w-32 h-32 group-hover:scale-110 transition-transform duration-300">
                            <Image
                                src="/logo.png"
                                alt="Casa Funko Colombia"
                                fill
                                className="object-contain drop-shadow-[0_0_5px_rgba(0,255,255,0.8)]"
                            />
                        </div>
                    </a>

                    {/* Menu Desktop */}
                    <div className="hidden md:flex gap-8 items-center font-medium">
                        <a href="#blog" className="text-gray-300 hover:text-cyan hover:drop-shadow-[0_0_5px_rgba(0,255,255,0.8)] transition">Blog</a>
                        <a href="#shop" className="text-gray-300 hover:text-cyan hover:drop-shadow-[0_0_5px_rgba(255,0,110,0.8)] transition">Tienda</a>
                        <a href="#gallery" className="text-gray-300 hover:text-cyan hover:drop-shadow-[0_0_5px_rgba(0,255,255,0.8)] transition">Galería</a>
                        <a href="#contact" className="text-gray-300 hover:text-cyan hover:drop-shadow-[0_0_5px_rgba(255,0,110,0.8)] transition">Contacto</a>
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
                        <a href="#blog" className="block px-4 py-3 text-gray-300 hover:bg-dark" onClick={() => setMobileMenuOpen(false)}>Blog</a>
                        <a href="#shop" className="block px-4 py-3 text-gray-300 hover:bg-dark" onClick={() => setMobileMenuOpen(false)}>Tienda</a>
                        <a href="#gallery" className="block px-4 py-3 text-gray-300 hover:bg-dark" onClick={() => setMobileMenuOpen(false)}>Galería</a>
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
            <section className="relative w-full h-screen flex items-center justify-center overflow-hidden pt-20">

                {/* Background */}
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

                {/* Content */}
                <div className="relative z-10 max-w-7xl mx-auto px-4 text-center w-full">
                    <h1 className="mb-6 animate-fade-in font-heading text-5xl md:text-7xl font-bold leading-tight drop-shadow-[0_0_25px_rgba(255,0,110,0.5)]">
                        <span className="text-white">Tu Gaming Room,</span>
                        <br />
                        <span className="bg-gradient-to-r from-magenta to-cyan bg-clip-text text-transparent drop-shadow-none">
                            Elevada
                        </span>
                    </h1>

                    <p className="text-xl md:text-2xl text-cyan mb-8 max-w-2xl mx-auto animate-fade-in opacity-0 font-light tracking-wide drop-shadow-[0_0_10px_rgba(0,255,255,0.4)]" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
                        Decora con Funko Pop, Juega sin límites
                    </p>

                    {/* CTAs */}
                    <div className="flex gap-6 justify-center flex-wrap animate-fade-in opacity-0" style={{ animationDelay: '0.4s', animationFillMode: 'forwards' }}>
                        <a href="#shop" className="px-8 py-3 bg-magenta text-white rounded-lg font-bold shadow-[0_0_20px_rgba(255,0,110,0.3)] hover:scale-105 hover:shadow-[0_0_30px_rgba(255,0,110,0.6)] transition-all">
                            Explorar Colecciones
                        </a>
                        <a href="#gallery" className="px-8 py-3 border-2 border-cyan text-cyan rounded-lg font-bold hover:bg-cyan hover:text-dark transition-all hover:shadow-[0_0_20px_rgba(0,255,255,0.4)]">
                            Ver Galería
                        </a>
                    </div>
                </div>

                {/* Scroll Indicator */}
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10 animate-pulse">
                    <div className="text-cyan text-2xl">↓</div>
                </div>
            </section>

            {/* SOCIAL PROOF */}
            <section className="py-16 bg-dark-2/50">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        <div className="text-center">
                            <div className="text-4xl font-bold text-cyan mb-2 font-heading">5.2K</div>
                            <div className="text-gray-400 text-sm">Seguidores</div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-bold text-cyan mb-2 font-heading">120+</div>
                            <div className="text-gray-400 text-sm">Artículos</div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-bold text-cyan mb-2 font-heading">25K</div>
                            <div className="text-gray-400 text-sm">Lectores/Mes</div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-bold text-cyan mb-2 font-heading">11%</div>
                            <div className="text-gray-400 text-sm">Crecimiento</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* BLOG PREVIEW */}
            <section id="blog" className="py-20 bg-gradient-to-br from-magenta/5 to-purple/5">
                <div className="max-w-7xl mx-auto px-4">

                    <div className="text-center mb-16">
                        <h2 className="mb-4 text-3xl md:text-4xl font-heading font-bold">Artículos Destacados</h2>
                        <p className="text-gray-400">Consejos, guías y tendencias del mundo gaming</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 mb-12">

                        {posts.length > 0 ? (
                            posts.map((post) => (
                                <div key={post.id} className="bg-dark-2 rounded-xl p-6 shadow-lg hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(255,0,110,0.2)] transition-all cursor-pointer group">
                                    <div className="relative h-48 mb-4 overflow-hidden rounded-lg bg-dark">
                                        {post.image_url ? (
                                            <Image
                                                src={post.image_url}
                                                alt={post.title}
                                                fill
                                                className="object-cover group-hover:scale-110 transition-transform duration-300"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-magenta/50 to-cyan/50 flex items-center justify-center text-4xl">
                                                📝
                                            </div>
                                        )}
                                        <div className="absolute top-4 left-4">
                                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-cyan/20 text-cyan">{post.category}</span>
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-bold mb-2 line-clamp-2 font-heading group-hover:text-magenta transition-colors">
                                        {post.title}
                                    </h3>
                                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                                        {post.excerpt}
                                    </p>
                                    <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                                        <span>⏱️ {post.reading_time}</span>
                                        <time>{new Date(post.published_at).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })}</time>
                                    </div>
                                    <a href={`/blog/${post.slug}`} className="text-magenta font-bold group-hover:text-cyan transition-colors">
                                        → Leer Artículo
                                    </a>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-3 text-center text-gray-500 py-12">
                                <p>Cargando artículos...</p>
                            </div>
                        )}

                    </div>

                    <div className="text-center">
                        <button className="px-6 py-3 bg-magenta text-white rounded-lg font-bold hover:bg-magenta/80 transition-colors shadow-lg">
                            Ver Todos los Artículos
                        </button>
                    </div>
                </div>
            </section>

            {/* TESTIMONIALS */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4">
                    <h2 className="text-center mb-16 text-3xl md:text-4xl font-heading font-bold">Lo que dicen nuestros clientes</h2>

                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="bg-dark-2 p-8 rounded-xl shadow-lg">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="text-yellow-400">★★★★★</span>
                            </div>
                            <p className="text-gray-300 mb-6 italic">
                                "Transformó mi cuarto completamente. Contenido excelente y productos de mucha calidad. ¡Recomendado!"
                            </p>
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-magenta to-cyan rounded-full flex items-center justify-center font-bold">
                                    JM
                                </div>
                                <div>
                                    <div className="font-bold">Juan Martínez</div>
                                    <div className="text-cyan text-sm">🏙️ Bogotá • Coleccionista</div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-dark-2 p-8 rounded-xl shadow-lg">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="text-yellow-400">★★★★★</span>
                            </div>
                            <p className="text-gray-300 mb-6 italic">
                                "Me ayudó a entender el mercado de Funko Pops. Las guías son súper útiles y el blog actualizado."
                            </p>
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-purple to-pink-500 rounded-full flex items-center justify-center font-bold">
                                    MP
                                </div>
                                <div>
                                    <div className="font-bold">María Pérez</div>
                                    <div className="text-cyan text-sm">🏙️ Medellín • Gamer</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* NEWSLETTER CTA */}
            <section className="py-16 bg-gradient-to-r from-magenta to-purple">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <h2 className="mb-4 text-white text-3xl font-heading font-bold">Únete a 5K+ Gamers Colombianos</h2>
                    <p className="text-white/80 mb-8 text-lg">
                        Recibe guías gratis + ofertas exclusivas
                    </p>

                    <form
                        className="flex gap-2 max-w-md mx-auto mb-4"
                        onSubmit={(e) => { e.preventDefault(); alert('¡Gracias por suscribirte!'); }}
                    >
                        <input
                            type="email"
                            placeholder="tu@email.com"
                            className="flex-1 px-4 py-3 bg-black/20 text-white placeholder-gray-400 rounded border border-white/20 focus:border-cyan outline-none transition"
                            required
                        />
                        <button
                            type="submit"
                            className="px-6 py-3 bg-cyan text-black font-bold rounded hover:bg-cyan/90 transition"
                        >
                            Suscribir
                        </button>
                    </form>

                    <p className="text-sm text-white/60">
                        Tu privacidad está protegida. Puedes desuscribirte en cualquier momento.
                    </p>
                </div>
            </section>

            {/* PRODUCTS SECTION */}
            <section id="shop" className="py-20">
                <div className="max-w-7xl mx-auto px-4">
                    <h2 className="mb-12 text-3xl md:text-4xl font-heading font-bold">Bestsellers</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {products.map((product) => (
                            <div key={product.id} className="bg-dark-2 rounded-xl p-6 shadow-lg group hover:-translate-y-2 transition-transform duration-300">
                                <div className="relative h-56 mb-4 overflow-hidden rounded-lg bg-dark flex items-center justify-center">
                                    <Image
                                        src={product.image_url}
                                        alt={product.name}
                                        fill
                                        className="object-contain group-hover:scale-110 transition-transform duration-300 p-4"
                                    />
                                </div>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-yellow-400">★</span>
                                    <span className="text-sm text-gray-400">5.0 ({Math.floor(Math.random() * 100) + 50})</span>
                                </div>
                                <h3 className="font-bold mb-2 font-heading truncate">{product.name}</h3>
                                <div className="text-2xl font-bold text-magenta mb-4">
                                    ${product.price.toLocaleString('es-CO')}
                                </div>
                                <button
                                    onClick={() => addToCart(product)}
                                    className="w-full py-2 rounded font-bold bg-magenta hover:bg-magenta/80 text-white transition-colors"
                                >
                                    + Agregar Carrito
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="bg-dark-2 border-t border-gray-800 py-16">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid md:grid-cols-4 gap-8 mb-8">
                        <div>
                            <h4 className="font-bold mb-4 text-magenta font-heading">Blog</h4>
                            <ul className="space-y-2 text-gray-400 text-sm">
                                <li><a href="#" className="hover:text-cyan transition">Gaming</a></li>
                                <li><a href="#" className="hover:text-cyan transition">Coleccionismo</a></li>
                                <li><a href="#" className="hover:text-cyan transition">Diseño</a></li>
                                <li><a href="#" className="hover:text-cyan transition">DIY</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold mb-4 text-magenta font-heading">Tienda</h4>
                            <ul className="space-y-2 text-gray-400 text-sm">
                                <li><a href="#" className="hover:text-cyan transition">Funko Pops</a></li>
                                <li><a href="#" className="hover:text-cyan transition">Iluminación</a></li>
                                <li><a href="#" className="hover:text-cyan transition">Estanterías</a></li>
                                <li><a href="#" className="hover:text-cyan transition">Accesorios</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold mb-4 text-magenta font-heading">Comunidad</h4>
                            <ul className="space-y-2 text-gray-400 text-sm">
                                <li><a href="#" className="hover:text-cyan transition">Discord</a></li>
                                <li><a href="#" className="hover:text-cyan transition">Instagram</a></li>
                                <li><a href="#" className="hover:text-cyan transition">TikTok</a></li>
                                <li><a href="#" className="hover:text-cyan transition">YouTube</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold mb-4 text-magenta font-heading">Legal</h4>
                            <ul className="space-y-2 text-gray-400 text-sm">
                                <li><a href="#" className="hover:text-cyan transition">Privacidad</a></li>
                                <li><a href="#" className="hover:text-cyan transition">Términos</a></li>
                                <li><a href="#" className="hover:text-cyan transition">Devoluciones</a></li>
                                <li><a href="#" className="hover:text-cyan transition">Contacto</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-gray-800 pt-8 text-center text-gray-500 text-sm">
                        <p>Copyright © 2025 CasaFunko | Hecho con 💜 en Colombia</p>
                    </div>
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
