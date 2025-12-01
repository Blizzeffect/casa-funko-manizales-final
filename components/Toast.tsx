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
            }, 5000); // Increased time to allow interaction
            return () => clearTimeout(timer);
        }
    }, [isVisible, onClose]);

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-4 right-4 z-50 animate-slide-up">
            <div
                className="bg-black/95 border-2 border-green-500 p-4 rounded-lg shadow-[0_0_20px_rgba(34,197,94,0.3)] max-w-sm"
                style={{ backdropFilter: 'blur(8px)' }}
            >
                <div className="flex items-start gap-4 mb-3">
                    {product && (
                        <div className="w-12 h-12 bg-white/10 rounded overflow-hidden flex-shrink-0">
                            <img
                                src={product.image_url}
                                alt={product.name}
                                className="w-full h-full object-contain"
                            />
                        </div>
                    )}
                    <div className="flex-1">
                        <h4 className="text-green-400 font-mono font-bold text-sm flex items-center gap-2">
                            <span>✓</span> {message}
                        </h4>
                        {product && (
                            <p className="text-gray-300 text-xs truncate max-w-[200px] mt-1">
                                {product.name}
                            </p>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-white transition-colors -mt-1 -mr-1"
                    >
                        ✕
                    </button>
                </div>

                <div className="flex gap-2 mt-2">
                    <button
                        onClick={() => {
                            onViewCart();
                            onClose();
                        }}
                        className="flex-1 bg-yellow-400 text-black text-xs font-bold py-2 px-3 rounded hover:bg-yellow-300 transition-colors font-mono"
                    >
                        VER CARRITO
                    </button>
                    <button
                        onClick={onClose}
                        className="flex-1 border border-gray-600 text-gray-300 text-xs py-2 px-3 rounded hover:border-gray-400 hover:text-white transition-colors font-mono"
                    >
                        SEGUIR COMPRANDO
                    </button>
                </div>
            </div>
        </div>
    );
}
