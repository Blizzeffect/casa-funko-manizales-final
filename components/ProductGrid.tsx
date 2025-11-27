'use client';

interface Product {
  id: number;
  name: string;
  price: number;
  image_url: string;
  stock: number;
  description: string;
}

export default function ProductGrid({ products, onAddToCart }: any) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-8">
      {products.map((product: Product) => (
        <div
          key={product.id}
          className="relative border-2 border-cyan-500 bg-black/80 backdrop-blur overflow-hidden group hover:border-yellow-400 transition-all"
          style={{
            boxShadow: 'inset 0 0 20px rgba(0, 212, 255, 0.1), 0 0 20px rgba(0, 212, 255, 0.3)',
          }}
        >
          {/* Imagen */}
          <div className="relative h-64 overflow-hidden border-b-2 border-cyan-500/30">
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
            {product.stock <= 1 && (
              <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 text-xs font-mono">
                ÚLTIMO
              </div>
            )}
          </div>

          {/* Info */}
          <div className="p-4">
            <h3 className="text-lg font-mono font-bold text-cyan-400 mb-2 truncate">
              {product.name}
            </h3>
            <p className="text-xs text-cyan-300/70 mb-3 line-clamp-2">
              {product.description}
            </p>

            <div className="flex justify-between items-center mb-4">
              <div>
                <p className="text-yellow-400 font-mono font-bold text-lg">
                  ${product.price.toLocaleString('es-CO')}
                </p>
                <p className="text-xs text-cyan-500/50">Stock: {product.stock}</p>
              </div>
            </div>

            <button
              onClick={() => onAddToCart(product)}
              disabled={product.stock === 0}
              className="w-full py-2 border-2 border-yellow-400 bg-black text-yellow-400 font-mono hover:bg-yellow-400/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              style={{
                boxShadow: product.stock > 0 ? '0 0 10px rgba(255, 255, 0, 0.3)' : 'none',
              }}
            >
              {product.stock > 0 ? `${`>>`} COMPRAR` : 'AGOTADO'}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
