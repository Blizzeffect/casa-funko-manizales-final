import { Product } from '@/types';
import { useEffect } from 'react';

interface ToastProps {
    message: string;
    product?: Product;
    isVisible: boolean;
    onClose: () => void;
    onViewCart: () => void;
}

export default function Toast({ message, product, isVisible, onClose, onViewCart }: ToastProps) {
    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(() => {
                onClose();
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [isVisible, onClose]);

    if (!isVisible) return null;

    return (
        <>
            <style jsx>{`
        @keyframes slideDown {
          from { transform: translateY(-100%); }
          to { transform: translateY(0); }
        }
        .animate-slide-down {
          animation: slideDown 0.3s ease-out forwards;
        }
      `}</style>
            <div className="fixed top-0 left-0 w-full z-50 animate-slide-down">
                <div
                    className="bg-black/95 border-b-2 border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.3)]"
                    style={{ backdropFilter: 'blur(8px)' }}
                >
                    <div className="max-w-7xl mx-auto p-6 flex flex-col sm:flex-row items-center justify-between gap-6">

                        {/* Left Side: Message & Product */}
                        <div className="flex items-center gap-6 w-full sm:w-auto">
                            {product && (
                                <div className="w-20 h-20 bg-white/10 rounded overflow-hidden flex-shrink-0">
                                    <img
                                        src={product.image_url}
                                        alt={product.name}
                                        className="w-full h-full object-contain"
                                    />
                                </div>
                            )}
                            <div className="flex-1">
                                <h4 className="text-green-400 font-mono font-bold text-lg flex items-center gap-3">
                                    <span className="bg-green-500 text-black rounded-full w-6 h-6 flex items-center justify-center text-sm">✓</span>
                                    {message}
                                </h4>
                                {product && (
                                    <p className="text-gray-300 text-base truncate max-w-[200px] sm:max-w-lg mt-2">
                                        {product.name}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Right Side: Actions */}
                        <div className="flex items-center gap-4 w-full sm:w-auto">
                            <button
                                onClick={() => {
                                    onViewCart();
                                    onClose();
                                }}
                                className="flex-1 sm:flex-none bg-yellow-400 text-black text-base font-bold py-3 px-8 rounded hover:bg-yellow-300 transition-colors font-mono whitespace-nowrap"
                            >
                                VER CARRITO
                            </button>
                            <button
                                onClick={onClose}
                                className="flex-1 sm:flex-none border border-gray-600 text-gray-300 text-base py-3 px-6 rounded hover:border-gray-400 hover:text-white transition-colors font-mono whitespace-nowrap"
                            >
                                SEGUIR COMPRANDO
                            </button>
                            <button
                                onClick={onClose}
                                className="text-gray-500 hover:text-white transition-colors p-2"
                            >
                                ✕
                            </button>
                        </div>

                    </div>
                </div>
            </div>
        </>
    );
}
