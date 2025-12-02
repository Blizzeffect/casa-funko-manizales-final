import Image from 'next/image';
import { env } from '@/lib/env';
import { Product, CartItem } from '@/types';
import WishlistButton from './WishlistButton';

const TEMPLATE_BACKGROUND_URLS: Record<string, string> = {
  default: env.NEXT_PUBLIC_SUPABASE_STORAGE_URL,
};

interface ProductGridProps {
  products: Product[];
  cartItems: CartItem[];
  onAddToCart: (product: Product) => void;
  onRemoveItem: (cartId: string) => void;
}

export default function ProductGrid({ products, cartItems, onAddToCart, onRemoveItem }: ProductGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-8">
      {products.map((product: Product) => {
        const templateKey = product.template || 'default';
        const bgUrl =
          TEMPLATE_BACKGROUND_URLS[templateKey] ||
          TEMPLATE_BACKGROUND_URLS.default;

        // Calcular cantidad en carrito
        const productInCart = cartItems.filter((item) => item.id === product.id);
        const qtyInCart = productInCart.length;
        const isMaxStock = qtyInCart >= product.stock;

        return (
          <div
            key={product.id}
            className="group bg-dark-2 rounded-xl overflow-hidden shadow-lg hover:-translate-y-2 transition-transform duration-300 border border-gray-800 hover:border-magenta/50"
          >
            {/* Imagen + plantilla */}
            <div className="relative h-64 overflow-hidden bg-dark flex items-center justify-center">
              <div
                className="absolute inset-0 opacity-50"
                style={{
                  backgroundImage: `url(${bgUrl})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  filter: 'brightness(0.5)',
                }}
              />

              {/* Wishlist Button - Top Right */}
              <div className="absolute top-2 right-2 z-30">
                <WishlistButton product={product} />
              </div>

              <div className="relative w-full h-full flex items-center justify-center p-4">
                <Image
                  src={product.image_url}
                  alt={product.name}
                  width={300}
                  height={300}
                  className="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform duration-300 drop-shadow-[0_0_10px_rgba(0,0,0,0.5)]"
                />
              </div>

              {product.stock <= 1 && product.stock > 0 && (
                <div className="absolute top-2 left-2 bg-orange-500 text-white px-3 py-1 text-xs font-bold rounded-full shadow-lg z-20">
                  ¡ÚLTIMO!
                </div>
              )}

              {product.stock === 0 && (
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-10 backdrop-blur-sm">
                  <div className="bg-red-600 text-white px-6 py-2 font-heading font-bold text-xl transform -rotate-12 shadow-2xl border-2 border-white">
                    AGOTADO
                  </div>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="p-6">
              <h3 className="text-xl font-heading font-bold text-white mb-2 truncate group-hover:text-magenta transition-colors">
                {product.name}
              </h3>
              <p className="text-sm text-gray-400 mb-4 line-clamp-2 min-h-[2.5em]">
                {product.description}
              </p>

              <div className="flex justify-between items-end mb-6">
                <div>
                  <p className="text-2xl font-bold text-magenta">
                    ${product.price.toLocaleString('es-CO')}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Stock: {product.stock}
                  </p>
                </div>
              </div>

              {qtyInCart > 0 ? (
                <div className="flex items-center justify-between bg-dark rounded-lg p-1 border border-gray-700">
                  <button
                    onClick={() => onRemoveItem(productInCart[0].cartId)}
                    className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 rounded-md transition-colors font-bold text-lg"
                  >
                    -
                  </button>
                  <span className="text-white font-bold text-lg">
                    {qtyInCart}
                  </span>
                  <button
                    onClick={() => onAddToCart(product)}
                    disabled={isMaxStock}
                    className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 rounded-md transition-colors font-bold text-lg disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    +
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => onAddToCart(product)}
                  disabled={product.stock === 0}
                  className="w-full py-3 rounded-lg font-bold transition-all shadow-lg bg-cyan text-black hover:bg-cyan/90 hover:shadow-[0_0_15px_rgba(0,245,255,0.4)] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:bg-gray-700 disabled:text-gray-500"
                >
                  {product.stock > 0 ? 'Agregar al Carrito' : 'Sin Stock'}
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
